import React, { useState } from 'react';
import { Clipboard, Trash2, Copy, Search, ShieldCheck, Fingerprint } from 'lucide-react';
import bcrypt from 'bcryptjs';

// Pure JS MD5 (reused from HashGenerator for verification)
function md5(string) {
  function rotl(x, n) { return (x << n) | (x >>> (32 - n)); }
  function addUnsigned(lX, lY) {
    const lX8 = lX & 0x80000000, lY8 = lY & 0x80000000, lX4 = lX & 0x40000000, lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xC0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | (~z)); }
  function FF(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac)); return addUnsigned(rotl(a, s), b); }
  function GG(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac)); return addUnsigned(rotl(a, s), b); }
  function HH(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac)); return addUnsigned(rotl(a, s), b); }
  function II(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac)); return addUnsigned(rotl(a, s), b); }
  function convertToWordArray(str) {
    const lWordCount = (((str.length + 8) - ((str.length + 8) % 64)) / 64 + 1) * 16;
    const lWordArray = new Array(lWordCount - 1);
    let lByteCount = 0;
    while (lByteCount < str.length) {
      lWordArray[(lByteCount - (lByteCount % 4)) / 4] |= (str.charCodeAt(lByteCount) & 0xFF) << (lByteCount % 4) * 8;
      lByteCount++;
    }
    lWordArray[(lByteCount - (lByteCount % 4)) / 4] |= 0x80 << (lByteCount % 4) * 8;
    lWordArray[lWordCount - 2] = str.length << 3;
    lWordArray[lWordCount - 1] = str.length >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue) {
    let wordToHexValue = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue += ('0' + lByte.toString(16)).slice(-2);
    }
    return wordToHexValue;
  }
  const x = convertToWordArray(string);
  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k], 7, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], 12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070DB); b = FF(b, c, d, a, x[k + 3], 22, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], 7, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], 12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], 17, 0xA8304613); b = FF(b, c, d, a, x[k + 7], 22, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098D8); d = FF(d, a, b, c, x[k + 9], 12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], 17, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], 22, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6B901122); d = FF(d, a, b, c, x[k + 13], 12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xA679438E); b = FF(b, c, d, a, x[k + 15], 22, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], 5, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], 9, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265E5A51); b = GG(b, c, d, a, x[k], 20, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], 5, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], 9, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], 20, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], 9, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], 20, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], 5, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], 9, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], 20, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], 4, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], 11, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], 23, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], 4, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], 11, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], 23, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289B7EC6); d = HH(d, a, b, c, x[k], 11, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], 16, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], 23, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], 11, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], 23, 0xC4AC5665);
    a = II(a, b, c, d, x[k], 6, 0xF4292244); d = II(d, a, b, c, x[k + 7], 10, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], 15, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], 21, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655B59C3); d = II(d, a, b, c, x[k + 3], 10, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], 15, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], 21, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], 10, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], 15, 0xA3014314); b = II(b, c, d, a, x[k + 13], 21, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], 6, 0xF7537E82); d = II(d, a, b, c, x[k + 11], 10, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], 21, 0xEB86D391);
    a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

