import React, { useState } from 'react';
import { Clipboard, Trash2, Copy } from 'lucide-react';
import { jsonToTs, tsToJson } from '../converters';

export default function TsConverter({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [typeName, setTypeName] = useState('UserResponse');

  const handleJsonToTsAction = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const output = jsonToTs(input, typeName);
      setOutput(output);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleTsToJsonAction = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const output = tsToJson(input);
      setOutput(output);
    } catch (e) {
      setError(e.message);
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
        <h2>JSON &lt;&gt; TypeScript Interface Converter</h2>
        <p className="panel-desc">Generate type-safe TypeScript interfaces from JSON data, or convert TypeScript types back into structured mock JSON.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Input (JSON or TypeScript interface/type)</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON or TypeScript type definition here..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <div className="control-group">
            <label>TS Type Name:</label>
            <input 
              type="text" 
              value={typeName} 
              onChange={(e) => setTypeName(e.target.value)}
              placeholder="UserResponse" 
            />
          </div>
          <button className="primary-btn btn-glow" onClick={handleJsonToTsAction}>JSON &rarr; TS Type</button>
          <button className="primary-btn btn-glow-purple" onClick={handleTsToJsonAction}>TS Type &rarr; JSON</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Generated Result</span>
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
