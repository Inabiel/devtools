import React, { useState } from 'react';
import { Clipboard, Trash2, Copy, Key, Lock, Unlock, Download, Upload } from 'lucide-react';

const RSA_ALGORITHM = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: 'SHA-256',
};

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function pemEncode(buffer, type) {
  const b64 = arrayBufferToBase64(buffer);
  const lines = b64.match(/.{1,64}/g);
  return `-----BEGIN ${type} KEY-----\n${lines.join('\n')}\n-----END ${type} KEY-----`;
}

function pemDecode(pem) {
  const b64 = pem
    .replace(/-----[A-Z ]+-----/g, '')
    .replace(/\s+/g, '');
  return base64ToArrayBuffer(b64);
}

async function generateRSAKeyPair() {
  const keyPair = await crypto.subtle.generateKey(RSA_ALGORITHM, true, ['encrypt', 'decrypt']);
  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: pemEncode(publicKeyBuffer, 'PUBLIC'),
    privateKey: pemEncode(privateKeyBuffer, 'PRIVATE'),
    keyPair,
  };
}

export default function AsymmetricCrypto({ copyToClipboard, pasteFromClipboard }) {
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [keyPair, setKeyPair] = useState(null);
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState('encrypt'); // 'encrypt' | 'decrypt'

  const handleGenerateKeys = async () => {
    setError('');
    setGenerating(true);
    try {
      const result = await generateRSAKeyPair();
      setPublicKeyPem(result.publicKey);
      setPrivateKeyPem(result.privateKey);
      setKeyPair(result.keyPair);
    } catch (e) {
      setError('Key generation failed: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleImportPublicKey = async (pem) => {
    try {
      const buffer = pemDecode(pem);
      return await crypto.subtle.importKey('spki', buffer, RSA_ALGORITHM, true, ['encrypt']);
    } catch (e) {
      throw new Error('Invalid public key format');
    }
  };

  const handleImportPrivateKey = async (pem) => {
    try {
      const buffer = pemDecode(pem);
      return await crypto.subtle.importKey('pkcs8', buffer, RSA_ALGORITHM, true, ['decrypt']);
    } catch (e) {
      throw new Error('Invalid private key format');
    }
  };

  const handleEncrypt = async () => {
    setError('');
    setOutputText('');
    if (!plaintext || !publicKeyPem) {
      setError('Plaintext and public key are required for encryption.');
      return;
    }
    setProcessing(true);
    try {
      const pubKey = await handleImportPublicKey(publicKeyPem);
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      const encrypted = await crypto.subtle.encrypt(RSA_ALGORITHM, pubKey, data);
      setOutputText(arrayBufferToBase64(encrypted));
    } catch (e) {
      setError('Encryption failed: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    setError('');
    setOutputText('');
    if (!ciphertext || !privateKeyPem) {
      setError('Ciphertext and private key are required for decryption.');
      return;
    }
    setProcessing(true);
    try {
      const privKey = await handleImportPrivateKey(privateKeyPem);
      const buffer = base64ToArrayBuffer(ciphertext);
      const decrypted = await crypto.subtle.decrypt(RSA_ALGORITHM, privKey, buffer);
      const decoder = new TextDecoder();
      setOutputText(decoder.decode(decrypted));
    } catch (e) {
      setError('Decryption failed: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcess = () => {
    if (mode === 'encrypt') {
      handleEncrypt();
    } else {
      handleDecrypt();
    }
  };

  const handleClear = () => {
    setPlaintext('');
    setCiphertext('');
    setOutputText('');
    setError('');
  };

  const handleDownloadPublicKey = () => {
    if (!publicKeyPem) return;
    const blob = new Blob([publicKeyPem], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'public_key.pem';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPrivateKey = () => {
    if (!privateKeyPem) return;
    const blob = new Blob([privateKeyPem], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'private_key.pem';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (setter) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => setter(ev.target.result);
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <section className="tool-panel active">
      <div className="panel-header">
        <h2>Asymmetric Encrypt / Decrypt (RSA)</h2>
        <p className="panel-desc">Generate RSA key pairs, encrypt with public key, decrypt with private key. Uses RSA-OAEP with SHA-256. All cryptography is done locally in your browser via Web Crypto API.</p>
      </div>
      <div className="workspace-grid">
        {/* Key Generation */}
        <div className="card">
          <div className="card-header">
            <span>RSA Key Pair</span>
            <div className="card-actions">
              <button className="action-btn" onClick={handleGenerateKeys} disabled={generating}>
                <Key size={14} /> {generating ? 'Generating...' : 'Generate Key Pair'}
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="dual-output" style={{ padding: '20px', gap: '16px' }}>
              {/* Public Key */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Public Key</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="action-btn" onClick={() => pasteFromClipboard(setPublicKeyPem)}><Clipboard size={12} /> Paste</button>
                    <button className="action-btn" onClick={() => handleFileUpload(setPublicKeyPem)}><Upload size={12} /> Load</button>
                    <button className="action-btn" onClick={handleDownloadPublicKey}><Download size={12} /> Save</button>
                    <button className="action-btn" onClick={() => copyToClipboard(publicKeyPem)}><Copy size={12} /> Copy</button>
                  </div>
                </div>
                <textarea
                  value={publicKeyPem}
                  onChange={(e) => setPublicKeyPem(e.target.value)}
                  placeholder="Generate a key pair or paste a public PEM key here..."
                  spellCheck="false"
                  style={{ minHeight: '150px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              {/* Private Key */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-accent)' }}>Private Key</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="action-btn" onClick={() => pasteFromClipboard(setPrivateKeyPem)}><Clipboard size={12} /> Paste</button>
                    <button className="action-btn" onClick={() => handleFileUpload(setPrivateKeyPem)}><Upload size={12} /> Load</button>
                    <button className="action-btn" onClick={handleDownloadPrivateKey}><Download size={12} /> Save</button>
                    <button className="action-btn" onClick={() => copyToClipboard(privateKeyPem)}><Copy size={12} /> Copy</button>
                  </div>
                </div>
                <textarea
                  value={privateKeyPem}
                  onChange={(e) => setPrivateKeyPem(e.target.value)}
                  placeholder="Generate a key pair or paste a private PEM key here..."
                  spellCheck="false"
                  style={{ minHeight: '150px', fontSize: '0.72rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Encrypt / Decrypt */}
        <div className="controls-bar">
          <div className="control-group">
            <label>Mode:</label>
            <select value={mode} onChange={(e) => { setMode(e.target.value); setOutputText(''); setError(''); }}>
              <option value="encrypt">Encrypt</option>
              <option value="decrypt">Decrypt</option>
            </select>
          </div>
          <button className="primary-btn btn-glow-purple" onClick={handleProcess} disabled={processing}>
            {mode === 'encrypt' ? <Lock size={16} /> : <Unlock size={16} />}
            {processing ? 'Processing...' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
          </button>
          <button className="action-btn" onClick={handleClear}><Trash2 size={14} /> Clear</button>
        </div>

        {/* Input / Output */}
        <div className="dual-output">
          <div className="card">
            <div className="card-header">
              <span>{mode === 'encrypt' ? 'Plaintext Input' : 'Ciphertext Input (Base64)'}</span>
              <div className="card-actions">
                <button className="action-btn" onClick={() => pasteFromClipboard(mode === 'encrypt' ? setPlaintext : setCiphertext)}><Clipboard size={14} /> Paste</button>
              </div>
            </div>
            <div className="card-body">
              <textarea
                value={mode === 'encrypt' ? plaintext : ciphertext}
                onChange={(e) => mode === 'encrypt' ? setPlaintext(e.target.value) : setCiphertext(e.target.value)}
                placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter Base64 ciphertext to decrypt...'}
                spellCheck="false"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span>{mode === 'encrypt' ? 'Encrypted Output (Base64)' : 'Decrypted Output'}</span>
              <div className="card-actions">
                <button className="action-btn" onClick={() => copyToClipboard(outputText)}><Copy size={14} /> Copy</button>
              </div>
            </div>
            <div className="card-body">
              {error ? (
                <div className="error-banner" style={{ margin: '16px 20px' }}>{error}</div>
              ) : (
                <pre className="code-output"><code>{outputText}</code></pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
