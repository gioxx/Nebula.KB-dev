import React, { useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import Admonition from '@theme/Admonition';

function unfoldHeaderLines(raw) {
    const lines = (raw || '').replace(/\r\n?/g, '\n').split('\n');
    const unfolded = [];
    for (const line of lines) {
        if (/^\s/.test(line) && unfolded.length > 0) {
            unfolded[unfolded.length - 1] += ' ' + line.trim();
        } else if (line.trim().length) {
            unfolded.push(line.trimEnd());
        }
    }
    return unfolded;
}

function parseHeaderEntries(raw) {
    const entries = [];
    const map = {};
    unfoldHeaderLines(raw).forEach((line) => {
        const sepIndex = line.indexOf(':');
        if (sepIndex === -1) return;
        const name = line.slice(0, sepIndex).trim();
        const value = line.slice(sepIndex + 1).trim();
        const lower = name.toLowerCase();
        entries.push({ name, value });
        map[lower] = map[lower] ? [...map[lower], value] : [value];
    });
    return { entries, map };
}

function parseDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(dateObj, fallback = '') {
    if (!dateObj) return fallback;
    return dateObj.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    });
}

function parseReceivedLine(value) {
    const lastSemicolon = value.lastIndexOf(';');
    const dateStr = lastSemicolon !== -1 ? value.slice(lastSemicolon + 1).trim() : '';
    const envelope = lastSemicolon !== -1 ? value.slice(0, lastSemicolon).trim() : value;

    const fromMatch = envelope.match(/from\s+(.+?)\s+by\s+(.+?)(?:\s|$)/i);
    const byMatch = envelope.match(/\sby\s+(.+?)(?:\s|$)/i);
    const withMatch = envelope.match(/\swith\s+([^\s;]+)/i);

    const submittingHost = fromMatch ? fromMatch[1].trim() : '';
    const receivingHost = fromMatch ? fromMatch[2].trim() : byMatch ? byMatch[1].trim() : '';
    const protocol = withMatch ? withMatch[1].trim() : '';

    const dateObj = parseDate(dateStr);

    return {
        submittingHost,
        receivingHost,
        protocol,
        dateString: dateStr,
        dateObj,
        raw: value,
    };
}

function computeReceivedDelays(received) {
    return received.map((entry, idx) => {
        const next = received[idx + 1];
        let delaySeconds = null;
        if (entry.dateObj && next?.dateObj) {
            delaySeconds = Math.round((entry.dateObj.getTime() - next.dateObj.getTime()) / 1000);
        }
        return { ...entry, delaySeconds };
    });
}

function parseKeyValueHeader(value) {
    return value
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
            const match = part.match(/^([^:=\s]+)\s*[:=]\s*(.+)$/);
            return {
                key: match ? match[1].trim() : part,
                value: match ? match[2].trim() : '',
            };
        });
}

function parseAuthResults(authLines, receivedSpfLines) {
    const rows = [];
    const collect = (line, source) => {
        const matches = [...line.matchAll(/\b(spf|dkim|dmarc|arc)=([a-z0-9_-]+)/gi)];
        if (!matches.length) return;
        matches.forEach((m) => {
            const mechanism = m[1].toUpperCase();
            const result = m[2].toLowerCase();
            const domainMatch =
                line.slice(m.index + m[0].length).match(/header\.from=([^;\s]+)/i) ||
                line.slice(m.index + m[0].length).match(/header\.d=([^;\s]+)/i) ||
                line.slice(m.index + m[0].length).match(/smtp\.mailfrom=([^;\s]+)/i) ||
                line.slice(m.index + m[0].length).match(/\bd=([^;\s]+)/i);
            const detailMatch = line.slice(m.index + m[0].length).match(/\(([^)]*)\)/);
            rows.push({
                mechanism,
                result,
                domain: domainMatch ? domainMatch[1] : '',
                detail: detailMatch ? detailMatch[1].trim() : '',
                source,
            });
        });
    };

    (authLines || []).forEach((line) => collect(line, 'Authentication-Results'));

    (receivedSpfLines || []).forEach((line) => {
        const match = line.match(/^([A-Za-z]+)\s*\(/);
        const result = match ? match[1].toLowerCase() : '';
        const domainMatch = line.match(/sender\s+id\s+check\s+failed\s+for\s+([^;\s]+)/i) || line.match(/domain\s+of\s+([^;\s]+)/i);
        rows.push({
            mechanism: 'SPF',
            result: result || 'unknown',
            domain: domainMatch ? domainMatch[1] : '',
            detail: line,
            source: 'Received-SPF',
        });
    });

    return rows;
}

