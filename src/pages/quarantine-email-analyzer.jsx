import React, { useState, useMemo, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import Admonition from '@theme/Admonition';

function splitCsvLine(line, delimiter) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (ch === delimiter && !inQuotes) {
            out.push(cur);
            cur = '';
            continue;
        }
        cur += ch;
    }
    out.push(cur);
    return out;
}

function extractDomain(address) {
    const match = (address || '').match(/@([^@\s>]+)$/);
    return match ? match[1].toLowerCase() : '';
}

const COMMON_CONSUMER_DOMAINS = [
    'gmail.com',
    'outlook.com',
    'outlook.it',
    'hotmail.com',
    'live.com',
    'yahoo.com',
    'yahoo.it',
    'icloud.com',
    'proton.me',
];
const COMMON_CONSUMER_DOMAIN_SET = new Set(COMMON_CONSUMER_DOMAINS);

function detectDelimiter(text) {
    const firstLine = (text || '').split(/\r?\n/).find((l) => l.trim()) || '';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    if (semicolonCount > commaCount) return ';';
    return ',';
}

function parseQuarantineCsv(text, delimiter = ',') {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (!lines.length) return { rows: [], types: [] };

    const headers = splitCsvLine(lines[0], delimiter).map((h) => h.trim());
    const rows = lines.slice(1).map((line, idx) => {
        const cells = splitCsvLine(line, delimiter);
        const obj = {};
        headers.forEach((h, i) => (obj[h] = cells[i] ?? ''));
        return {
            id: `${idx}-${obj.Identity || obj.SenderAddress || ''}`,
            sender: obj.SenderAddress || '',
            recipient: obj.RecipientAddress || '',
            senderDomain: extractDomain(obj.SenderAddress),
            recipientDomain: extractDomain(obj.RecipientAddress),
            subject: obj.Subject || '',
            identity: obj.Identity || '',
            received: obj.ReceivedTime || '',
            quarantineType: obj.QuarantineTypes || '',
            released: (obj.Released || '').toLowerCase() === 'true',
            raw: obj,
        };
    });

    const types = [...new Set(rows.map((r) => r.quarantineType).filter(Boolean))].sort();
    const senderDomains = [...new Set(rows.map((r) => r.senderDomain).filter(Boolean))].sort();
    return { rows, types, senderDomains };
}

function filterRows(rows, filter) {
    const q = filter.text.toLowerCase();
    return rows.filter((r) => {
        if (filter.domainSelection && Object.keys(filter.domainSelection).length) {
            const allowed = filter.domainSelection[r.senderDomain];
            if (allowed === false) return false;
        }
        if (filter.excludedRows && filter.excludedRows.has(r.id)) {
            return false;
        }
        if (filter.excludedSenders && filter.excludedSenders.has(r.sender)) {
            return false;
        }
        if (filter.excludedDomains && filter.excludedDomains.has(r.senderDomain)) {
            return false;
        }
        if (filter.excludedSubjects && filter.excludedSubjects.has(r.subject)) {
            return false;
        }
        if (filter.flagSelection && Object.keys(filter.flagSelection).length) {
            const rowFlags = [];
            const isFrequent = (filter.senderDomainCount?.[r.senderDomain] || 0) > 1;
            if (isFrequent) rowFlags.push('Frequent');
            if (r.quarantineType) rowFlags.push(r.quarantineType);

            const allowedFlags = Object.entries(filter.flagSelection)
                .filter(([, val]) => val !== false)
                .map(([k]) => k);
            if (!allowedFlags.length) return false; // deselect all -> show nothing

            const frequentSelected = filter.flagSelection['Frequent'] !== false;
            if (frequentSelected && !isFrequent) return false;
            if (!frequentSelected && isFrequent) return false;

            const hasAllowed = rowFlags.some((f) => filter.flagSelection[f] !== false);
            if (!hasAllowed) return false;
        }
        if (
            q &&
            !(
                r.sender.toLowerCase().includes(q) ||
                r.recipient.toLowerCase().includes(q) ||
                r.subject.toLowerCase().includes(q) ||
                r.identity.toLowerCase().includes(q)
            )
        ) return false;
        return true;
    });
}