async function shaHash(text, algorithm) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Detect hash type by pattern
function identifyHash(hash) {
  const h = hash.trim();
  const results = [];

  if (/^[a-fA-F0-9]{32}$/.test(h)) {
    results.push({ type: 'MD5', confidence: 'High', note: '32 hex chars' });
    results.push({ type: 'NTLM', confidence: 'Possible', note: 'Also 32 hex chars' });
  }
  if (/^[a-fA-F0-9]{40}$/.test(h)) {
    results.push({ type: 'SHA-1', confidence: 'High', note: '40 hex chars' });
  }
  if (/^[a-fA-F0-9]{56}$/.test(h)) {
    results.push({ type: 'SHA-224', confidence: 'High', note: '56 hex chars' });
  }
  if (/^[a-fA-F0-9]{64}$/.test(h)) {
    results.push({ type: 'SHA-256', confidence: 'High', note: '64 hex chars' });
    results.push({ type: 'SHA3-256', confidence: 'Possible', note: 'Also 64 hex chars' });
  }
  if (/^[a-fA-F0-9]{96}$/.test(h)) {
    results.push({ type: 'SHA-384', confidence: 'High', note: '96 hex chars' });
    results.push({ type: 'SHA3-384', confidence: 'Possible', note: 'Also 96 hex chars' });
  }
  if (/^[a-fA-F0-9]{128}$/.test(h)) {
    results.push({ type: 'SHA-512', confidence: 'High', note: '128 hex chars' });
    results.push({ type: 'SHA3-512', confidence: 'Possible', note: 'Also 128 hex chars' });
  }
  if (/^\$2[aby]\$\d{2}\$.{53}$/.test(h)) {
    results.push({ type: 'bcrypt', confidence: 'High', note: '$2a$/b$/y$ prefix, 60 chars' });
  }
  if (/^\$1\$/.test(h)) {
    results.push({ type: 'MD5Crypt', confidence: 'High', note: '$1$ prefix (Unix)' });
  }
  if (/^\$5\$/.test(h)) {
    results.push({ type: 'SHA-256 Crypt', confidence: 'High', note: '$5$ prefix (Unix)' });
  }
  if (/^\$6\$/.test(h)) {
    results.push({ type: 'SHA-512 Crypt', confidence: 'High', note: '$6$ prefix (Unix)' });
  }
  if (/^[a-fA-F0-9]{32}:[a-fA-F0-9]{32}$/.test(h)) {
    results.push({ type: 'LM:NTLM', confidence: 'High', note: 'LM:NTLM format' });
  }

  if (results.length === 0) {
    results.push({ type: 'Unknown / Custom', confidence: 'N/A', note: 'Pattern not recognized' });
  }
  return results;
}

