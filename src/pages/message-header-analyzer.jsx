import React, { useState } from 'react';
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

function getFirstHeaderValue(map, names) {
    for (const name of names) {
        const value = map[name]?.[0];
        if (value) return value;
    }
    return '';
}

function extractEmail(raw = '') {
    if (!raw) return '';
    const bracketMatch = raw.match(/<([^>]+)>/);
    if (bracketMatch?.[1]) return bracketMatch[1].trim();
    const plainMatch = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return plainMatch ? plainMatch[0] : '';
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

function buildSummaryRows(summary, map, authRows) {
    const deliveryDate = summary?.received?.[0]?.dateObj || null;
    const creationDate = summary?.dateObj || null;
    const directionality = getFirstHeaderValue(map, [
        'x-ms-exchange-organization-messagedirectionality',
        'x-ms-exchange-crosstenant-originalarrivaltime',
    ]);
    const networkMessageId = getFirstHeaderValue(map, [
        'x-ms-exchange-crosstenant-network-message-id',
        'x-ms-exchange-organization-network-message-id',
    ]);
    const senderAddress = extractEmail(summary.from) || summary.from;
    const recipientAddress = extractEmail(summary.to) || summary.to;
    const passCount = (authRows || []).filter((x) => x.result === 'pass').length;
    const failCount = (authRows || []).filter((x) => x.result.includes('fail')).length;

    return [
        { label: 'Subject', value: summary.subject || 'n/a' },
        { label: 'Message ID', value: summary.messageId || 'n/a' },
        { label: 'Sender', value: senderAddress || 'n/a' },
        { label: 'Recipient', value: recipientAddress || 'n/a' },
        { label: 'Created', value: creationDate ? formatDate(creationDate) : summary.dateHeader || 'n/a' },
        { label: 'Delivered', value: deliveryDate ? formatDate(deliveryDate) : 'n/a' },
        { label: 'Hop count', value: typeof summary.hopCount === 'number' ? String(summary.hopCount) : 'n/a' },
        {
            label: 'Total delay',
            value: typeof summary.totalTransitSeconds === 'number' ? formatSeconds(summary.totalTransitSeconds) : 'n/a',
        },
        {
            label: 'Authentication',
            value:
                authRows?.length > 0
                    ? `${passCount} pass, ${failCount} fail (${authRows.length} checks)`
                    : 'No SPF/DKIM/DMARC rows',
        },
        { label: 'Directionality', value: directionality || 'n/a' },
        { label: 'Network Message ID', value: networkMessageId || 'n/a' },
    ];
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
        const receivedRaw = map.received || [];
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
        } catch {
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
    const summaryRows = parsed ? buildSummaryRows({ ...parsed.summary, received: parsed.received }, parsed.rawMap, parsed.auth) : [];
    const combinedAuthSource =
        parsed?.auth?.map((item, idx) => ({
            key: `${item.mechanism.toLowerCase()}_${idx}`,
            value: `${item.mechanism}=${item.result}${item.domain ? ` (${item.domain})` : ''}${item.detail ? ` - ${item.detail}` : ''}`,
        })) || [];

    return (
        <Layout title="Message Header Analyzer" description="Inspect message headers entirely in your browser.">
            <style>{`
                .mha-root { font-size: 0.92rem; }
                .mha-layout { display: grid; gap: 0.9rem; }
                .mha-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; margin-top: 0.55rem; }
                .mha-exportActions { display: flex; gap: 0.5rem; align-items: center; margin: 0; flex-wrap: wrap; }
                .mha-panel { border: 1px solid #1f4a7a; background: var(--ifm-background-color); }
                .mha-panelHeader {
                    background: #0067b8;
                    color: #fff;
                    font-size: 0.82rem;
                    font-weight: 700;
                    padding: 0.22rem 0.55rem;
                    line-height: 1.3;
                }
                .mha-panelBody { padding: 0.55rem; }
                .mha-textarea {
                    width: 100%;
                    min-height: 210px;
                    border: 1px solid #8da7c2;
                    font-family: var(--ifm-font-family-monospace);
                    font-size: 0.78rem;
                    line-height: 1.2;
                    padding: 0.45rem;
                    resize: vertical;
                }
                .mha-tableWrapper { overflow-x: auto; }
                .mha-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 0.78rem; }
                .mha-table th, .mha-table td {
                    border: 1px solid #1f4a7a;
                    padding: 0.2rem 0.35rem;
                    vertical-align: top;
                    word-break: break-word;
                }
                .mha-table th {
                    background: #0067b8;
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.74rem;
                }
                .mha-table tbody tr:nth-child(even) { background: #f1f8ff; }
                .mha-kvLabel { width: 220px; font-weight: 700; }
                .mha-mono {
                    font-family: var(--ifm-font-family-monospace);
                    white-space: pre-wrap;
                    overflow-wrap: anywhere;
                }
                .mha-good { color: #147539; font-weight: 700; }
                .mha-bad { color: #b11a00; font-weight: 700; }
                .mha-muted { color: var(--ifm-color-secondary-text); font-size: 0.8rem; }
                @media (max-width: 768px) {
                    .mha-kvLabel { width: 140px; }
                }
            `}</style>

            <main className="container margin-vert--lg mha-root">
                <div>
                    <h1 className="margin-bottom--sm">Message Header Analyzer</h1>
                    <p style={{ marginBottom: 0 }}>
                        Paste a raw e-mail header and generate an MHA-like report with summary, transport path, and antispam details.
                    </p>
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--ifm-color-secondary-text)', marginTop: '0.7rem', marginBottom: '0.7rem' }}>
                    <Admonition type="danger" title="Data Privacy">
                        Everything stays in your browser; no files are uploaded or stored on the server.
                    </Admonition>
                </p>

                <div className="mha-layout">
                    <section className="mha-panel">
                        <div className="mha-panelHeader">Paste the message header you would like to analyze</div>
                        <div className="mha-panelBody">
                            <textarea
                                className="mha-textarea"
                                placeholder="Paste the full e-mail header here..."
                                value={rawHeaders}
                                onChange={(e) => setRawHeaders(e.target.value)}
                            />
                            <div className="mha-actions">
                                <button className="button button--primary button--sm" onClick={handleAnalyze}>
                                    Analyze headers
                                </button>
                                <button className="button button--secondary button--sm" onClick={handleClear}>
                                    Clear
                                </button>
                                <button className="button button--link button--sm" type="button" onClick={() => setRawHeaders(SAMPLE_HEADER)}>
                                    Load sample
                                </button>
                                {error && <span style={{ color: 'var(--ifm-color-danger)' }}>{error}</span>}
                            </div>
                        </div>
                    </section>

                    {parsed && (
                        <section className="mha-panel">
                            <div className="mha-panelHeader">Analyze Result</div>
                            <div className="mha-panelBody">
                                <div className="mha-exportActions">
                                    <button className="button button--secondary button--sm" onClick={handleCopyAnalysis}>
                                        Copy analysis
                                    </button>
                                    <button className="button button--secondary button--sm" onClick={handleDownloadAnalysis}>
                                        Export as .txt
                                    </button>
                                    {exportStatus && <span style={{ color: 'var(--ifm-color-secondary-text)' }}>{exportStatus}</span>}
                                </div>
                            </div>
                        </section>
                    )}

                    {parsed && (
                        <section className="mha-panel">
                            <div className="mha-panelHeader">Header Analyzer Summary</div>
                            <div className="mha-panelBody">
                                <div className="mha-tableWrapper">
                                    <table className="mha-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '260px' }}>Name</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {summaryRows.map((row) => (
                                                <tr key={row.label}>
                                                    <td className="mha-kvLabel">{row.label}</td>
                                                    <td className="mha-mono">{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {missingReceived && (
                                    <p className="mha-muted" style={{ marginTop: '0.45rem' }}>
                                        No Received headers found. Verify that the pasted content includes the complete message header.
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {parsed && (
                        <section className="mha-panel">
                            <div className="mha-panelHeader">Transport Message Header Report</div>
                            <div className="mha-panelBody">
                                {!parsed.received.length && <p className="mha-muted">No Received headers available.</p>}
                                {parsed.received.length > 0 && (
                                    <div className="mha-tableWrapper">
                                        <table className="mha-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '60px' }}>Hop</th>
                                                    <th>Submitting Host</th>
                                                    <th>Receiving Host</th>
                                                    <th style={{ width: '180px' }}>Time</th>
                                                    <th style={{ width: '95px' }}>Delay</th>
                                                    <th style={{ width: '95px' }}>Type</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsed.received.map((r, idx) => (
                                                    <tr key={`${idx}-${r.dateString}`}>
                                                        <td>{idx + 1}</td>
                                                        <td className="mha-mono">{r.submittingHost || 'Unknown'}</td>
                                                        <td className="mha-mono">{r.receivingHost || 'Unknown'}</td>
                                                        <td>{r.dateObj ? formatDate(r.dateObj) : r.dateString || 'n/a'}</td>
                                                        <td className={r.delaySeconds !== null && r.delaySeconds < 0 ? 'mha-bad' : 'mha-good'}>
                                                            {r.delaySeconds === null ? 'n/a' : formatSeconds(r.delaySeconds)}
                                                        </td>
                                                        <td className="mha-mono">{r.protocol || 'n/a'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {parsed && (
                        <section className="mha-panel">
                            <div className="mha-panelHeader">Forefront Antispam Report Header</div>
                            <div className="mha-panelBody">
                                <div className="mha-tableWrapper">
                                    <table className="mha-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '260px' }}>Name</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsed.forefront.map((item, idx) => (
                                                <tr key={`ff-${idx}`}>
                                                    <td className="mha-kvLabel">{item.key}</td>
                                                    <td className="mha-mono">{item.value || 'n/a'}</td>
                                                </tr>
                                            ))}
                                            {parsed.antispam.map((item, idx) => (
                                                <tr key={`msa-${idx}`}>
                                                    <td className="mha-kvLabel">{item.key}</td>
                                                    <td className="mha-mono">{item.value || 'n/a'}</td>
                                                </tr>
                                            ))}
                                            {combinedAuthSource.map((item) => (
                                                <tr key={item.key}>
                                                    <td className="mha-kvLabel">auth-result</td>
                                                    <td className="mha-mono">{item.value}</td>
                                                </tr>
                                            ))}
                                            {!parsed.forefront.length && !parsed.antispam.length && !combinedAuthSource.length && (
                                                <tr>
                                                    <td colSpan={2} className="mha-muted">
                                                        No antispam or authentication diagnostic details were detected.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {parsed && (
                        <section className="mha-panel">
                            <div className="mha-panelHeader">Other Headers</div>
                            <div className="mha-panelBody">
                                {parsed.entries?.length ? (
                                    <div className="mha-tableWrapper">
                                        <table className="mha-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '60px' }}>#</th>
                                                    <th style={{ width: '260px' }}>Header</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsed.entries.map((item, idx) => (
                                                    <tr key={`${item.name}-${idx}`}>
                                                        <td>{idx + 1}</td>
                                                        <td>{item.name}</td>
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
                </div>
            </main>
        </Layout>
    );
}
