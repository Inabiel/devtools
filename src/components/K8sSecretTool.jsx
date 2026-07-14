import React, { useState } from 'react';
import { Clipboard, Trash2, Copy } from 'lucide-react';
import { k8sToEnv, envToK8s } from '../converters';

export default function K8sSecretTool({ copyToClipboard, pasteFromClipboard }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [secretName, setSecretName] = useState('app-secrets');
  const [exportFormat, setExportFormat] = useState(false);

  const handleK8sToEnvAction = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const output = k8sToEnv(input, exportFormat);
      setOutput(output);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleEnvToK8sAction = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const output = envToK8s(input, secretName);
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
        <h2>Kubernetes Secret &amp; .env Converter</h2>
        <p className="panel-desc">Convert K8s Secret YAML manifests to .env variables or linux export statements, or convert environmental keys into Base64 Kubernetes Secret manifests.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Source (YAML Secret or .env/export text)</span>
            <div className="card-actions">
              <button className="action-btn" onClick={() => pasteFromClipboard(setInput)}><Clipboard size={14} /> Paste</button>
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste Kubernetes Secret YAML or .env key=value pairs (or export key=value) here..."
              spellCheck="false"
            />
          </div>
        </div>

        <div className="controls-bar">
          <div className="control-group">
            <label>Secret Name:</label>
            <input 
              type="text" 
              value={secretName} 
              onChange={(e) => setSecretName(e.target.value)}
              placeholder="app-secrets" 
            />
          </div>
          <div className="control-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input 
                type="checkbox" 
                className="custom-checkbox"
                checked={exportFormat} 
                onChange={(e) => setExportFormat(e.target.checked)} 
              />
              Linux export format
            </label>
          </div>
          <button className="primary-btn btn-glow" onClick={handleK8sToEnvAction}>Secret &rarr; {exportFormat ? 'Export' : '.env'}</button>
          <button className="primary-btn btn-glow-purple" onClick={handleEnvToK8sAction}>{exportFormat ? 'Export' : '.env'} &rarr; K8s Secret</button>
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
