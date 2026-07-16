import React, { useState } from 'react';
import { Clipboard, Trash2, Copy } from 'lucide-react';

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}

export default function JwtDecoder({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [error, setError] = useState('');
  const [expiryInfo, setExpiryInfo] = useState('');

  const handleDecode = () => {
    setError('');
    setHeader('');
    setPayload('');
    setExpiryInfo('');
    if (!input.trim()) return;

    try {
      const parts = input.trim().split('.');
      if (parts.length !== 3) {
        setError('Not a valid JWT: expected 3 dot-separated parts (header.payload.signature)');
        return;
      }

      const headerObj = JSON.parse(base64UrlDecode(parts[0]));
      const payloadObj = JSON.parse(base64UrlDecode(parts[1]));

      setHeader(JSON.stringify(headerObj, null, 2));
      setPayload(JSON.stringify(payloadObj, null, 2));

      if (payloadObj.exp) {
        const expDate = new Date(payloadObj.exp * 1000);
        const now = new Date();
        if (expDate < now) {
          setExpiryInfo(`⛔ Expired at ${expDate.toLocaleString()} (${Math.floor((now - expDate) / 60000)}m ago)`);
        } else {
          setExpiryInfo(`✅ Valid until ${expDate.toLocaleString()} (${Math.floor((expDate - now) / 60000)}m remaining)`);
        }
      } else {
        setExpiryInfo('No expiration claim (exp) in token');
      }
    } catch (e) {
      setError('Failed to decode JWT: ' + e.message);
    }
  };

  const handleClear = () => {
    setInput('');
    setHeader('');
    setPayload('');
    setError('');
    setExpiryInfo('');
  };

  return (
    <section className="tool-panel active">
      <div className="panel-header">
        <h2>JWT Decoder</h2>
        <p className="panel-desc">Paste a JWT token to inspect the header and payload claims. Decoding happens entirely in your browser.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>JWT Token</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JWT token here... e.g. eyJhbGciOiJIUzI1NiIs..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <button className="primary-btn btn-glow" onClick={handleDecode}>Decode JWT</button>
          {expiryInfo && <span className={`expiry-badge ${expiryInfo.startsWith('⛔') ? 'expired' : 'valid'}`}>{expiryInfo}</span>}
        </div>

        <div className="dual-output">
          <div className="card">
            <div className="card-header">
              <span>Header</span>
              <div className="card-actions">
                <button className="action-btn" onClick={() => copyToClipboard(header)}><Copy size={14} /> Copy</button>
              </div>
            </div>
            <div className="card-body">
              {error && <div className="error-banner">{error}</div>}
              <pre className="code-output"><code>{header}</code></pre>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <span>Payload</span>
              <div className="card-actions">
                <button className="action-btn" onClick={() => copyToClipboard(payload)}><Copy size={14} /> Copy</button>
              </div>
            </div>
            <div className="card-body">
              <pre className="code-output"><code>{payload}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
