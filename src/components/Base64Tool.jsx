import React, { useState } from 'react';
import { Clipboard, Trash2, Copy, Lock, Unlock } from 'lucide-react';

export default function Base64Tool({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);

  const handleEncode = () => {
    setError('');
    if (!input) {
      setOutput('');
      return;
    }
    try {
      let encoded = btoa(unescape(encodeURIComponent(input)));
      if (urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      setOutput(encoded);
    } catch (e) {
      setError('Encoding failed: ' + e.message);
      setOutput('');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!input) {
      setOutput('');
      return;
    }
    try {
      let normalized = input.trim();
      if (urlSafe) {
        normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
        while (normalized.length % 4) {
          normalized += '=';
        }
      }
      const decoded = decodeURIComponent(escape(atob(normalized)));
      setOutput(decoded);
    } catch (e) {
      setError('Invalid Base64 format: ' + e.message);
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
        <h2>Base64 Encode &amp; Decode</h2>
        <p className="panel-desc">Fast, secure local encoding and decoding of Base64 strings.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Plaintext / Base64 Input</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter plaintext or base64 string..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <div className="control-group">
            <input 
              type="checkbox" 
              id="base64-urlsafe" 
              className="custom-checkbox" 
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
            />
            <label htmlFor="base64-urlsafe">Safe for URLs</label>
          </div>
          <button className="primary-btn btn-glow" onClick={handleEncode}><Lock size={16} /> Base64 Encode</button>
          <button className="primary-btn btn-glow-purple" onClick={handleDecode}><Unlock size={16} /> Base64 Decode</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Output Result</span>
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
