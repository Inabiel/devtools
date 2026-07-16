import React, { useState } from 'react';
import { Copy, Trash2, Dices } from 'lucide-react';

function generateUuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

export default function UuidGenerator({ copyToClipboard }) {
  const [uuids, setUuids] = useState(['']);
  const [count, setCount] = useState(1);

  const handleGenerate = () => {
    const n = Math.max(1, Math.min(100, parseInt(count, 10) || 1));
    const newUuids = Array.from({ length: n }, () => generateUuid());
    setUuids(newUuids);
  };

  const handleClear = () => {
    setUuids(['']);
    setCount(1);
  };

  return (
    <section className="tool-panel active">
      <div className="panel-header">
        <h2>UUID Generator</h2>
        <p className="panel-desc">Generate random UUID v4 identifiers. Generate one or many at once.</p>
      </div>
      <div className="workspace-grid">
        <div className="card">
          <div className="card-header">
            <span>Generated UUIDs</span>
            <div className="card-actions">
              <button className="action-btn secondary-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
            </div>
          </div>
          <div className="card-body">
            <div className="uuid-list">
              {uuids.map((uuid, i) => (
                <div key={i} className="uuid-row">
                  <code className="uuid-value">{uuid || 'Click Generate to create a UUID'}</code>
                  {uuid && (
                    <button className="action-btn" onClick={() => copyToClipboard(uuid)}><Copy size={14} /></button>
                  )}
                </div>
              ))}
              {uuids.length > 1 && uuids.some(u => u) && (
                <button
                  className="action-btn copy-all-btn"
                  onClick={() => copyToClipboard(uuids.filter(u => u).join('\n'))}
                >
                  <Copy size={14} /> Copy all
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="controls-bar">
          <div className="control-group">
            <label>Count:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
              style={{ width: '70px' }}
            />
          </div>
          <button className="primary-btn btn-glow" onClick={handleGenerate}><Dices size={16} /> Generate</button>
        </div>
      </div>
    </section>
  );
}
