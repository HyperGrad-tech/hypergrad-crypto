import { useState, useMemo, useCallback } from 'react';
import CryptoJS from 'crypto-js';

export default function HashGenerator() {
  const [input, setInput] = useState('Hello HyperGrad Crypto');
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState('');

  const hashes = useMemo(() => {
    if (!input) return { md5: '', sha1: '', sha256: '', sha512: '', sha3: '', ripemd160: '' };
    return {
      md5: CryptoJS.MD5(input).toString(),
      sha1: CryptoJS.SHA1(input).toString(),
      sha256: CryptoJS.SHA256(input).toString(),
      sha512: CryptoJS.SHA512(input).toString(),
      sha3: CryptoJS.SHA3(input, { outputLength: 256 }).toString(),
      ripemd160: CryptoJS.RIPEMD160(input).toString(),
    };
  }, [input]);

  const hmacs = useMemo(() => {
    if (!input || !key) return { md5: '', sha1: '', sha256: '', sha512: '' };
    return {
      md5: CryptoJS.HmacMD5(input, key).toString(),
      sha1: CryptoJS.HmacSHA1(input, key).toString(),
      sha256: CryptoJS.HmacSHA256(input, key).toString(),
      sha512: CryptoJS.HmacSHA512(input, key).toString(),
    };
  }, [input, key]);

  const copy = useCallback((name: string, val: string) => {
    if (val) { navigator.clipboard.writeText(val); setCopied(name); setTimeout(() => setCopied(''), 1500); }
  }, []);

  const items = [
    { name: 'MD5', val: hashes.md5, len: 128, deprecated: true },
    { name: 'SHA-1', val: hashes.sha1, len: 160, deprecated: true },
    { name: 'SHA-256', val: hashes.sha256, len: 256, recommended: true },
    { name: 'SHA-512', val: hashes.sha512, len: 512 },
    { name: 'SHA-3 (256)', val: hashes.sha3, len: 256 },
    { name: 'RIPEMD-160', val: hashes.ripemd160, len: 160 },
  ];

  const hmacItems = key ? [
    { name: 'HMAC-MD5', val: hmacs.md5, len: 128 },
    { name: 'HMAC-SHA1', val: hmacs.sha1, len: 160 },
    { name: 'HMAC-SHA256', val: hmacs.sha256, len: 256, recommended: true },
    { name: 'HMAC-SHA512', val: hmacs.sha512, len: 512 },
  ] : [];

  return (
    <div>
      <div class="tool-card">
        <style>{`@keyframes hashPulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} class="mb-md">
          <span class="text-sm font-bold">输入内容</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '2px 9px', borderRadius: '10px', fontWeight: 500 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'hashPulse 1.4s ease-in-out infinite' }}></span>
            实时计算
          </span>
        </div>
        <textarea class="text-area" value={input} onChange={e => setInput(e.target.value)} placeholder="输入要计算哈希的文本" style={{ minHeight: '100px' }} />
        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">HMAC 密钥（可选，用于带密钥哈希）</label>
          <input class="input mt-md" type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="留空则只生成普通哈希" />
        </div>
      </div>

      <div>
        {items.map(item => (
          <div class="tool-card" key={item.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span class="text-sm font-bold">{item.name}</span>
                {item.recommended && <span class="tag tag-p2" style={{ marginLeft: '6px' }}>推荐</span>}
                {item.deprecated && <span class="tag tag-p0" style={{ marginLeft: '6px' }}>不安全</span>}
                <span class="text-xs text-muted" style={{ marginLeft: '8px' }}>{item.len} 位</span>
              </div>
              {item.val && <button class="btn btn-ghost btn-sm" onClick={() => copy(item.name, item.val)}>{copied === item.name ? '✓' : '复制'}</button>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--blue-dark)', background: 'var(--bg-soft)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
              {item.val || '—'}
            </div>
          </div>
        ))}
      </div>

      {hmacItems.length > 0 && (
        <div>
          <div class="text-sm font-bold" style={{ margin: '16px 0 8px', color: 'var(--blue-dark)' }}>HMAC 结果</div>
          {hmacItems.map(item => (
            <div class="tool-card" key={item.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span class="text-sm font-bold">{item.name}</span>
                  {item.recommended && <span class="tag tag-p2" style={{ marginLeft: '6px' }}>推荐</span>}
                  <span class="text-xs text-muted" style={{ marginLeft: '8px' }}>{item.len} 位</span>
                </div>
                {item.val && <button class="btn btn-ghost btn-sm" onClick={() => copy(item.name, item.val)}>{copied === item.name ? '✓' : '复制'}</button>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--blue-dark)', background: 'var(--bg-soft)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                {item.val || '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
