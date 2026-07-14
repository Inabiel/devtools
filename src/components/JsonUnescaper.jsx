import React, { useState } from 'react';
import { Clipboard, Trash2, Copy, Sparkles, WrapText } from 'lucide-react';
import { escapeJson, unescapeJson } from '../converters';

export default function JsonUnescaper({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleUnescapeAction = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const output = unescapeJson(input);
      setOutput(output);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleEscapeAction = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const output = escapeJson(input);
      setOutput(output);
    } catch (e) {
      setError('Failed to escape: ' + e.message);
      setOutput('');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <section className="tool-panel active">
      <div className="panel-header">
        <h2>JSON Unescaper</h2>
        <p className="panel-desc">Strip backslashes and unescape stringified JSON into clean JSON objects.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Escaped JSON String</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder='Paste escaped string here... e.g. "{\"name\":\"Nabil\",\"role\":\"developer\"}"'
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <button className="primary-btn btn-glow" onClick={handleUnescapeAction}><Sparkles size={16} /> Unescape JSON</button>
          <button className="secondary-btn" onClick={handleEscapeAction}><WrapText size={16} /> Escape JSON</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Output JSON</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => copyToClipboard(output)}><Copy size={14} /> Copy</button>
            </div>
          </div>
          <div className="card-body">
            {error && <div className="error-banner">{error}</div>}
            <pre className="code-output"><code>{output}</code></pre>
          </div>
        </div>
      </div>
    </section>
  );
}
