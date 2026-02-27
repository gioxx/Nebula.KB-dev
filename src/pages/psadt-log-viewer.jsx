import React, { useState, useRef } from 'react';
import Layout from '@theme/Layout';
import Admonition from '@theme/Admonition';

const HeaderIcon = () => (
    <span aria-hidden="true" style={{ color: 'var(--ifm-color-primary)' }}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 64, height: 64 }}
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <path d="M12 21h-5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v4.5" />
            <path d="M16.5 17.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
            <path d="M18.5 19.5l2.5 2.5" />
        </svg>
    </span>
);

/**
 * Parse a single PSADT/CMTrace-style line.
 */
function parseCmTraceLine(line) {
    const msgMatch = line.match(/<!\[LOG\[(.*?)]LOG]!>/);
    if (!msgMatch) return null;

    const rawMessage = msgMatch[1];

    // Skip pure "separator" lines made only of dashes (and whitespace)
    const separatorStripped = rawMessage.replace(/[-\s]/g, '');
    if (!separatorStripped.length) {
        return null; // do not create an entry for this line
    }

    const attrPart = line.slice(msgMatch.index + msgMatch[0].length);

    const getAttr = (name) => {
        const match = attrPart.match(new RegExp(name + '="([^"]*)"'));
        return match ? match[1] : '';
    };

    const timeRaw = getAttr('time');
    const dateRaw = getAttr('date');
    const component = getAttr('component');
    const context = getAttr('context');
    const typeRaw = getAttr('type');
    const thread = getAttr('thread');

    const { time } = normalizeTime(timeRaw);
    const { level, levelName } = mapTypeToLevelPsadt(typeRaw);

    // Optional section detection
    let scriptSection = '';
    const sectionMatch = rawMessage.match(/^\[(.+?)\]/);
    if (sectionMatch) {
        scriptSection = sectionMatch[1];
    }

    return {
        id: `${dateRaw || ''}_${timeRaw || ''}_${component || ''}_${thread || ''}_${rawMessage.slice(0, 20)}`,
        date: dateRaw,
        time,
        component,
        context,
        typeRaw,
        level,
        levelName,
        thread,
        scriptSection,
        message: rawMessage,
    };
}


/**
 * Normalize CMTrace-style time field.
 */
function normalizeTime(timeRaw) {
    if (!timeRaw) return { time: '', offset: '' };
    const parts = timeRaw.split('+');
    return { time: parts[0] || '', offset: parts[1] || '' };
}

/**
 * Map PSADT numeric severity to human-readable level.
 * 0 = Success
 * 1 = Info
 * 2 = Warning
 * 3 = Error
 * 4/5 = Debug
 */
function mapTypeToLevelPsadt(typeRaw) {
    const t = parseInt(typeRaw, 10);
    switch (t) {
        case 0:
            return { level: 'Success', levelName: 'Success' };
        case 1:
            return { level: 'Info', levelName: 'Information' };
        case 2:
            return { level: 'Warning', levelName: 'Warning' };
        case 3:
            return { level: 'Error', levelName: 'Error' };
        case 4:
        case 5:
            return { level: 'Debug', levelName: 'Debug' };
        default:
            return { level: 'Unknown', levelName: `Unknown (${typeRaw})` };
    }
}

/**
 * Parse entire log text into entries.
 * Handles multiline log entries by appending to previous message.
 */
function parseLogText(text) {
    const lines = text.split(/\r?\n/);
    const entries = [];
    let last = null;

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        const parsed = parseCmTraceLine(line);
        if (parsed) {
            entries.push(parsed);
            last = parsed;
        } else if (last) {
            // Multiline continuation
            last.message += '\n' + rawLine;
        }
    }

    const components = [...new Set(entries.map((e) => e.component).filter(Boolean))].sort();

    return { entries, components };
}

/**
 * Filter entries by level, component and message text.
 */
function filterEntries(entries, level, component, text) {
    const t = text.toLowerCase();
    return entries.filter((e) => {
        if (level !== 'all' && e.level !== level) return false;
        if (component !== 'all' && e.component !== component) return false;
        if (t && !e.message.toLowerCase().includes(t)) return false;
        return true;
    });
}

/**
 * Export entries to CSV.
 * (kept for future use, hidden in UI)
 */
