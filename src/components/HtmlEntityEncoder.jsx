import React, { useState } from 'react';
import { Clipboard, Trash2, Copy, Code2, FileCode2 } from 'lucide-react';

const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const REVERSE_ENTITY_MAP = Object.fromEntries(
  Object.entries(ENTITY_MAP).map(([k, v]) => [v, k])
);

// Extended named entities for decode
const NAMED_ENTITIES = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': '\u00A0',
  '&copy;': '\u00A9',
  '&reg;': '\u00AE',
  '&trade;': '\u2122',
  '&euro;': '\u20AC',
  '&pound;': '\u00A3',
  '&yen;': '\u00A5',
  '&cent;': '\u00A2',
};

export default function HtmlEntityEncoder({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEncode = () => {
    setError('');
    if (!input) { setOutput(''); return; }
    try {
      const encoded = input.replace(/[&<>"']/g, (ch) => ENTITY_MAP[ch] || ch);
      setOutput(encoded);
    } catch (e) {
      setError('Encoding failed: ' + e.message);
      setOutput('');
    }
  };

  const handleDecode = () => {
    setError('');
    if (!input) { setOutput(''); return; }
    try {
      // Use browser's native HTML parser for robust decoding
      const textarea = document.createElement('textarea');
      textarea.innerHTML = input;
      setOutput(textarea.value);
    } catch (e) {
      // Fallback: manual decode of common entities
      try {
        const decoded = input.replace(/&[#\w]+;/g, (entity) => {
          if (entity.startsWith('&#x')) {
            return String.fromCharCode(parseInt(entity.slice(3, -1), 16));
          }
          if (entity.startsWith('&#')) {
            return String.fromCharCode(parseInt(entity.slice(2, -1), 10));
          }
          return NAMED_ENTITIES[entity] || entity;
        });
        setOutput(decoded);
      } catch (innerErr) {
        setError('Decoding failed: ' + e.message);
        setOutput('');
      }
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
        <h2>HTML Entity Encoder &amp; Decoder</h2>
        <p className="panel-desc">Encode special characters to HTML entities (e.g. &amp;lt; → &amp;amp;lt;) or decode them back.</p>
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
              placeholder="Enter text or HTML entities to encode/decode..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <button className="primary-btn btn-glow" onClick={handleEncode}><Code2 size={16} /> Encode Entities</button>
          <button className="primary-btn btn-glow-purple" onClick={handleDecode}><FileCode2 size={16} /> Decode Entities</button>
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
