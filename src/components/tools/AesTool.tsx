import { useState, useMemo } from 'react';
import CryptoJS from 'crypto-js';

type Mode = 'CBC' | 'ECB' | 'CTR' | 'OFB' | 'CFB';
type KeySize = 128 | 192 | 256;
type OutputFmt = 'Base64' | 'Hex';

export default function AesTool() {
  const [plaintext, setPlaintext] = useState('Hello HyperGrad Crypto');
  const [ciphertext, setCiphertext] = useState('');
  const [key, setKey] = useState('1234567890123456');
  const [iv, setIv] = useState('abcdef9876543210');
  const [mode, setMode] = useState<Mode>('CBC');
  const [keySize, setKeySize] = useState<KeySize>(128);
  const [outputFmt, setOutputFmt] = useState<OutputFmt>('Base64');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const requiredKeyLen = keySize / 8; // 字节

  function parseKey(s: string): CryptoJS.lib.WordArray | null {
    // 字符串按 UTF-8 字节长度判断
    const bytes = new TextEncoder().encode(s);
    if (bytes.length !== requiredKeyLen) return null;
    return CryptoJS.enc.Utf8.parse(s);
  }
  function parseIv(s: string): CryptoJS.lib.WordArray | null {
    const bytes = new TextEncoder().encode(s);
    if (bytes.length !== 16) return null;
    return CryptoJS.enc.Utf8.parse(s);
  }

  function modeToCrypto(m: Mode) {
    switch (m) {
      case 'CBC': return CryptoJS.mode.CBC;
      case 'ECB': return CryptoJS.mode.ECB;
      case 'CTR': return CryptoJS.mode.CTR;
      case 'OFB': return CryptoJS.mode.OFB;
      case 'CFB': return CryptoJS.mode.CFB;
    }
  }

  function encrypt() {
    setError('');
    const keyWA = parseKey(key);
    if (!keyWA) {
      setError(`密钥长度必须为 ${requiredKeyLen} 字节（${keySize} 位），当前为 ${new TextEncoder().encode(key).length} 字节。`);
      return;
    }
    const needsIv = mode !== 'ECB';
    let ivWA: CryptoJS.lib.WordArray | undefined;
    if (needsIv) {
      ivWA = parseIv(iv) || undefined;
      if (!ivWA) {
        setError(`IV 长度必须为 16 字节（128 位），当前为 ${new TextEncoder().encode(iv).length} 字节。`);
        return;
      }
    }
    try {
      const enc = CryptoJS.AES.encrypt(plaintext, keyWA, {
        mode: modeToCrypto(mode),
        iv: ivWA,
        padding: CryptoJS.pad.Pkcs7,
      });
      setCiphertext(outputFmt === 'Hex' ? enc.ciphertext.toString(CryptoJS.enc.Hex) : enc.toString());
    } catch (e) {
      setError('加密失败：' + (e as Error).message);
    }
  }

  function decrypt() {
    setError('');
    const keyWA = parseKey(key);
    if (!keyWA) {
      setError(`密钥长度必须为 ${requiredKeyLen} 字节（${keySize} 位）。`);
      return;
    }
    const needsIv = mode !== 'ECB';
    let ivWA: CryptoJS.lib.WordArray | undefined;
    if (needsIv) {
      ivWA = parseIv(iv) || undefined;
      if (!ivWA) {
        setError(`IV 长度必须为 16 字节（128 位）。`);
        return;
      }
    }
    try {
      let decrypted: CryptoJS.lib.WordArray;
      if (outputFmt === 'Hex') {
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Hex.parse(ciphertext.trim()),
        });
        decrypted = CryptoJS.AES.decrypt(cipherParams, keyWA, {
          mode: modeToCrypto(mode),
          iv: ivWA,
          padding: CryptoJS.pad.Pkcs7,
        });
      } else {
        decrypted = CryptoJS.AES.decrypt(ciphertext.trim(), keyWA, {
          mode: modeToCrypto(mode),
          iv: ivWA,
          padding: CryptoJS.pad.Pkcs7,
        });
      }
      const text = decrypted.toString(CryptoJS.enc.Utf8);
      if (!text) {
        setError('解密结果为空：密钥/IV/密文可能有误，或输出格式不匹配。');
        return;
      }
      setPlaintext(text);
    } catch (e) {
      setError('解密失败：' + (e as Error).message);
    }
  }

  function copyOut() {
    if (ciphertext) {
      navigator.clipboard.writeText(ciphertext);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  const keyBytes = useMemo(() => new TextEncoder().encode(key).length, [key]);

  return (
    <div>
      <div class="tool-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
          <div>
            <label class="text-xs text-muted">密钥长度</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {([128, 192, 256] as KeySize[]).map(s => (
                <button
                  key={s}
                  class={`btn btn-sm ${keySize === s ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setKeySize(s)}
                  style={{ minWidth: '64px' }}
                >AES-{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label class="text-xs text-muted">加密模式</label>
            <select
              class="input"
              value={mode}
              onChange={e => setMode(e.target.value as Mode)}
              style={{ marginTop: '4px', display: 'block', minWidth: '110px' }}
            >
              <option value="CBC">CBC（推荐）</option>
              <option value="ECB">ECB（不安全）</option>
              <option value="CTR">CTR</option>
              <option value="OFB">OFB</option>
              <option value="CFB">CFB</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">输出格式</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {(['Base64', 'Hex'] as OutputFmt[]).map(f => (
                <button
                  key={f}
                  class={`btn btn-sm ${outputFmt === f ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setOutputFmt(f)}
                >{f}</button>
              ))}
            </div>
          </div>
        </div>

        <div class="tool-grid-2" style={{ marginTop: '8px' }}>
          <div>
            <label class="text-xs text-muted">密钥（UTF-8）</label>
            <input
              class="input mt-md"
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder={`${requiredKeyLen} 字节 (字符) 密钥`}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <div class="text-xs mt-md" style={{ color: keyBytes === requiredKeyLen ? 'var(--green)' : 'var(--red)' }}>
              当前 {keyBytes} 字节 · 需要 {requiredKeyLen} 字节
            </div>
          </div>
          <div>
            <label class="text-xs text-muted">IV（{mode === 'ECB' ? 'ECB 模式不需要' : '16 字节'}）</label>
            <input
              class="input mt-md"
              type="text"
              value={iv}
              onChange={e => setIv(e.target.value)}
              placeholder="16 字节 (字符) IV"
              disabled={mode === 'ECB'}
              style={{ fontFamily: 'var(--font-mono)', opacity: mode === 'ECB' ? 0.5 : 1 }}
            />
            {mode !== 'ECB' && (
              <div class="text-xs mt-md" style={{ color: new TextEncoder().encode(iv).length === 16 ? 'var(--green)' : 'var(--red)' }}>
                当前 {new TextEncoder().encode(iv).length} 字节 · 需要 16 字节
              </div>
            )}
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">明文</div>
        <textarea
          class="text-area"
          value={plaintext}
          onChange={e => setPlaintext(e.target.value)}
          placeholder="输入要加密的明文"
          style={{ minHeight: '100px' }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button class="btn btn-primary" onClick={encrypt}>↓ 加密</button>
          <button class="btn btn-secondary" onClick={decrypt}>↑ 解密</button>
        </div>
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">密文（{outputFmt}）</span>
          {ciphertext && <button class="btn btn-ghost btn-sm" onClick={copyOut}>{copied ? '✓' : '复制'}</button>}
        </div>
        <textarea
          class="text-area dark"
          value={ciphertext}
          onChange={e => setCiphertext(e.target.value)}
          placeholder="密文将显示在这里，也可在此粘贴密文进行解密"
          style={{ minHeight: '100px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        />
        {error && <div class="status-msg status-error mt-md">{error}</div>}
      </div>
    </div>
  );
}
