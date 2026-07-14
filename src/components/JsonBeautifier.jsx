import React, { useState } from 'react';
import { Clipboard, Trash2, Copy, Sparkles, Minimize2 } from 'lucide-react';

export default function JsonBeautifier({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState('2');

  const handleBeautify = (minify = false) => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      if (minify) {
        setOutput(JSON.stringify(parsed));
      } else {
        const space = indentSize === 'tab' ? '\t' : parseInt(indentSize, 10);
        setOutput(JSON.stringify(parsed, null, space));
      }
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
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
        <h2>JSON Beautifier</h2>
        <p className="panel-desc">Format and validate raw JSON strings into clean, readable code.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Input JSON</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder='Paste your raw JSON here... e.g. {"name":"Nabil","tools":["json","k8s"]}'
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <div className="control-group">
            <label>Tab size:</label>
            <select value={indentSize} onChange={(e) => setIndentSize(e.target.value)}>
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">1 Tab</option>
            </select>
          </div>
          <button className="primary-btn btn-glow" onClick={() => handleBeautify(false)}><Sparkles size={16} /> Beautify</button>
          <button className="secondary-btn" onClick={() => handleBeautify(true)}><Minimize2 size={16} /> Minify</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span>Formatted Output</span>
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