function exportToCsv(entries) {
    const headers = ['Date', 'Time', 'Component', 'Thread', 'Type', 'Message'];
    const rows = entries.map((e) => [
        e.date,
        e.time,
        e.component,
        e.thread,
        e.levelName,
        e.message,
    ]);

    const escapeCsv = (v) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const content = [
        headers.join(','),
        ...rows.map((r) => r.map(escapeCsv).join(',')),
    ].join('\r\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'psadt_log_export.csv';
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Export entries to JSON.
 * (kept for future use, hidden in UI)
 */
function exportToJson(entries) {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
        type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'psadt_log_export.json';
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Highlight matches of `query` inside a single-line `text`.
 */
function highlightLine(text, query) {
    if (!query) return text;
    const lower = text.toLowerCase();
    const q = query.toLowerCase();
    const parts = [];
    let start = 0;
    let index;
    let key = 0;

    while ((index = lower.indexOf(q, start)) !== -1) {
        if (index > start) {
            parts.push(text.slice(start, index));
        }
        parts.push(
            <mark key={`h-${key++}`}>{text.slice(index, index + q.length)}</mark>
        );
        start = index + q.length;
    }
    if (start < text.length) {
        parts.push(text.slice(start));
    }
    return parts;
}

/**
 * Highlight inside a multi-line message, preserving line breaks.
 */
function renderHighlightedMultiline(text, query) {
    const lines = text.split('\n');
    return lines.map((line, idx) => (
        <React.Fragment key={idx}>
            {highlightLine(line, query)}
            {idx < lines.length - 1 && <br />}
        </React.Fragment>
    ));
}

/**
 * Compute summary data for the panel.
 */
function computeSummary(entries) {
    if (!entries.length) {
        return {
            total: 0,
            perLevel: {
                Success: 0,
                Info: 0,
                Warning: 0,
                Error: 0,
                Debug: 0,
                Unknown: 0,
            },
            components: 0,
            start: null,
            end: null,
        };
    }

    const perLevel = {
        Success: 0,
        Info: 0,
        Warning: 0,
        Error: 0,
        Debug: 0,
        Unknown: 0,
    };
    const compSet = new Set();

    entries.forEach((e) => {
        if (perLevel[e.level] !== undefined) {
            perLevel[e.level]++;
        } else {
            perLevel.Unknown++;
        }
        if (e.component) compSet.add(e.component);
    });

    const start = entries[0];
    const end = entries[entries.length - 1];

    return {
        total: entries.length,
        perLevel,
        components: compSet.size,
        start,
        end,
    };
}

export default function PsadtLogViewerPage() {
    const [rawText, setRawText] = useState('');
    const [entries, setEntries] = useState([]);
    const [components, setComponents] = useState([]);
    const [filterLevel, setFilterLevel] = useState('all');
    const [filterComponent, setFilterComponent] = useState('all');
    const [filterText, setFilterText] = useState('');
    const [fileInfo, setFileInfo] = useState('');
    const [expandedMessages, setExpandedMessages] = useState({});

    const tableWrapperRef = useRef(null);

    const filteredEntries = filterEntries(entries, filterLevel, filterComponent, filterText);
    const summary = computeSummary(entries);

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target.result || '';
            setRawText(content);
            setFileInfo(`Loaded file: ${file.name} (${file.size} bytes)`);

            // Auto-parse when loading a file
            const result = parseLogText(content);
            setEntries(result.entries);
            setComponents(result.components);
            setFilterComponent('all');
            setExpandedMessages({});
        };
        reader.readAsText(file);
    }

    function handleParseClick() {
        const result = parseLogText(rawText);
        setEntries(result.entries);
        setComponents(result.components);
        setFilterComponent('all');
        setExpandedMessages({});
    }

    function toggleExpandMessage(id) {
        setExpandedMessages((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }

    // Status message
    let statusMessage = '';
    if (!entries.length) {
        statusMessage = rawText.trim()
            ? 'No valid PSADT entries found.'
            : fileInfo || 'No data loaded.';
    } else {
        const prefix = fileInfo ? fileInfo + ' – ' : '';
        statusMessage =
            filteredEntries.length === entries.length
                ? `${prefix}Showing ${entries.length} entries.`
                : `${prefix}Showing ${filteredEntries.length} of ${entries.length} entries (filtered).`;
    }

    return (
        <Layout
            title="PSADT Log Viewer"
            description="Inspect, filter and analyze PSADT style logs."
        >
            <style>{`
            .psadt-tableWrapper {
                overflow-x: auto;     /* horizontal scroll */
                overflow-y: visible;  /* no inner vertical scroll */
                margin-bottom: 1rem;
            }
            .psadt-status {
                font-size: .9rem;
                color: var(--ifm-color-secondary-text);
            }
            .psadt-rowError  { background: var(--ifm-color-danger-contrast-background); }
            .psadt-rowWarning{ background: var(--ifm-color-warning-contrast-background); }
            .psadt-level-Success { color: var(--ifm-color-success); font-weight: 600; }
            .psadt-level-Error   { color: var(--ifm-color-danger); font-weight: 600; }
            .psadt-level-Warning { color: var(--ifm-color-warning); font-weight: 600; }
            .psadt-level-Info    { color: var(--ifm-color-primary); }
            .psadt-level-Debug   { color: var(--ifm-color-secondary); }

            /* compact table font & padding */
            .psadt-table {
                font-size: 0.85rem;
            }
            .psadt-table th,
            .psadt-table td {
                padding: 0.25rem 0.5rem;
            }

            .psadt-summaryCard {
                border-radius: var(--ifm-global-radius);
                border: 1px solid var(--ifm-toc-border-color);
                padding: 0.75rem 1rem;
                margin-top: 1rem;
                margin-bottom: 0.5rem;
            }
            .psadt-summaryRow {
                display: flex;
                flex-wrap: wrap;
                gap: .75rem;
                font-size: 0.9rem;
            }
            .psadt-summaryItem {
                min-width: 120px;
            }
            .psadt-messageCell button {
                margin-top: 0.25rem;
            }
            `}</style>

            <main className="container margin-vert--lg">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <HeaderIcon />
                    <div>
                        <h1 className="margin-bottom--sm">PSADT Log Viewer</h1>
                        <p className="margin-bottom--md" style={{ marginBottom: 0 }}>
                            This tool lets you inspect PSAppDeployToolkit / CMTrace-style log files directly in your browser.<br />
                            You can either load a log file or paste its content, then filter by level, component and message text.
                        </p>
                    </div>
                </div>

                <p className="margin-bottom--md" style={{ fontSize: '.85rem', color: 'var(--ifm-color-secondary-text)', marginTop: '1rem' }}>
                    <Admonition type="danger" title="Data Privacy">
                        Everything stays in your browser; no files are uploaded or stored on the server.<br/>
                        All analysis is performed by your browser.
                    </Admonition>
                </p>

                {/* Upload + Parse */}
                <div className="margin-bottom--md">
                    <label
                        className="button button--secondary button--sm"
                        style={{ cursor: 'pointer', marginRight: '0.5rem' }}
                    >
                        Choose log file
                        <input
                            type="file"
                            accept=".log,.txt"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                    </label>

                    <button
                        className="button button--primary button--sm"
                        onClick={handleParseClick}
                    >
                        Parse log
                    </button>

                    {/* EXPORT BUTTONS — HIDDEN, KEPT FOR FUTURE */}
                    {false && (
                        <>
                            <button
                                className="button button--secondary button--sm margin-left--sm"
                                onClick={() => exportToCsv(filteredEntries)}
                            >
                                Export CSV
                            </button>
                            <button
                                className="button button--secondary button--sm margin-left--sm"
                                onClick={() => exportToJson(filteredEntries)}
                            >
                                Export JSON
                            </button>
                        </>
                    )}
                </div>

                {/* Raw log textarea */}
                <textarea
                    style={{ width: '100%', minHeight: '220px' }}
                    placeholder="Paste PSADT log here or load a file ..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                />

                {/* Summary + filters + status only if we have entries */}
                {entries.length > 0 && (
                    <>
                        {/* Summary panel */}
                        <div className="psadt-summaryCard">
                            <div className="psadt-summaryRow">
                                <div className="psadt-summaryItem">
                                    <strong>Total entries:</strong> {summary.total}
                                </div>
                                <div className="psadt-summaryItem">
                                    <strong>Success:</strong> {summary.perLevel.Success}
                                </div>
                                <div className="psadt-summaryItem">
                                    <strong>Info:</strong> {summary.perLevel.Info}
                                </div>
                                <div className="psadt-summaryItem">
                                    <strong>Warning:</strong> {summary.perLevel.Warning}
                                </div>
                                <div className="psadt-summaryItem">
                                    <strong>Error:</strong> {summary.perLevel.Error}
                                </div>
                                <div className="psadt-summaryItem">
                                    <strong>Debug:</strong> {summary.perLevel.Debug}
                                </div>
                                <div className="psadt-summaryItem">
                                    <strong>Unknown:</strong> {summary.perLevel.Unknown}
                                </div>
                            </div>
                            <div className="psadt-summaryRow" style={{ marginTop: '.4rem' }}>
                                <div className="psadt-summaryItem">
                                    <strong>Components:</strong> {summary.components}
                                </div>
                                {summary.start && summary.end && (
                                    <>
                                        <div className="psadt-summaryItem">
                                            <strong>Start:</strong>{' '}
                                            {summary.start.date} {summary.start.time}
                                        </div>
                                        <div className="psadt-summaryItem">
                                            <strong>End:</strong>{' '}
                                            {summary.end.date} {summary.end.time}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Filters row */}
                        <div className="row margin-top--md margin-bottom--sm">
                            <div className="col col--4">
                                <span style={{ fontSize: '0.85rem' }}>Level</span>
                                <select
                                    style={{ width: '100%', marginTop: 4 }}
                                    value={filterLevel}
                                    onChange={(e) => setFilterLevel(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="Success">Success</option>
                                    <option value="Info">Info</option>
                                    <option value="Warning">Warning</option>
                                    <option value="Error">Error</option>
                                    <option value="Debug">Debug</option>
                                    <option value="Unknown">Unknown</option>
                                </select>
                            </div>

                            <div className="col col--4">
                                <span style={{ fontSize: '0.85rem' }}>Component</span>
                                <select
                                    style={{ width: '100%', marginTop: 4 }}
                                    value={filterComponent}
                                    onChange={(e) => setFilterComponent(e.target.value)}
                                >
                                    <option value="all">All components</option>
                                    {components.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col col--4">
                                <span style={{ fontSize: '0.85rem' }}>Message contains</span>
                                <input
                                    type="text"
                                    style={{ width: '100%', marginTop: 4 }}
                                    placeholder="Text filter..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                            </div>
                        </div>

                        <p className="psadt-status">{statusMessage}</p>
                    </>
                )}

                {/* Table only after parse */}
                {entries.length > 0 && (
                    <div ref={tableWrapperRef} className="psadt-tableWrapper">
                        <table className="table psadt-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Message</th>
                                    <th>Component</th>
                                    <th>Date/Time</th>
                                    <th>Thread</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((e, index) => {
                                    const rowClass =
                                        e.level === 'Error'
                                            ? 'psadt-rowError'
                                            : e.level === 'Warning'
                                                ? 'psadt-rowWarning'
                                                : '';
                                    const levelClass = e.level ? 'psadt-level-' + e.level : '';

                                    const isMultiline = e.message.includes('\n');
                                    const isExpanded = !!expandedMessages[e.id];

                                    let messageText;
                                    if (isMultiline && !isExpanded) {
                                        const firstLine = e.message.split('\n')[0];
                                        messageText = `${firstLine} …`;
                                    } else {
                                        messageText = e.message;
                                    }

                                    const highlightedMessage = isMultiline && isExpanded
                                        ? renderHighlightedMultiline(messageText, filterText)
                                        : highlightLine(messageText, filterText);

                                    return (
                                        <tr key={e.id || index} className={rowClass}>
                                            <td>{index + 1}</td>
                                            <td className="psadt-messageCell" style={{ whiteSpace: 'pre-wrap' }}>
                                                {highlightedMessage}
                                                {isMultiline && (
                                                    <div>
                                                        <button
                                                            type="button"
                                                            className="button button--link button--sm"
                                                            onClick={() => toggleExpandMessage(e.id)}
                                                        >
                                                            {isExpanded ? 'Show less' : 'Show more'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td>{e.component}</td>
                                            <td>{e.date} {e.time}</td>
                                            <td className={levelClass}>{e.thread}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

            </main>
        </Layout>
    );
}
