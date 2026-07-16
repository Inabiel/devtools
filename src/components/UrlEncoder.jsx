import React, { useState } from 'react';
import { Clipboard, Trash2, Copy, Link, Unlink } from 'lucide-react';

export default function UrlEncoder({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEncode = () => {
    setError('');
    if (!input) { setOutput(''); return; }
    try {
      setOutput(encodeURIComponent(input));
    } catch (e) {
      setError('Encoding failed: ' + e.message);
      setOutput('');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!input) { setOutput(''); return; }
    try {
      setOutput(decodeURIComponent(input));
    } catch (e) {
      setError('Decoding failed (malformed input): ' + e.message);
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
        <h2>URL Encoder &amp; Decoder</h2>
        <p className="panel-desc">Encode or decode URL components (percent-encoding / application/x-www-form-urlencoded).</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Input</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text or URL-encoded string..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <button className="primary-btn btn-glow" onClick={handleEncode}><Link size={16} /> URL Encode</button>
          <button className="primary-btn btn-glow-purple" onClick={handleDecode}><Unlink size={16} /> URL Decode</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Output</span>
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
