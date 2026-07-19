import { useState, useRef } from 'react';

function encodeBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function decodeBase64(s: string): string {
  const bin = atob(s.trim().replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [text, setText] = useState('Hello HyperGrad Crypto');
  const [b64, setB64] = useState('');
  const [error, setError] = useState('');
  const [imgSrc, setImgSrc] = useState('');
  const [imgB64, setImgB64] = useState('');
  const [copied, setCopied] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function encode() {
    setError('');
    try {
      setB64(encodeBase64(text));
    } catch { setError('编码失败'); }
  }
  function decode() {
    setError('');
    try {
      setText(decodeBase64(b64));
    } catch { setError('解码失败：非有效 Base64'); }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('图片不能超过 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImgSrc(result);
      setImgB64(result);
    };
    reader.readAsDataURL(f);
  }

  function copy(name: string, val: string) {
    if (val) { navigator.clipboard.writeText(val); setCopied(name); setTimeout(() => setCopied(''), 1500); }
  }

  return (
    <div>
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">文本 ↔ Base64（UTF-8 安全）</div>
        <div class="tool-grid-2">
          <div>
            <div class="text-xs text-muted mb-md">文本</div>
            <textarea class="text-area" value={text} onChange={e => setText(e.target.value)} placeholder="输入文本" style={{ minHeight: '140px' }} />
            <button class="btn btn-primary btn-sm mt-md" onClick={encode}>编码 →</button>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} class="mb-md">
              <span class="text-xs text-muted">Base64</span>
              {b64 && <button class="btn btn-ghost btn-sm" onClick={() => copy('b64', b64)}>{copied === 'b64' ? '✓' : '复制'}</button>}
            </div>
            <textarea class="text-area dark" value={b64} onChange={e => setB64(e.target.value)} placeholder="Base64 字符串" style={{ minHeight: '140px', fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
            <button class="btn btn-secondary btn-sm mt-md" onClick={decode}>← 解码</button>
          </div>
        </div>
        {error && <div class="status-msg status-error mt-md">{error}</div>}
      </div>

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">图片 ↔ Base64（Data URL）</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '40px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
              <div>点击选择图片，或拖入此区域</div>
              <div class="text-xs mt-md">支持 PNG / JPEG / WebP / GIF · 最大 5MB · 本地处理</div>
            </div>
            {imgSrc && (
              <div class="mt-md">
                <img src={imgSrc} alt="预览" style={{ maxWidth: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
              </div>
            )}
          </div>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} class="mb-md">
              <span class="text-xs text-muted">Base64 Data URL</span>
              {imgB64 && <button class="btn btn-ghost btn-sm" onClick={() => copy('img', imgB64)}>{copied === 'img' ? '✓' : '复制'}</button>}
            </div>
            <textarea class="text-area dark" value={imgB64} readOnly placeholder="选择图片后在此显示 Base64" style={{ minHeight: '180px', fontSize: '11px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
