import React, { useState, useCallback } from 'react';
import { Clipboard, Copy, Clock, ArrowRight } from 'lucide-react';

function formatDate(d) {
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export default function TimestampConverter({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState({ human: '', iso: '', unixSeconds: '', unixMs: '' });
  const [error, setError] = useState('');

  const convert = useCallback((val) => {
    setError('');
    const v = val.trim();
    if (!v) { setOutput({ human: '', iso: '', unixSeconds: '', unixMs: '' }); return; }

    try {
      let date;

      // Try unix timestamp (seconds or milliseconds)
      if (/^-?\d+$/.test(v)) {
        const num = parseInt(v, 10);
        if (num > 1e15) {
          date = new Date(num); // nanoseconds — treat as ms for practical purposes
        } else if (num > 1e12) {
          date = new Date(num); // milliseconds
        } else {
          date = new Date(num * 1000); // seconds
        }
      } else {
        // Try parsing as date string
        date = new Date(v);
      }

      if (isNaN(date.getTime())) {
        setError('Could not parse input. Try a Unix timestamp (e.g. 1700000000) or ISO date (e.g. 2023-11-14T22:13:20Z).');
        setOutput({ human: '', iso: '', unixSeconds: '', unixMs: '' });
        return;
      }

      setOutput({
        human: date.toLocaleString(),
        iso: date.toISOString(),
        unixSeconds: Math.floor(date.getTime() / 1000).toString(),
        unixMs: date.getTime().toString(),
      });
    } catch (e) {
      setError('Conversion failed: ' + e.message);
    }
  }, []);

  const handleInput = (val) => {
    setInput(val);
    convert(val);
  };

  return (
    <section className="tool-panel active">
      <div className="panel-header">
        <h2>Unix Timestamp Converter</h2>
        <p className="panel-desc">Convert between Unix timestamps, ISO 8601, and human-readable dates. Live conversion as you type.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Input (timestamp or date string)</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => {
                const now = Math.floor(Date.now() / 1000).toString();
                setInput(now);
                convert(now);
              }}><Clock size={14} /> Now</button>
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput).then(() => {
                // Trigger conversion after paste via input change
              })}><Clipboard size={14} /> Paste</button>
            </div>
          </div>
          <div className="card-body">
            <textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Enter Unix timestamp (seconds or ms) or ISO date string..."
              spellCheck="false"
              rows="3"
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Converted Results</span>
          </div>
          <div className="card-body">
            {error && <div className="error-banner">{error}</div>}
            {output.unixSeconds && (
              <div className="timestamp-results">
                <div className="ts-row">
                  <span className="ts-label">Human-readable:</span>
                  <span className="ts-value">{output.human}</span>
                  <button className="action-btn" onClick={() => copyToClipboard(output.human)}><Copy size={12} /></button>
                </div>
                <div className="ts-row">
                  <span className="ts-label">ISO 8601:</span>
                  <span className="ts-value mono">{output.iso}</span>
                  <button className="action-btn" onClick={() => copyToClipboard(output.iso)}><Copy size={12} /></button>
                </div>
                <div className="ts-row">
                  <span className="ts-label">Unix (seconds):</span>
                  <span className="ts-value mono">{output.unixSeconds}</span>
                  <button className="action-btn" onClick={() => copyToClipboard(output.unixSeconds)}><Copy size={12} /></button>
                </div>
                <div className="ts-row">
                  <span className="ts-label">Unix (milliseconds):</span>
                  <span className="ts-value mono">{output.unixMs}</span>
                  <button className="action-btn" onClick={() => copyToClipboard(output.unixMs)}><Copy size={12} /></button>
                </div>
              </div>
            )}
            {!output.unixSeconds && !error && <p className="placeholder-hint">Enter a value above to see conversions</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