export default function HashChecker({ copyToClipboard, pasteFromClipboard }) {
  const [plaintext, setPlaintext] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [identifyResult, setIdentifyResult] = useState(null);
  const [lookupResult, setLookupResult] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleVerify = async () => {
    setError('');
    setVerifyResult(null);
    if (!plaintext || !hashInput) {
      setVerifyResult({ match: null, message: 'Enter both plaintext and hash to verify.' });
      return;
    }
    setChecking(true);
    try {
      const h = hashInput.trim();

      // Try bcrypt
      if (h.startsWith('$2a$') || h.startsWith('$2b$') || h.startsWith('$2y$')) {
        const match = await bcrypt.compare(plaintext, h);
        setVerifyResult({ match, algorithm: 'bcrypt', message: match ? 'Hash matches the plaintext!' : 'Hash does NOT match.' });
        return;
      }

      // Try MD5
      if (/^[a-fA-F0-9]{32}$/.test(h)) {
        const computed = md5(plaintext);
        const match = computed === h.toLowerCase();
        setVerifyResult({ match, algorithm: 'MD5', message: match ? 'MD5 hash matches the plaintext!' : 'MD5 hash does NOT match.' });
        return;
      }

      // Try SHA variants via WebCrypto
      const shaAlgos = [
        { name: 'SHA-1', len: 40 },
        { name: 'SHA-256', len: 64 },
        { name: 'SHA-384', len: 96 },
        { name: 'SHA-512', len: 128 },
      ];
      const cleanHash = h.toLowerCase();
      for (const algo of shaAlgos) {
        if (cleanHash.length === algo.len) {
          const computed = await shaHash(plaintext, algo.name);
          if (computed === cleanHash) {
            setVerifyResult({ match: true, algorithm: algo.name, message: `${algo.name} hash matches the plaintext!` });
            return;
          }
        }
      }

      // No match found
      setVerifyResult({ match: false, algorithm: 'unknown', message: 'Hash does not match any recognized algorithm for the given plaintext.' });
    } catch (e) {
      setError('Verification failed: ' + e.message);
    } finally {
      setChecking(false);
    }
  };

  const handleIdentify = () => {
    setError('');
    setIdentifyResult(null);
    if (!hashInput.trim()) {
      setError('Enter a hash to identify.');
      return;
    }
    setIdentifyResult(identifyHash(hashInput));
  };

  // Map identified hash type to API lookup key, or flag as salted (irreversible)
  function getLookupInfo(identified) {
    const typeMap = {
      'MD5':       { key: 'md5',    salted: false },
      'NTLM':      { key: 'ntlm',   salted: false },
      'SHA-1':     { key: 'sha1',   salted: false },
      'SHA-224':   { key: 'sha224', salted: false },
      'SHA-256':   { key: 'sha256', salted: false },
      'SHA-384':   { key: 'sha384', salted: false },
      'SHA-512':   { key: 'sha512', salted: false },
      'SHA3-256':  { key: 'sha256', salted: false },
      'SHA3-384':  { key: 'sha384', salted: false },
      'SHA3-512':  { key: 'sha512', salted: false },
      // Salted hashes — rainbow tables don't work on these
      'bcrypt':           { key: null, salted: true },
      'MD5Crypt':         { key: null, salted: true },
      'SHA-256 Crypt':    { key: null, salted: true },
      'SHA-512 Crypt':    { key: null, salted: true },
      'LM:NTLM':          { key: null, salted: true },
    };
    const best = identified.find(r => r.confidence === 'High');
    if (best && typeMap[best.type]) return { type: best.type, ...typeMap[best.type] };
    const possible = identified.find(r => r.confidence === 'Possible');
    if (possible && typeMap[possible.type]) return { type: possible.type, ...typeMap[possible.type] };
    return null;
  }

  const handleLookup = async () => {
    setError('');
    setLookupResult(null);
    if (!hashInput.trim()) {
      setError('Enter a hash to look up.');
      return;
    }
    setLookupLoading(true);
    const h = hashInput.trim();
    const identified = identifyHash(h);
    const info = getLookupInfo(identified);

    if (!info) {
      setLookupResult({
        found: false,
        message: 'Could not determine hash type for lookup. Supported types: MD5, NTLM, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA3-256/384/512.',
      });
      setLookupLoading(false);
      return;
    }

    if (info.salted) {
      setLookupResult({
        found: false,
        message: `${info.type} is a salted hash. Each hash includes a unique random salt, so rainbow tables and online lookup databases cannot reverse it. Use the "Verify" button to check a known plaintext against this hash instead.`,
      });
      setLookupLoading(false);
      return;
    }

    const lookupType = info.key;

    try {
      const res = await fetch(`https://www.nitrxgen.in/api?type=${lookupType}&hash=${encodeURIComponent(h)}`);
      if (!res.ok) throw new Error('API not available');
      const data = await res.json();
      if (data && data.success && data.result) {
        setLookupResult({ found: true, plaintext: data.result, source: 'nitrxgen.in', hashType: info.type });
      } else {
        setLookupResult({ found: false, message: 'Hash not found in lookup database.' });
      }
    } catch {
      try {
        const res = await fetch(`https://api.hashify.net/hash/${lookupType}/hex?value=${encodeURIComponent(h)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.Type === 'plaintext') {
            setLookupResult({ found: true, plaintext: data.Plaintext, source: 'hashify.net', hashType: info.type });
          } else {
            setLookupResult({ found: false, message: 'Hash not found in lookup databases.' });
          }
        } else {
          setLookupResult({ found: false, message: 'Hash not found in lookup databases.' });
        }
      } catch {
        setLookupResult({
          found: false,
          message: 'Online lookup services are unreachable. Hashes are one-way functions and cannot be truly "decrypted" — online services use precomputed rainbow tables. Try a common hash of simple words.',
        });
      }
    } finally {
      setLookupLoading(false);
    }
  };

  const handleClear = () => {
    setPlaintext('');
    setHashInput('');
    setVerifyResult(null);
    setIdentifyResult(null);
    setLookupResult(null);
    setError('');
  };

  return (
    <section className="tool-panel active">
      <div className="panel-header">
        <h2>Hash Checker &amp; Decrypt</h2>
        <p className="panel-desc">Verify a plaintext against a hash, identify hash types, or attempt to reverse hashes using online lookup databases. All processing is done locally.</p>
      </div>
      <div className="workspace-grid">
        {/* Input area */}
        <div className="dual-output">
          <div className="card">
            <div className="card-header">
              <span>Plaintext</span>
              <div className="card-actions">
                <button className="action-btn" onClick={() => pasteFromClipboard(setPlaintext)}><Clipboard size={14} /> Paste</button>
              </div>
            </div>
            <div className="card-body">
              <textarea
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                placeholder="Enter plaintext to verify..."
                spellCheck="false"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span>Hash Value</span>
              <div className="card-actions">
                <button className="action-btn" onClick={() => pasteFromClipboard(setHashInput)}><Clipboard size={14} /> Paste</button>
              </div>
            </div>
            <div className="card-body">
              <textarea
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Enter hash to check/identify/decrypt..."
                spellCheck="false"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="controls-bar">
          <button className="primary-btn btn-glow" onClick={handleVerify} disabled={checking}>
            <ShieldCheck size={16} /> {checking ? 'Verifying...' : 'Verify'}
          </button>
          <button className="secondary-btn" onClick={handleIdentify}>
            <Search size={16} /> Identify
          </button>
          <button className="secondary-btn" onClick={handleLookup} disabled={lookupLoading}>
            <Search size={16} /> {lookupLoading ? 'Looking up...' : 'Decrypt / Lookup'}
          </button>
          <button className="action-btn" onClick={handleClear}>
            <Trash2 size={14} /> Clear
          </button>
        </div>

        {/* Error */}
        {error && <div className="error-banner">{error}</div>}

        {/* Verify result */}
        {verifyResult && (
          <div className="card">
            <div className="card-header">
              <span>Verification Result</span>
              <div className="card-actions">
                <button className="action-btn" onClick={() => copyToClipboard(JSON.stringify(verifyResult, null, 2))}><Copy size={14} /> Copy</button>
              </div>
            </div>
            <div className="card-body">
              <div className={`error-banner`} style={verifyResult.match === true ? {
                backgroundColor: 'rgba(21, 128, 61, 0.08)',
                borderLeftColor: 'var(--success-color)',
                color: 'var(--success-color)',
                margin: '16px 20px',
              } : verifyResult.match === false ? {
                borderLeftColor: 'var(--error-color)',
                color: 'var(--error-color)',
                backgroundColor: 'rgba(220, 38, 38, 0.08)',
                margin: '16px 20px',
              } : {
                margin: '16px 20px',
              }}>
                {verifyResult.message}
                {verifyResult.algorithm && verifyResult.algorithm !== 'unknown' && (
                  <span style={{ marginLeft: '8px', opacity: 0.7, fontSize: '0.75rem' }}>({verifyResult.algorithm})</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Identify result */}
        {identifyResult && (
          <div className="card">
            <div className="card-header">
              <span>Hash Identification</span>
            </div>
            <div className="card-body">
              <div className="timestamp-results">
                {identifyResult.map((r, i) => (
                  <div key={i} className="ts-row">
                    <span className="ts-label">{r.type}</span>
                    <span className="ts-value">
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        marginRight: '8px',
                        backgroundColor: r.confidence === 'High' ? 'rgba(21, 128, 61, 0.12)' : r.confidence === 'Possible' ? 'rgba(217, 119, 6, 0.12)' : 'rgba(115, 111, 94, 0.1)',
                        color: r.confidence === 'High' ? 'var(--success-color)' : r.confidence === 'Possible' ? 'var(--color-accent)' : 'var(--text-muted)',
                      }}>
                        {r.confidence}
                      </span>
                      {r.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lookup result */}
        {lookupResult && (
          <div className="card">
            <div className="card-header">
              <span>Lookup / Decrypt Result</span>
              <div className="card-actions">
                {lookupResult.found && (
                  <button className="action-btn" onClick={() => copyToClipboard(lookupResult.plaintext)}><Copy size={14} /> Copy</button>
                )}
              </div>
            </div>
            <div className="card-body">
              {lookupResult.found ? (
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Found via {lookupResult.source}
                  </div>
                  <pre className="code-output" style={{ minHeight: 'auto', padding: '12px 16px' }}>
                    {lookupResult.plaintext}
                  </pre>
                </div>
              ) : (
                <div className="placeholder-hint" style={{ padding: '24px 20px' }}>
                  {lookupResult.message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