function formatSeconds(sec) {
    if (sec === null || sec === undefined) return 'n/a';
    const sign = sec < 0 ? '-' : '';
    const abs = Math.abs(sec);
    if (abs < 60) return `${sign}${abs} sec`;
    const minutes = Math.floor(abs / 60);
    const seconds = abs % 60;
    return `${sign}${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

function summarize(map, received) {
    const dateHeader = map['date']?.[0] || '';
    const dateObj = parseDate(dateHeader);
    const firstHop = received[0];
    const lastHop = received[received.length - 1];
    const totalTransitSeconds =
        firstHop?.dateObj && lastHop?.dateObj
            ? Math.round((firstHop.dateObj.getTime() - lastHop.dateObj.getTime()) / 1000)
            : null;

    return {
        subject: map['subject']?.[0] || '',
        messageId: map['message-id']?.[0] || '',
        from: map['from']?.[0] || '',
        to: map['to']?.[0] || '',
        dateHeader,
        dateObj,
        hopCount: received.length,
        totalTransitSeconds,
    };
}

const SAMPLE_HEADER = `Received: from mx.sender.example (mx.sender.example [203.0.113.21])
    by mail.protection.outlook.com (2603:10b6:510:1b::12) with ESMTPS id 1234567890abcdef
    for <recipient@example.com>; Tue, 10 Dec 2025 08:21:05 +0000
Received: from mail.sender.example (mail.sender.example [203.0.113.20])
    by mx.sender.example with ESMTPS id 0987654321fedcba
    for <recipient@example.com>; Tue, 10 Dec 2025 08:20:55 +0000
Received: from localhost (localhost [127.0.0.1])
    by mail.sender.example with ESMTPSA id a1b2c3d4e5
    for <recipient@example.com>; Tue, 10 Dec 2025 08:20:40 +0000
From: Sender Example <sender@example.com>
To: Recipient Example <recipient@example.com>
Subject: Sample delivery timeline
Message-ID: <sample-message@example.com>
Date: Tue, 10 Dec 2025 09:20:35 +0100
Authentication-Results: mx.microsoft.com; spf=pass smtp.mailfrom=example.com; dkim=pass header.d=example.com; dmarc=pass action=none header.from=example.com
Received-SPF: Pass (protection.outlook.com: domain of example.com designates 203.0.113.20 as permitted sender) receiver=protection.outlook.com; client-ip=203.0.113.20; helo=mail.sender.example;
X-Forefront-Antispam-Report: CIP:203.0.113.20;CTRY:US;SCL:1;SRV:;IPV:NLI;SFV:NSPM;PTR:mail.sender.example;LANG:en;
X-Microsoft-Antispam: BCL:0;PCL:0;RULEID:0-1-2;`;

export default function MessageHeaderAnalyzer() {
    const [rawHeaders, setRawHeaders] = useState('');
    const [parsed, setParsed] = useState(null);
    const [error, setError] = useState('');
    const [exportStatus, setExportStatus] = useState('');

    const handleAnalyze = () => {
        if (!rawHeaders.trim()) {
            setError('Paste a complete header before analyzing.');
            return;
        }
        const { map, entries } = parseHeaderEntries(rawHeaders);
        const receivedRaw = map['received'] || [];
        const received = computeReceivedDelays(receivedRaw.map((r) => parseReceivedLine(r)));
        const summary = summarize(map, received);
        const forefront = parseKeyValueHeader(map['x-forefront-antispam-report']?.[0] || '');
        const antispam = parseKeyValueHeader(map['x-microsoft-antispam']?.[0] || '');
        const auth = parseAuthResults(map['authentication-results'], map['received-spf']);

        setParsed({
            summary,
            received,
            auth,
            forefront,
            antispam,
            rawMap: map,
            entries,
        });
        setError('');
        setExportStatus('');
    };

    const handleClear = () => {
        setRawHeaders('');
        setParsed(null);
        setError('');
        setExportStatus('');
    };

    const buildAnalysisText = (data) => {
        if (!data) return '';
        const lines = [];
        const s = data.summary || {};
        lines.push('=== Summary ===');
        lines.push(`Subject: ${s.subject || 'n/a'}`);
        lines.push(`Message ID: ${s.messageId || 'n/a'}`);
        lines.push(`From: ${s.from || 'n/a'}`);
        lines.push(`To: ${s.to || 'n/a'}`);
        lines.push(`Date: ${s.dateHeader || 'n/a'}`);
        lines.push(`Hops: ${s.hopCount ?? 'n/a'}`);
        lines.push(`Transit time: ${typeof s.totalTransitSeconds === 'number' ? formatSeconds(s.totalTransitSeconds) : 'n/a'}`);
        lines.push('');

        lines.push('=== Received path ===');
        if (data.received?.length) {
            data.received.forEach((r, idx) => {
                lines.push(`Hop ${idx + 1}`);
                lines.push(`  Submitting host: ${r.submittingHost || 'n/a'}`);
                lines.push(`  Receiving host: ${r.receivingHost || 'n/a'}`);
                lines.push(`  Time: ${r.dateString || 'n/a'}`);
                lines.push(`  Delay vs next: ${r.delaySeconds === null ? 'n/a' : formatSeconds(r.delaySeconds)}`);
                lines.push(`  Protocol: ${r.protocol || 'n/a'}`);
            });
        } else {
            lines.push('No Received headers found.');
        }
        lines.push('');

        lines.push('=== Authentication ===');
        if (data.auth?.length) {
            data.auth.forEach((a) => {
                lines.push(`- ${a.mechanism}: ${a.result} (${a.domain || 'n/a'}) ${a.detail ? '- ' + a.detail : ''}`);
            });
        } else {
            lines.push('No SPF/DKIM/DMARC results detected.');
        }
        lines.push('');

        lines.push('=== X-Forefront-Antispam-Report ===');
        if (data.forefront?.length) {
            data.forefront.forEach((kv) => lines.push(`${kv.key}: ${kv.value || 'n/a'}`));
        } else {
            lines.push('No Forefront header found.');
        }
        lines.push('');

        lines.push('=== X-Microsoft-Antispam ===');
        if (data.antispam?.length) {
            data.antispam.forEach((kv) => lines.push(`${kv.key}: ${kv.value || 'n/a'}`));
        } else {
            lines.push('No Microsoft Antispam header found.');
        }
        lines.push('');

        lines.push('=== All headers ===');
        if (data.entries?.length) {
            data.entries.forEach((h, idx) => lines.push(`${idx + 1}. ${h.name}: ${h.value}`));
        } else {
            lines.push('No headers parsed.');
        }

        return lines.join('\n');
    };

    const handleCopyAnalysis = async () => {
        if (!parsed) return;
        try {
            await navigator.clipboard.writeText(buildAnalysisText(parsed));
            setExportStatus('Analysis copied to clipboard.');
        } catch (err) {
            setExportStatus('Unable to copy to clipboard.');
        }
    };

    const handleDownloadAnalysis = () => {
        if (!parsed) return;
        const blob = new Blob([buildAnalysisText(parsed)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'message-header-analysis.txt';
        a.click();
        URL.revokeObjectURL(url);
        setExportStatus('Text file downloaded.');
    };

    const missingReceived = parsed && (!parsed.received || parsed.received.length === 0);

    const cards = useMemo(() => {
        const summary = parsed?.summary || {};
        const transit = typeof summary.totalTransitSeconds === 'number' ? summary.totalTransitSeconds : null;

        return [
            { label: 'Subject', value: summary.subject || 'Not found' },
            { label: 'Message ID', value: summary.messageId || 'Not found' },
            { label: 'From', value: summary.from || 'Not found' },
            { label: 'To', value: summary.to || 'Not found' },
            {
                label: 'Date',
                value: summary.dateObj ? formatDate(summary.dateObj) : summary.dateHeader || 'Not found',
            },
            {
                label: 'Hops',
                value: typeof summary.hopCount === 'number' ? `${summary.hopCount} received headers` : 'n/a',
            },
            {
                label: 'Transit time',
                value: transit !== null ? formatSeconds(transit) : 'n/a',
            },
        ];
    }, [parsed]);

    const SectionIcon = ({ icon }) => (
        <span className="mha-headerIcon" aria-hidden="true">
            <svg
                viewBox="0 0 24 24"
                role="presentation"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...(icon?.props || {})}
            >
                {icon?.nodes}
            </svg>
        </span>
    );

    const icons = {
        paste: {
            nodes: (
                <>
                    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                    <path d="M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2" />
                    <path d="M9 11h3" />
                    <path d="M9 14h6" />
                    <path d="M9 17h6" />
                </>
            ),
        },
        summary: {
            nodes: (
                <>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                    <path d="M9 9l1 0" />
                    <path d="M9 13l6 0" />
                    <path d="M9 17l6 0" />
                </>
            ),
        },
        received: {
            nodes: (
                <>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 17h4v4h-4z" />
                    <path d="M17 3h4v4h-4z" />
                    <path d="M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5" />
                </>
            ),
        },
        auth: {
            nodes: (
                <>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v.5" />
                    <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" />
                    <path d="M8 11v-4a4 4 0 1 1 8 0v4" />
                    <path d="M15 19l2 2l4 -4" />
                </>
            ),
        },
        antispam: {
            props: { fill: 'currentColor', stroke: 'none' },
            nodes: (
                <>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11.998 2l.118 .007l.059 .008l.061 .013l.111 .034a.993 .993 0 0 1 .217 .112l.104 .082l.255 .218a11 11 0 0 0 7.189 2.537l.342 -.01a1 1 0 0 1 1.005 .717a13 13 0 0 1 -9.208 16.25a1 1 0 0 1 -.502 0a13 13 0 0 1 -9.209 -16.25a1 1 0 0 1 1.005 -.717a11 11 0 0 0 7.531 -2.527l.263 -.225l.096 -.075a.993 .993 0 0 1 .217 -.112l.112 -.034a.97 .97 0 0 1 .119 -.021l.115 -.007zm3.71 7.293a1 1 0 0 0 -1.415 0l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.32 1.497l2 2l.094 .083a1 1 0 0 0 1.32 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
                </>
            ),
        },
        headers: {
            nodes: (
                <>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11 19h-6a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v6" />
                    <path d="M3 7l9 6l9 -6" />
                    <path d="M20 21l2 -2l-2 -2" />
                    <path d="M17 17l-2 2l2 2" />
                </>
            ),
        },
    };

    return (
        <Layout title="Message Header Analyzer" description="Inspect message headers entirely in your browser.">
            <style>{`
                .mha-root { font-size: 0.94rem; }
                .mha-layout { display: grid; gap: 1.25rem; }
                .mha-actions { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; margin-bottom: 0.75rem; }
                .mha-exportActions { display: flex; gap: .5rem; align-items: center; margin: 0.6rem 0 0.2rem; flex-wrap: wrap; }
                .mha-textarea { width: 100%; min-height: 200px; font-family: inherit; font-size: inherit; line-height: inherit; }
                .mha-card { border: 1px solid var(--ifm-toc-border-color); border-radius: 6px; overflow: hidden; background: var(--ifm-background-surface-color); }
                .mha-cardHeader { background: #0067b8; color: #fff; padding: 0.45rem 0.7rem; font-weight: 700; letter-spacing: 0.01em; font-size: 0.94rem; display: flex; align-items: center; gap: 0.4rem; }
                .mha-headerIcon { display: inline-flex; align-items: center; justify-content: center; }
                .mha-headerIcon svg { width: 18px; height: 18px; vertical-align: middle; }
                .mha-titleIcon { display: inline-flex; align-items: center; justify-content: center; margin-right: 0.45rem; vertical-align: middle; color: var(--ifm-color-primary); }
                .mha-titleIcon svg { width: 26px; height: 26px; }
                .mha-cardBody { padding: 0.7rem 0.85rem; }
                .mha-summaryGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem; }
                .mha-summaryItem { padding: 0.5rem 0.55rem; border: 1px solid var(--ifm-toc-border-color); border-radius: 4px; background: var(--ifm-background-color); }
                .mha-summaryLabel { display: block; font-size: 0.7rem; color: var(--ifm-color-secondary-text); text-transform: uppercase; letter-spacing: 0.04em; }
                .mha-summaryValue { margin-top: 0.12rem; font-weight: 600; font-size: 0.92rem; word-break: break-word; }
                .mha-tableWrapper { overflow-x: auto; }
                .mha-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; table-layout: fixed; }
                .mha-table th, .mha-table td { padding: 0.45rem 0.5rem; border: 1px solid var(--ifm-toc-border-color); vertical-align: top; word-break: break-word; white-space: normal; }
                .mha-table th { background: #e5f1fb; font-weight: 700; font-size: 0.88rem; color: var(--ifm-color-emphasis-600); }
                .mha-table tr:nth-child(odd) { background: rgba(0,0,0,0.015); }
                [data-theme='dark'] .mha-table th { background: #243447; color: var(--ifm-color-emphasis-400); }
                [data-theme='dark'] .mha-table tr:nth-child(odd) { background: rgba(255,255,255,0.02); }
                .mha-chip { display: inline-block; padding: 0.12rem 0.42rem; border-radius: 999px; font-size: 0.75rem; background: #e5f1fb; color: #004f9f; border: 1px solid #c6defa; }
                .mha-delay-bad { color: var(--ifm-color-danger); font-weight: 700; }
                .mha-delay-good { color: var(--ifm-color-success); font-weight: 700; }
                .mha-mono { font-family: var(--ifm-font-family-monospace); font-size: 0.85rem; white-space: pre-wrap; }
                .mha-center { text-align: center; vertical-align: middle; }
                .mha-sectionHint { margin: 0.2rem 0 0; color: var(--ifm-color-secondary-text); font-size: 0.82rem; }
                .mha-muted { color: var(--ifm-color-secondary-text); }
                .mha-kvGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.55rem; }
                .mha-kv { border: 1px solid var(--ifm-toc-border-color); border-radius: 4px; padding: 0.4rem 0.5rem; background: var(--ifm-background-color); font-size: 0.88rem; }
                .mha-kv strong { font-size: 0.8rem; display: block; color: var(--ifm-color-secondary-text); text-transform: uppercase; letter-spacing: 0.03em; }
                .mha-kv span { display: block; margin-top: 0.1rem; word-break: break-word; }
                @media (max-width: 768px) {
                    .mha-summaryGrid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
                    .mha-cardBody { padding: 0.65rem 0.7rem; }
                }
            `}</style>

            <main className="container margin-vert--lg mha-root">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="mha-titleIcon" aria-hidden="true" style={{ color: 'var(--ifm-color-primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 64, height: 64 }}>
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                            <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                            <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                            <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                            <path d="M8 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                            <path d="M16 16l-2.5 -2.5" />
                        </svg>
                    </span>
                    <div>
                        <h1 className="margin-bottom--sm">
                            Message Header Analyzer
                        </h1>
                        <p style={{ marginBottom: 0 }}>
                            Paste a raw e-mail header to extract the delivery path, timing, and antispam verdicts.<br/>
                            <strike>Copied wholesale</strike> 😁 Freely inspired by the original Microsoft project (<a href="https://github.com/microsoft/MHA" target="_blank">MHA</a>), slightly revised in terms of the usability of the post-analysis page.
                        </p>
                    </div>
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--ifm-color-secondary-text)', marginTop: '1rem' }}>
                    <Admonition type="danger" title="Data Privacy">
                        Everything stays in your browser; no files are uploaded or stored on the server.<br/>
                        All analysis is performed by your browser.
                    </Admonition>
                </p>

                <div className="mha-layout">
                    <div className="mha-actions">
                        <button className="button button--primary button--sm" onClick={handleAnalyze}>
                            Analyze headers
                        </button>
                        <button className="button button--secondary button--sm" onClick={handleClear}>
                            Clear
                        </button>
                        {/* <button
                            className="button button--link button--sm"
                            type="button"
                            onClick={() => setRawHeaders(SAMPLE_HEADER)}
                        >
                            Load sample
                        </button> */}
                        {error && <span style={{ color: 'var(--ifm-color-danger)' }}>{error}</span>}
                    </div>
                    <textarea
                        style={{ width: '100%', minHeight: '220px' }}
                        placeholder="Paste the full e-mail header here..."
                        value={rawHeaders}
                        onChange={(e) => setRawHeaders(e.target.value)}
                    />

                    {parsed && (
                        <>
                            <div className="mha-exportActions">
                                <button className="button button--secondary button--sm" onClick={handleCopyAnalysis}>
                                    Copy analysis
                                </button>
                                <button className="button button--secondary button--sm" onClick={handleDownloadAnalysis}>
                                    Export as .txt
                                </button>
                                {exportStatus && <span style={{ color: 'var(--ifm-color-secondary-text)' }}>{exportStatus}</span>}
                            </div>

                            <section className="mha-card">
                                <div className="mha-cardHeader">
                                    <SectionIcon icon={icons.summary} />
                                    <span>Summary</span>
                                </div>
                                <div className="mha-cardBody">
                                    <div className="mha-summaryGrid">
                                        {cards.map((c) => (
                                            <div key={c.label} className="mha-summaryItem">
                                                <span className="mha-summaryLabel">{c.label}</span>
                                                <span className="mha-summaryValue">{c.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {missingReceived && (
                                        <p className="mha-sectionHint">
                                            No Received headers found. Check that you pasted the full message header (not just the body).
                                        </p>
                                    )}
                            </div>
                            </section>

                            <section className="mha-card">
                                <div className="mha-cardHeader">
                                    <SectionIcon icon={icons.received} />
                                    <span>Received path</span>
                                </div>
                                <div className="mha-cardBody">
                                    {!parsed.received.length && (
                                        <p className="mha-muted">No Received headers available.</p>
                                    )}
                                    {parsed.received.length > 0 && (
                                        <div className="mha-tableWrapper">
                                            <table className="mha-table">
                                                <thead>
                                                        <tr>
                                                            <th style={{ width: '60px' }}>Hop</th>
                                                            <th>Submitting host</th>
                                                            <th>Receiving host</th>
                                                            <th style={{ width: '220px' }}>Time</th>
                                                            <th style={{ width: '110px' }}>Delay vs next</th>
                                                        <th style={{ width: '120px' }}>Protocol</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {parsed.received.map((r, idx) => (
                                                        <tr key={`${idx}-${r.dateString}`}>
                                                            <td className="mha-center">
                                                                <span className="mha-chip">{idx + 1}</span>
                                                            </td>
                                                            <td className="mha-mono">{r.submittingHost || <span className="mha-muted">Unknown</span>}</td>
                                                            <td className="mha-mono">{r.receivingHost || <span className="mha-muted">Unknown</span>}</td>
                                                            <td>
                                                                {r.dateObj ? (
                                                                    <>
                                                                        {formatDate(r.dateObj)}
                                                                        <div className="mha-sectionHint">{r.dateString}</div>
                                                                    </>
                                                                ) : (
                                                                    r.dateString || <span className="mha-muted">Not parsed</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {r.delaySeconds === null ? (
                                                                    <span className="mha-muted">n/a</span>
                                                                ) : (
                                                                    <span className={r.delaySeconds < 0 ? 'mha-delay-bad' : 'mha-delay-good'}>
                                                                        {formatSeconds(r.delaySeconds)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="mha-mono">{r.protocol || <span className="mha-muted">?</span>}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="mha-card">
                                <div className="mha-cardHeader">
                                    <SectionIcon icon={icons.auth} />
                                    <span>Authentication</span>
                                </div>
                                <div className="mha-cardBody">
                                    {parsed.auth.length === 0 && <p className="mha-muted">No SPF/DKIM/DMARC results detected.</p>}
                                    {parsed.auth.length > 0 && (
                                        <div className="mha-tableWrapper">
                                            <table className="mha-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '110px' }}>Check</th>
                                                        <th style={{ width: '140px' }}>Result</th>
                                                        <th>Domain</th>
                                                        <th>Details</th>
                                                        <th style={{ width: '170px' }}>Source header</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {parsed.auth.map((row, idx) => (
                                                        <tr key={`${row.mechanism}-${idx}`}>
                                                            <td><strong>{row.mechanism}</strong></td>
                                                            <td className={row.result.includes('fail') || row.result.includes('softfail') ? 'mha-delay-bad' : 'mha-delay-good'}>
                                                                {row.result}
                                                            </td>
                                                            <td className="mha-mono">{row.domain || <span className="mha-muted">n/a</span>}</td>
                                                            <td>{row.detail || <span className="mha-muted">No extra info</span>}</td>
                                                            <td className="mha-muted">{row.source}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {(parsed.forefront.length > 0 || parsed.antispam.length > 0) && (
                                <section className="mha-card">
                                    <div className="mha-cardHeader">
                                        <SectionIcon icon={icons.antispam} />
                                        <span>Antispam headers</span>
                                    </div>
                                    <div className="mha-cardBody">
                                        {parsed.forefront.length > 0 && (
                                            <>
                                                <h3 style={{ marginBottom: '0.55rem' }}>X-Forefront-Antispam-Report</h3>
                                                <div className="mha-kvGrid" style={{ marginBottom: '1.1rem' }}>
                                                    {parsed.forefront.map((item, idx) => (
                                                        <div key={`ff-${idx}`} className="mha-kv">
                                                            <strong>{item.key}</strong>
                                                            <span>{item.value || <span className="mha-muted">n/a</span>}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {parsed.antispam.length > 0 && (
                                            <>
                                                <h3 style={{ marginBottom: '0.55rem' }}>X-Microsoft-Antispam</h3>
                                                <div className="mha-kvGrid" style={{ marginBottom: '0.4rem' }}>
                                                    {parsed.antispam.map((item, idx) => (
                                                        <div key={`msa-${idx}`} className="mha-kv">
                                                            <strong>{item.key}</strong>
                                                            <span>{item.value || <span className="mha-muted">n/a</span>}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </section>
                            )}

                            {parsed && (
                                <section className="mha-card">
                                    <div className="mha-cardHeader">
                                        <SectionIcon icon={icons.headers} />
                                        <span>All headers</span>
                                    </div>
                                    <div className="mha-cardBody">
                                        {parsed.entries?.length ? (
                                            <div className="mha-tableWrapper">
                                                <table className="mha-table">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '70px' }}>#</th>
                                                            <th style={{ width: '240px' }}>Header</th>
                                                            <th>Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {parsed.entries.map((item, idx) => (
                                                            <tr key={`${item.name}-${idx}`}>
                                                                <td>{idx + 1}</td>
                                                                <td style={{ fontWeight: 700 }}>{item.name}</td>
                                                                <td className="mha-mono">{item.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="mha-muted">No headers parsed.</p>
                                        )}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>
        </Layout>
    );
}
