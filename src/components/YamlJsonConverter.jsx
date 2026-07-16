import React, { useState } from 'react';
import { Clipboard, Trash2, Copy, ArrowDown, ArrowUp } from 'lucide-react';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

export default function YamlJsonConverter({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleYamlToJson = () => {
    setError('');
    if (!input.trim()) { setOutput(''); return; }
    try {
      const parsed = yamlLoad(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError('YAML parse error: ' + e.message);
      setOutput('');
    }
  };

  const handleJsonToYaml = () => {
    setError('');
    if (!input.trim()) { setOutput(''); return; }
    try {
      const parsed = JSON.parse(input);
      setOutput(yamlDump(parsed, { indent: 2, lineWidth: -1, noRefs: true }));
    } catch (e) {
      setError('JSON parse error: ' + e.message);
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
        <h2>YAML &lt;&gt; JSON Converter</h2>
        <p className="panel-desc">Convert between YAML and JSON. Great for config files, CI pipelines, and API payloads.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Input (YAML or JSON)</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste YAML or JSON here..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <button className="primary-btn btn-glow" onClick={handleYamlToJson}><ArrowDown size={16} /> YAML → JSON</button>
          <button className="primary-btn btn-glow-purple" onClick={handleJsonToYaml}><ArrowUp size={16} /> JSON → YAML</button>
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
