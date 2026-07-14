import React, { useState } from 'react';
import { Clipboard, Trash2, Copy } from 'lucide-react';
import { jsonToGo, goToJson } from '../converters';

export default function GoConverter({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [structName, setStructName] = useState('Config');

  const handleJsonToGoAction = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const output = jsonToGo(input, structName);
      setOutput(output);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleGoToJsonAction = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const output = goToJson(input);
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
        <h2>JSON &lt;&gt; Go Struct Converter</h2>
        <p className="panel-desc">Convert standard JSON schemas into idiomatic Go structs (with json tags), or parse a Go struct back to template JSON.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Input (JSON or Go Struct)</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste JSON or Go Struct here..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <div className="control-group">
            <label>Go Struct Name:</label>
            <input 
              type="text" 
              value={structName} 
              onChange={(e) => setStructName(e.target.value)}
              placeholder="Config" 
            />
          </div>
          <button className="primary-btn btn-glow" onClick={handleJsonToGoAction}>JSON &rarr; Go Struct</button>
          <button className="primary-btn btn-glow-purple" onClick={handleGoToJsonAction}>Go Struct &rarr; JSON</button>
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
