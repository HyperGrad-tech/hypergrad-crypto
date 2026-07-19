import { useState, useMemo, useCallback } from 'react';
import CryptoJS from 'crypto-js';

type Algo = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'SHA3';

const algoMap: Record<Algo, (m: string, k: string) => string> = {
  MD5: (m, k) => CryptoJS.HmacMD5(m, k).toString(),
  SHA1: (m, k) => CryptoJS.HmacSHA1(m, k).toString(),
  SHA256: (m, k) => CryptoJS.HmacSHA256(m, k).toString(),
  SHA512: (m, k) => CryptoJS.HmacSHA512(m, k).toString(),
  SHA3: (m, k) => CryptoJS.HmacSHA3(m, k, { outputLength: 256 }).toString(),
};

export default function HmacGenerator() {
  const [message, setMessage] = useState('Hello HyperGrad Crypto');
  const [key, setKey] = useState('my-secret-key');
  const [algo, setAlgo] = useState<Algo>('SHA256');
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!message || !key) return '';
    try {
      return algoMap[algo](message, key);
    } catch {
      return '';
    }
  }, [message, key, algo]);

  const copy = useCallback(() => {
    if (output) { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  }, [output]);

  return (
    <div>
      <div class="tool-card">
        <style>{`@keyframes hashPulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} class="mb-md">
          <span class="text-sm font-bold">算法选择</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '2px 9px', borderRadius: '10px', fontWeight: 500 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'hashPulse 1.4s ease-in-out infinite' }}></span>
            实时计算
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['MD5', 'SHA1', 'SHA256', 'SHA512', 'SHA3'] as Algo[]).map(a => (
            <button
              key={a}
              class={`btn btn-sm ${algo === a ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setAlgo(a)}
            >HMAC-{a}</button>
          ))}
        </div>
      </div>

      <div class="tool-card">
        <label class="text-xs text-muted">消息（Message）</label>
        <textarea
          class="text-area mt-md"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="输入要计算 HMAC 的消息内容"
          style={{ minHeight: '100px' }}
        />
      </div>

      <div class="tool-card">
        <label class="text-xs text-muted">密钥（Secret Key）</label>
        <input
          class="input mt-md"
          type="text"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="输入密钥"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span class="text-sm font-bold">HMAC-{algo} 结果</span>
            {output && <span class="text-xs text-muted" style={{ marginLeft: '8px' }}>{output.length * 4} 位 · {output.length} 字符</span>}
          </div>
          {output && <button class="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓' : '复制'}</button>}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          wordBreak: 'break-all',
          color: 'var(--blue-dark)',
          background: 'var(--bg-soft)',
          padding: '12px 14px',
          borderRadius: 'var(--radius)',
          minHeight: '60px',
        }}>
          {output || '请输入消息和密钥'}
        </div>
      </div>
    </div>
  );
}