function summarize(rows) {
    const total = rows.length;
    const released = rows.filter((r) => r.released).length;
    const byType = rows.reduce((acc, r) => {
        acc[r.quarantineType || ''] = (acc[r.quarantineType || ''] || 0) + 1;
        return acc;
    }, {});
    const uniqueSenders = new Set(rows.map((r) => r.sender)).size;
    const uniqueRecipients = new Set(rows.map((r) => r.recipient)).size;
    const senderDomainCount = rows.reduce((acc, r) => {
        if (!r.senderDomain) return acc;
        acc[r.senderDomain] = (acc[r.senderDomain] || 0) + 1;
        return acc;
    }, {});

    const topSenderDomains = Object.entries(senderDomainCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([domain, count]) => ({ domain, count }));

    return {
        total,
        released,
        notReleased: total - released,
        byType,
        uniqueSenders,
        uniqueRecipients,
        senderDomainCount,
        topSenderDomains,
    };
}

export default function QuarantineEmailAnalyzer() {
    const [rawText, setRawText] = useState('');
    const [rows, setRows] = useState([]);
    const [types, setTypes] = useState([]);
    const [senderDomains, setSenderDomains] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [domainSelection, setDomainSelection] = useState({});
    const [flagSelection, setFlagSelection] = useState({});
    const [fileInfo, setFileInfo] = useState('');
    const [expandedCells, setExpandedCells] = useState({});
    const [sortConfig, setSortConfig] = useState({ column: null, direction: null });
    const [copyStatus, setCopyStatus] = useState('');
    const [excludedRows, setExcludedRows] = useState(new Set());
    const [excludedSenders, setExcludedSenders] = useState(new Set());
    const [excludedDomains, setExcludedDomains] = useState(new Set());
    const [excludedSubjects, setExcludedSubjects] = useState(new Set());
    const [showScrollTop, setShowScrollTop] = useState(false);
    const bottomScrollRef = useRef(null);
    const tableRef = useRef(null);

    const summary = useMemo(() => summarize(rows), [rows]);
    const filtered = useMemo(
        () =>
            filterRows(rows, {
                text: filterText,
                domainSelection,
                flagSelection,
                senderDomainCount: summary.senderDomainCount,
                excludedRows,
                excludedSenders,
                excludedDomains,
                excludedSubjects,
            }),
        [rows, filterText, domainSelection, flagSelection, summary.senderDomainCount, excludedRows, excludedSenders, excludedDomains, excludedSubjects]
    );
    const sortedDomains = useMemo(() => {
        const counts = summary.senderDomainCount || {};
        return [...senderDomains].sort((a, b) => {
            const diff = (counts[b] || 0) - (counts[a] || 0);
            return diff !== 0 ? diff : a.localeCompare(b);
        });
    }, [senderDomains, summary.senderDomainCount]);
    const sortedTypes = useMemo(() => {
        const entries = Object.entries(summary.byType || {});
        return entries
            .filter(([, count]) => count > 0)
            .sort((a, b) => {
                const diff = b[1] - a[1];
                return diff !== 0 ? diff : a[0].localeCompare(b[0]);
            })
            .map(([type]) => type);
    }, [summary.byType]);
    const availableFlags = useMemo(() => {
        const flags = [];
        if (summary && Object.values(summary.senderDomainCount || {}).some((v) => v > 1)) {
            flags.push('Frequent');
        }
        sortedTypes.forEach((t) => flags.push(t));
        return flags;
    }, [summary, sortedTypes]);
    const sortedFiltered = useMemo(() => {
        if (!sortConfig.column || !sortConfig.direction) return filtered;
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        const normalize = (val) => {
            if (typeof val === 'number') return val;
            return String(val ?? '').toLowerCase();
        };
        const parseReceived = (val) => {
            const m = (val || '').match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
            if (!m) return null;
            const iso = `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}Z`;
            const t = Date.parse(iso);
            return Number.isNaN(t) ? null : t;
        };
        const getVal = (row) => {
            switch (sortConfig.column) {
                case 'sender':
                    return normalize(row.sender);
                case 'recipient':
                    return normalize(row.recipient);
                case 'subject':
                    return normalize(row.subject);
                case 'received': {
                    const parsed = parseReceived(row.received);
                    return parsed ?? normalize(row.received);
                }
                case 'identity':
                    return normalize(row.identity);
                default:
                    return normalize('');
            }
        };
        return [...filtered].sort((a, b) => {
            const va = getVal(a);
            const vb = getVal(b);
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });
    }, [filtered, sortConfig]);

    useEffect(() => {
        const updateWidth = () => tableRef.current?.scrollWidth;
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 200);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result || '';
            setRawText(content);
            const detectedDelimiter = detectDelimiter(content);
            const { rows: parsed, types: foundTypes, senderDomains: foundSenderDomains } = parseQuarantineCsv(
                content,
                detectedDelimiter
            );
            setRows(parsed);
            setTypes(foundTypes);
            setSenderDomains(foundSenderDomains);
            setDomainSelection(
                foundSenderDomains.reduce((acc, d) => {
                    acc[d] = true;
                    return acc;
                }, {})
            );
            setFlagSelection(
                ['Frequent', ...foundTypes].reduce((acc, f) => {
                    acc[f] = true;
                    return acc;
                }, {})
            );
            setFileInfo(`Loaded ${file.name} (${file.size} bytes)`);
        };
        reader.readAsText(file);
    }

    function handleParseClick() {
        const detectedDelimiter = detectDelimiter(rawText);
        const { rows: parsed, types: foundTypes, senderDomains: foundSenderDomains } = parseQuarantineCsv(
            rawText,
            detectedDelimiter
        );
        setRows(parsed);
        setTypes(foundTypes);
        setSenderDomains(foundSenderDomains);
        setDomainSelection(
            foundSenderDomains.reduce((acc, d) => {
                acc[d] = true;
                return acc;
            }, {})
        );
        setFlagSelection(
            ['Frequent', ...foundTypes].reduce((acc, f) => {
                acc[f] = true;
                return acc;
            }, {})
        );
        setFileInfo(parsed.length ? 'Parsed from pasted text' : '');
    }

    function toggleDomain(domain) {
        setDomainSelection((prev) => ({
            ...prev,
            [domain]: !(prev[domain] ?? true),
        }));
    }

    function toggleCell(rowId, field) {
        const key = `${rowId}-${field}`;
        setExpandedCells((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    async function copyToClipboard(text, successMessage = 'Copied to clipboard.') {
        try {
            await navigator.clipboard.writeText(text);
            setCopyStatus(successMessage);
            setTimeout(() => setCopyStatus(''), 2000);
        } catch (err) {
            setCopyStatus('Copy failed. Your browser may block clipboard access.');
            setTimeout(() => setCopyStatus(''), 3000);
        }
    }

    function copyIdentity(idValue) {
        if (!idValue) return;
        copyToClipboard(idValue);
    }

    function copyAllIdentities() {
        const ids = sortedFiltered.map((r) => r.identity).filter(Boolean);
        if (!ids.length) {
            setCopyStatus('No identities to copy.');
            setTimeout(() => setCopyStatus(''), 2000);
            return;
        }
        const count = ids.length;
        const label = count === 1 ? 'ID' : 'IDs';
        copyToClipboard(ids.join('\n'), `Copied ${count} ${label} to clipboard.`);
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetView() {
        setFilterText('');
        setDomainSelection(
            senderDomains.reduce((acc, d) => {
                acc[d] = true;
                return acc;
            }, {})
        );
        setFlagSelection(
            availableFlags.reduce((acc, f) => {
                acc[f] = true;
                return acc;
            }, {})
        );
        setSortConfig({ column: null, direction: null });
        setExpandedCells({});
        setExcludedRows(new Set());
        setExcludedSenders(new Set());
        setExcludedDomains(new Set());
        setExcludedSubjects(new Set());
    }

    function excludeRow(id) {
        setExcludedRows((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    }

    function excludeSender(sender) {
        if (!sender) return;
        setExcludedSenders((prev) => {
            const next = new Set(prev);
            next.add(sender);
            return next;
        });
    }

    function excludeDomain(domain) {
        if (!domain) return;
        setExcludedDomains((prev) => {
            const next = new Set(prev);
            next.add(domain);
            return next;
        });
    }

    function excludeSubject(subject) {
        if (!subject) return;
        setExcludedSubjects((prev) => {
            const next = new Set(prev);
            next.add(subject);
            return next;
        });
    }

    function toggleSort(column) {
        setSortConfig((prev) => {
            if (prev.column !== column) return { column, direction: 'asc' };
            if (prev.direction === 'asc') return { column, direction: 'desc' };
            return { column: null, direction: null };
        });
    }

    function renderSortIndicatorSafe(column) {
        if (sortConfig.column !== column) return '';
        if (sortConfig.direction === 'asc') return ' ↑';
        if (sortConfig.direction === 'desc') return ' ↓';
        return '';
    }

    function renderSortIndicator(column) {
        if (sortConfig.column !== column) return '';
        if (sortConfig.direction === 'asc') return ' ↑';
        if (sortConfig.direction === 'desc') return ' ↓';
        return '';
    }

    return (
        <Layout title="Quarantine Email Analyzer" description="Analyze quarantine email CSV files in the browser">
            <style>{`
                .qea-tableWrapper { overflow-x: auto; margin-top: 1rem; width: 100%; }
                .qea-tableWrapper table { width: 100%; }
                .qea-table { font-size: 0.85rem; }
                .qea-table th, .qea-table td { padding: 0.35rem 0.5rem; }
                .qea-summaryCard { border: 1px solid var(--ifm-toc-border-color); border-radius: var(--ifm-global-radius); padding: .75rem 1rem; margin: 1rem 0; }
                .qea-cell { display: block; width: 100%; max-width: 240px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; font-size: 0.82rem; }
                .qea-cellSubject { max-width: 340px; }
                .qea-cellSubjectShort { max-width: none; white-space: normal; }
                .qea-cellExpanded { white-space: pre-wrap; overflow: visible; }
                .qea-flag { display: inline-block; padding: 0.05rem 0.35rem; border-radius: 0.4rem; font-size: 0.7rem; margin-right: 0.2rem; }
                .qea-flag-warn { background: var(--ifm-color-danger-contrast-background); color: var(--ifm-color-danger); }
                .qea-flag-info { background: var(--ifm-color-primary-contrast-background); color: var(--ifm-color-primary); border: 1px solid var(--ifm-color-primary); }
                .qea-domainList { max-height: 180px; overflow-y: auto; border: 1px solid var(--ifm-toc-border-color); border-radius: var(--ifm-global-radius); padding: 0.35rem 0.5rem; font-size: 0.85rem; background: var(--ifm-background-surface-color); }
                .qea-domainList label { display: flex; align-items: center; gap: 0.35rem; margin-bottom: 0.25rem; }
                .qea-small { font-size: 0.78rem; color: var(--ifm-color-secondary-text); }
                .qea-selectActions { display: flex; gap: 0.5rem; margin-top: 4px; margin-bottom: 4px; }
                .qea-selectLink { cursor: pointer; color: var(--ifm-color-primary); font-size: 0.82rem; }
                .qea-selectLink:hover { text-decoration: underline; }
                .qea-identityInput { width: 100%; min-width: 0; font-size: 0.78rem; padding: 0.15rem 0.25rem; border: 1px solid var(--ifm-toc-border-color); border-radius: var(--ifm-global-radius); background: var(--ifm-background-surface-color); }
                .qea-titleIcon { display: inline-flex; align-items: center; justify-content: center; color: var(--ifm-color-primary); }
                .qea-rowCommonDomain td { background: rgba(255, 181, 64, 0.12); }
            `}</style>

            <main className="container margin-vert--lg">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="qea-titleIcon" aria-hidden="true">
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
                        <h1 className="margin-bottom--sm">Quarantine Email Analyzer</h1>
                        <p style={{ marginBottom: 0 }}>
                            Upload or paste a quarantine CSV to quickly filter senders, recipients, and decide what to release.
                        </p>
                    </div>
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--ifm-color-secondary-text)', marginTop: '1rem' }}>
                    <Admonition type="danger" title="Data Privacy">
                        Everything stays in your browser; no files are uploaded or stored on the server.<br/>
                        All analysis is performed by your browser.
                    </Admonition>
                </p>

                <div className="margin-bottom--sm">
                    <label className="button button--secondary button--sm" style={{ cursor: 'pointer', marginRight: '0.5rem' }}>
                        Choose CSV
                        <input type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={handleFileSelect} />
                    </label>
                    <button className="button button--primary button--sm" onClick={handleParseClick}>
                        Analyze
                    </button>
                    {fileInfo && <span style={{ marginLeft: '0.75rem', fontSize: '.9rem' }}>{fileInfo}</span>}
                </div>

                <textarea
                    style={{ width: '100%', minHeight: 180, marginTop: '1rem' }}
                    placeholder='Paste CSV here... delimiter is auto-detected (comma or semicolon).'
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                />

                {rows.length > 0 && (
                    <>
                        <div className="qea-summaryCard">
                            <div>
                                <strong>Total:</strong> {summary.total} -{' '}
                                <strong>Unique senders:</strong> {summary.uniqueSenders} -{' '}
                                <strong>Unique recipients:</strong> {summary.uniqueRecipients}
                            </div>
                            <div style={{ marginTop: '.4rem' }}>
                                {Object.entries(summary.byType).map(([t, n], idx) => (
                                    <span key={t}>
                                        <strong>{t || '(empty)'}</strong>: {n}
                                        {idx < Object.entries(summary.byType).length - 1 ? ' - ' : ''}
                                    </span>
                                ))}
                            </div>
                            {summary.topSenderDomains.length > 0 && (
                                <div style={{ marginTop: '.4rem' }}>
                                    <strong>Top sender domains:</strong>{' '}
                                    {summary.topSenderDomains.map((d, idx) => (
                                        <span key={d.domain}>
                                            <code>{d.domain}</code> ({d.count}){idx < summary.topSenderDomains.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="row margin-top--md margin-bottom--sm">
                            <div className="col col--4">
                                <span style={{ fontSize: '0.85rem' }}>Sender domains (uncheck to exclude)</span>
                                <div className="qea-selectActions">
                                    <span
                                        className="qea-selectLink"
                                        onClick={() =>
                                            setDomainSelection(
                                                sortedDomains.reduce((acc, d) => {
                                                    acc[d] = true;
                                                    return acc;
                                                }, {})
                                            )
                                        }
                                    >
                                        Select all
                                    </span>
                                    <span
                                        className="qea-selectLink"
                                        onClick={() =>
                                            setDomainSelection(
                                                sortedDomains.reduce((acc, d) => {
                                                    acc[d] = false;
                                                    return acc;
                                                }, {})
                                            )
                                        }
                                    >
                                        Deselect all
                                    </span>
                                </div>
                                <div className="qea-domainList" style={{ marginTop: 4 }}>
                                    {sortedDomains.length === 0 && <div style={{ color: 'var(--ifm-color-secondary-text)' }}>No domains detected</div>}
                                    {sortedDomains.map((d) => {
                                        const checked = domainSelection[d] !== false;
                                        const count = summary.senderDomainCount[d] || 0;
                                        return (
                                            <label key={d}>
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleDomain(d)}
                                                />
                                                <span style={{ whiteSpace: 'nowrap' }}>{d} ({count})</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="col col--4">
                                <span style={{ fontSize: '0.85rem' }}>Flags (uncheck to exclude)</span>
                                <div className="qea-selectActions">
                                    <span
                                        className="qea-selectLink"
                                        onClick={() =>
                                            setFlagSelection(
                                                availableFlags.reduce((acc, f) => {
                                                    acc[f] = true;
                                                    return acc;
                                                }, {})
                                            )
                                        }
                                    >
                                        Select all
                                    </span>
                                    <span
                                        className="qea-selectLink"
                                        onClick={() =>
                                            setFlagSelection(
                                                availableFlags.reduce((acc, f) => {
                                                    acc[f] = false;
                                                    return acc;
                                                }, {})
                                            )
                                        }
                                    >
                                        Deselect all
                                    </span>
                                </div>
                                <div className="qea-domainList" style={{ marginTop: 4 }}>
                                    {availableFlags.length === 0 && <div style={{ color: 'var(--ifm-color-secondary-text)' }}>No flags detected</div>}
                                    {availableFlags.map((f) => {
                                    const checked = flagSelection[f] !== false;
                                    return (
                                        <label key={f}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    setFlagSelection((prev) => ({
                                                        ...prev,
                                                        [f]: !(prev[f] ?? true),
                                                    }))
                                                }
                                            />
                                            <span style={{ whiteSpace: 'nowrap' }}>{f}</span>
                                        </label>
                                    );
                                })}
                                </div>
                            </div>
                            <div className="col col--4">
                                <span style={{ fontSize: '0.85rem' }}>Search (sender/recipient/subject/id)</span>
                                <input
                                    type="text"
                                    style={{ width: '100%', marginTop: 4 }}
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    placeholder="e.g. @example.com or HighConfPhish"
                                />
                            </div>
                        </div>

                        <p style={{ fontSize: '.9rem', color: 'var(--ifm-color-secondary-text)' }}>
                            Showing {filtered.length} of {rows.length} rows.
                        </p>
                        <p style={{ fontSize: '.85rem', color: 'var(--ifm-color-secondary-text)', marginTop: '-0.35rem' }}>
                            Righe con domini consumer comuni (es. gmail.com, outlook.com) sono evidenziate per valutare rapidamente l&apos;uso di &quot;Exclude Domain&quot;.
                        </p>
                        <p style={{ fontSize: '.85rem', color: 'var(--ifm-color-secondary-text)', marginTop: '-0.35rem' }}>
                            <Admonition type="tip">
                                Click column headers to sort (A-Z / Z-A / none).<br/>
                                If you deselect the flag "Frequent", rows marked as Frequent are always hidden even if they have other flags.
                            </Admonition>
                        </p>
                        <div className="margin-top--sm margin-bottom--sm" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                type="button"
                                className="button button--secondary button--sm"
                                onClick={copyAllIdentities}
                                disabled={!sortedFiltered.length}
                            >
                                Copy all visible IDs
                            </button>
                            <button
                                type="button"
                                className="button button--secondary button--sm"
                                onClick={resetView}
                            >
                                Reset view
                            </button>
                            {copyStatus && <span style={{ fontSize: '.85rem', color: 'var(--ifm-color-secondary-text)' }}>{copyStatus}</span>}
                        </div>

                        <div className="qea-tableWrapper" ref={bottomScrollRef}>
                            <table className="table qea-table" ref={tableRef}>
                                <colgroup>
                                    <col />
                                    <col />
                                    <col style={{ width: '36%' }} />
                                    <col style={{ width: '12%' }} />
                                    <col style={{ width: '12%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('sender')}>Sender{renderSortIndicatorSafe('sender')}</th>
                                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('recipient')}>Recipient{renderSortIndicatorSafe('recipient')}</th>
                                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('subject')}>Subject{renderSortIndicatorSafe('subject')}</th>
                                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('received')}>Received{renderSortIndicatorSafe('received')}</th>
                                        <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('identity')}>Identity{renderSortIndicatorSafe('identity')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedFiltered.map((r, idx) => (
                                        <tr key={r.id} className={COMMON_CONSUMER_DOMAIN_SET.has(r.senderDomain) ? 'qea-rowCommonDomain' : undefined}>
                                            <td>
                                                <div className={`${expandedCells[`${r.id}-sender`] ? 'qea-cell qea-cellExpanded' : 'qea-cell'}`}>
                                                    {r.sender}
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                                                    {r.sender && r.sender.length > 28 && (
                                                        <button
                                                            type="button"
                                                            className="button button--link button--sm"
                                                            onClick={() => toggleCell(r.id, 'sender')}
                                                            style={{ padding: 0 }}
                                                        >
                                                            {expandedCells[`${r.id}-sender`] ? 'Collapse' : 'Expand'}
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="button button--link button--sm"
                                                        style={{ padding: 0 }}
                                                        onClick={() => excludeRow(r.id)}
                                                    >
                                                        Exclude
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="button button--link button--sm"
                                                        style={{ padding: 0 }}
                                                        onClick={() => excludeSender(r.sender)}
                                                    >
                                                        Exclude Sender
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="button button--link button--sm"
                                                        style={{ padding: 0 }}
                                                        onClick={() => excludeDomain(r.senderDomain)}
                                                    >
                                                        Exclude Domain
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={`${expandedCells[`${r.id}-recipient`] ? 'qea-cell qea-cellExpanded' : 'qea-cell'}`}>
                                                    {r.recipient}
                                                </div>
                                                {r.recipient && r.recipient.length > 28 && (
                                                    <button
                                                        type="button"
                                                        className="button button--link button--sm"
                                                        onClick={() => toggleCell(r.id, 'recipient')}
                                                        style={{ padding: 0 }}
                                                    >
                                                        {expandedCells[`${r.id}-recipient`] ? 'Collapse' : 'Expand'}
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                <div
                                                    className={
                                                        expandedCells[`${r.id}-subject`]
                                                            ? 'qea-cell qea-cellExpanded qea-cellSubject'
                                                            : (r.subject?.length || 0) > 80
                                                                ? 'qea-cell qea-cellSubject'
                                                                : 'qea-cell qea-cellSubject qea-cellSubjectShort'
                                                    }
                                                >
                                                    {r.subject}
                                                </div>
                                                {r.subject && r.subject.length > 80 && (
                                                    <button
                                                        type="button"
                                                        className="button button--link button--sm"
                                                        onClick={() => toggleCell(r.id, 'subject')}
                                                        style={{ padding: 0 }}
                                                    >
                                                        {expandedCells[`${r.id}-subject`] ? 'Collapse' : 'Expand'}
                                                    </button>
                                                )}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem' }}>
                                                    <button
                                                        type="button"
                                                        className="button button--link button--sm"
                                                        style={{ padding: 0 }}
                                                        onClick={() => excludeSubject(r.subject)}
                                                    >
                                                        Exclude Subject
                                                    </button>
                                                </div>
                                                <div style={{ marginTop: '0.25rem' }}>
                                                    {summary.senderDomainCount[r.senderDomain] > 1 && (
                                                        <span className="qea-flag qea-flag-info">Frequent</span>
                                                    )}
                                                    {r.quarantineType && (
                                                        <span className="qea-flag qea-flag-warn">{r.quarantineType}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="qea-small">{r.received}</td>
                                            <td className="qea-small">
                                                <input
                                                    className="qea-identityInput"
                                                    type="text"
                                                    readOnly
                                                    value={r.identity}
                                                />
                                                {r.identity && (
                                                    <button
                                                        type="button"
                                                        className="button button--link button--sm"
                                                        style={{ padding: 0, marginTop: '0.15rem' }}
                                                        onClick={() => copyIdentity(r.identity)}
                                                    >
                                                        Copy
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {showScrollTop && (
                    <button
                        type="button"
                        className="button button--primary button--sm"
                        onClick={scrollToTop}
                        style={{
                            position: 'fixed',
                            bottom: '1.5rem',
                            right: '1.5rem',
                            borderRadius: '999px',
                            boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                            zIndex: 40,
                        }}
                        aria-label="Back to top"
                    >
                        Back to top
                    </button>
                )}
            </main>
        </Layout>
    );
}
