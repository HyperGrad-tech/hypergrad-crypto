import { useState } from 'react';

export default function UrlEncoder() {
  const [text, setText] = useState('Hello 世界！测 试?q=加密&n=1');
  const [encoded, setEncoded] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function encode() {
    setError('');
    try {
      setEncoded(encodeURIComponent(text));
    } catch { setError('编码失败'); }
  }

  function encodeAll() {
    // encodeURI：保留分隔符 / ? : @ & = + $ #
    setError('');
    try {
      setEncoded(encodeURI(text));
    } catch { setError('编码失败'); }
  }

  function decode() {
    setError('');
    try {
      setText(decodeURIComponent(encoded.trim()));
    } catch { setError('解码失败：非合法 URL 编码'); }
  }

  function copy() {
    if (encoded) { navigator.clipboard.writeText(encoded); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  }

  return (
    <div>
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">文本 ↔ URL 编码</div>
        <div class="tool-grid-2">
          <div>
            <div class="text-xs text-muted mb-md">原文</div>
            <textarea class="text-area" value={text} onChange={e => setText(e.target.value)} placeholder="输入要编码的文本或 URL" style={{ minHeight: '140px' }} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button class="btn btn-primary btn-sm" onClick={encode}>encodeURIComponent</button>
              <button class="btn btn-secondary btn-sm" onClick={encodeAll}>encodeURI</button>
            </div>
            <div class="text-xs text-muted mt-md">
              <strong>encodeURIComponent</strong>：编码所有特殊字符（适合 Query 参数）<br />
              <strong>encodeURI</strong>：保留 URL 结构符（适合整段 URL）
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} class="mb-md">
              <span class="text-xs text-muted">URL 编码（百分号编码）</span>
              {encoded && <button class="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓' : '复制'}</button>}
            </div>
            <textarea class="text-area dark" value={encoded} onChange={e => setEncoded(e.target.value)} placeholder="%E4%BD%A0%E5%A5%BD..." style={{ minHeight: '140px', fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
            <button class="btn btn-secondary btn-sm mt-md" onClick={decode}>← 解码</button>
          </div>
        </div>
        {error && <div class="status-msg status-error mt-md">{error}</div>}
      </div>
    </div>
  );
}
