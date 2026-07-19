import { useState } from 'react';
import smCrypto from 'sm-crypto';

const { sm4 } = smCrypto;

type Sm4Mode = 'cbc' | 'ecb';

export default function Sm4Tool() {
  const [plaintext, setPlaintext] = useState('Hello HyperGrad 国密');
  const [ciphertext, setCiphertext] = useState('');
  const [key, setKey] = useState('0123456789abcdeffedcba9876543210');
  const [iv, setIv] = useState('00000000000000000000000000000000');
  const [mode, setMode] = useState<Sm4Mode>('cbc');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function validateHex(s: string, len: number, label: string): boolean {
    if (!new RegExp(`^[0-9a-fA-F]{${len}}$`).test(s.trim())) {
      setError(`${label} 必须为 ${len} 位十六进制字符（${len / 2} 字节）。`);
      return false;
    }
    return true;
  }

  function encrypt() {
    setError('');
    if (!validateHex(key, 32, '密钥')) return;
    if (mode === 'cbc' && !validateHex(iv, 32, 'IV')) return;
    try {
      const opts: any = { mode };
      if (mode === 'cbc') opts.iv = iv.trim();
      const result = sm4.encrypt(plaintext, key.trim().toLowerCase(), opts);
      setCiphertext(result);
    } catch (e) {
      setError('加密失败：' + (e as Error).message);
    }
  }

  function decrypt() {
    setError('');
    if (!validateHex(key, 32, '密钥')) return;
    if (mode === 'cbc' && !validateHex(iv, 32, 'IV')) return;
    try {
      const opts: any = { mode };
      if (mode === 'cbc') opts.iv = iv.trim();
      const result = sm4.decrypt(ciphertext.trim(), key.trim().toLowerCase(), opts);
      if (!result) {
        setError('解密结果为空：密钥/IV/密文可能有误。');
        return;
      }
      setPlaintext(result);
    } catch (e) {
      setError('解密失败：' + (e as Error).message);
    }
  }

  function copy() {
    if (ciphertext) { navigator.clipboard.writeText(ciphertext); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  }

  return (
    <div>
      <div class="tool-card">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label class="text-xs text-muted">加密模式</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {(['cbc', 'ecb'] as Sm4Mode[]).map(m => (
                <button
                  key={m}
                  class={`btn btn-sm ${mode === m ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setMode(m)}
                  style={{ minWidth: '64px' }}
                >{m.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label class="text-xs text-muted">密钥（32 位 Hex，16 字节）</label>
            <input
              class="input mt-md"
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="0123456789abcdeffedcba9876543210"
              style={{ fontFamily: 'var(--font-mono)', display: 'block', width: '100%' }}
            />
          </div>
          {mode === 'cbc' && (
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label class="text-xs text-muted">IV（32 位 Hex，16 字节）</label>
              <input
                class="input mt-md"
                type="text"
                value={iv}
                onChange={e => setIv(e.target.value)}
                placeholder="00000000000000000000000000000000"
                style={{ fontFamily: 'var(--font-mono)', display: 'block', width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">明文（UTF-8 字符串）</div>
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
          <span class="text-sm font-bold">密文（Hex）</span>
          {ciphertext && <button class="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓' : '复制'}</button>}
        </div>
        <textarea
          class="text-area dark"
          value={ciphertext}
          onChange={e => setCiphertext(e.target.value)}
          placeholder="密文将显示在这里，也可粘贴 Hex 密文进行解密"
          style={{ minHeight: '100px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        />
        {error && <div class="status-msg status-error mt-md">{error}</div>}
      </div>
    </div>
  );
}
