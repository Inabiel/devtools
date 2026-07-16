import React, { useState, useCallback, useMemo } from 'react';
import { Clipboard, Trash2, Copy, Search } from 'lucide-react';

export default function RegexTester({ copyToClipboard, pasteFromClipboard }) {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState('');
  const [matches, setMatches] = useState([]);

  const handleTest = useCallback(() => {
    setError('');
    setMatches([]);
    if (!pattern) return;

    try {
      const regex = new RegExp(pattern, flags);
      const results = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            index: match.index,
            full: match[0],
            groups: match.slice(1).map((g, i) => ({ name: i + 1, value: g })),
          });
          if (match[0].length === 0) regex.lastIndex++; // Avoid infinite loop on zero-length matches
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          results.push({
            index: match.index,
            full: match[0],
            groups: match.slice(1).map((g, i) => ({ name: i + 1, value: g })),
          });
        }
      }

      setMatches(results);
      if (results.length === 0) setError('No matches found');
    } catch (e) {
      setError('Invalid regex: ' + e.message);
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  const highlightedText = useMemo(() => {
    if (!pattern || matches.length === 0) return testString;

    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const parts = [];
      let lastIndex = 0;
      let m;

      while ((m = regex.exec(testString)) !== null) {
        if (m.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, m.index), highlight: false });
        }
        parts.push({ text: m[0], highlight: true });
        lastIndex = regex.lastIndex;
        if (m[0].length === 0) regex.lastIndex++;
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), highlight: false });
      }
      return parts;
    } catch {
      return testString;
    }
  }, [pattern, flags, testString, matches]);

  const handleClear = () => {
    setPattern('');
    setFlags('g');
    setTestString('');
    setMatches([]);
    setError('');
  };

  return (
    <section className="tool-panel active">
      <div className="panel-header">
        <h2>Regex Tester</h2>
        <p className="panel-desc">Write and test regular expressions in real-time. See matches, groups, and highlighted results.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Pattern &amp; Test String</span>
            <div className="card-actions">
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body regex-inputs">
            <div className="regex-row">
              <span className="regex-slash">/</span>
              <input
                type="text"
                className="regex-pattern-input"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="pattern"
                spellCheck="false"
              />
              <span className="regex-slash">/</span>
              <input
                type="text"
                className="regex-flags-input"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="g"
                spellCheck="false"
                maxLength="6"
              />
            </div>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter test string here..."
              spellCheck="false"
              className="regex-test-input"
            />
          </div>
        </div>

        <div className="controls-bar">
          <button className="action-btn" onClick={() => pasteFromClipboard(setTestString)}><Clipboard size={14} /> Paste test string</button>
          <button className="primary-btn btn-glow" onClick={handleTest}><Search size={16} /> Test Regex</button>
          {matches.length > 0 && <span className="match-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>}
        </div>

        <div className="card">
          <div className="card-header">
            <span>Results</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => copyToClipboard(JSON.stringify(matches.map(m => m.full), null, 2))}><Copy size={14} /> Copy matches</button>
            </div>
          </div>
          <div className="card-body">
            {error && <div className="error-banner">{error}</div>}

            {highlightedText && typeof highlightedText === 'string' ? (
              <pre className="code-output"><code>{highlightedText}</code></pre>
            ) : highlightedText && highlightedText.length > 0 && (
              <div className="highlighted-text">
                {highlightedText.map((part, i) =>
                  part.highlight
                    ? <mark key={i} className="regex-highlight">{part.text}</mark>
                    : <span key={i}>{part.text}</span>
                )}
              </div>
            )}

            {matches.length > 0 && (
              <div className="match-details">
                {matches.map((m, i) => (
                  <div key={i} className="match-row">
                    <span className="match-index">Match {i + 1} @ {m.index}:</span>
                    <code className="match-full">{m.full}</code>
                    {m.groups.filter(g => g.value !== undefined).length > 0 && (
                      <span className="match-groups">
                        {m.groups.filter(g => g.value !== undefined).map((g, j) => (
                          <span key={j} className="group-badge">Group {g.name}: <code>{g.value}</code></span>
                        ))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
