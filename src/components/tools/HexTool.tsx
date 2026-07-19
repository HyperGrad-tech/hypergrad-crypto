import { useState } from 'react';

function textToHex(s: string, sep = '', upper = true): string {
  const bytes = new TextEncoder().encode(s);
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += (upper ? bytes[i].toString(16).toUpperCase() : bytes[i].toString(16)).padStart(2, '0');
    if (sep && i < bytes.length - 1) out += sep;
  }
  return out;
}

function hexToText(s: string): string {
  const cleaned = s.replace(/0x/gi, '').replace(/[\s:,-]/g, '');
  if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length % 2 !== 0) {
    throw new Error('Hex 字符串非法或字节数为奇数');
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

export default function HexTool() {
  const [text, setText] = useState('Hello HyperGrad');
  const [hex, setHex] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sep, setSep] = useState('');
  const [upper, setUpper] = useState(true);

  function encode() {
    setError('');
    try {
      setHex(textToHex(text, sep, upper));
    } catch { setError('编码失败'); }
  }
  function decode() {
    setError('');
    try {
      setText(hexToText(hex));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function copy() {
    if (hex) { navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  }

  return (
    <div>
      <div class="tool-card">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label class="text-xs text-muted">字节分隔符</label>
            <select class="input mt-md" value={sep} onChange={e => setSep(e.target.value)} style={{ display: 'block', minWidth: '90px' }}>
              <option value="">无</option>
              <option value=" ">空格</option>
              <option value=":">冒号</option>
              <option value="-">短横线</option>
              <option value=", ">逗号</option>
              <option value="0x">0x</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', paddingTop: '20px' }}>
            <input type="checkbox" checked={upper} onChange={e => setUpper(e.target.checked)} style={{ accentColor: 'var(--blue)' }} />
            <span class="text-sm">大写</span>
          </label>
        </div>
      </div>

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">文本 ↔ Hex（UTF-8）</div>
        <div class="tool-grid-2">
          <div>
            <div class="text-xs text-muted mb-md">文本</div>
            <textarea class="text-area" value={text} onChange={e => setText(e.target.value)} placeholder="输入文本" style={{ minHeight: '140px' }} />
            <button class="btn btn-primary btn-sm mt-md" onClick={encode}>编码 →</button>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} class="mb-md">
              <span class="text-xs text-muted">Hex（16 进制）</span>
              {hex && <button class="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓' : '复制'}</button>}
            </div>
            <textarea class="text-area dark" value={hex} onChange={e => setHex(e.target.value)} placeholder="48 65 6c 6c 6f..." style={{ minHeight: '140px', fontFamily: 'var(--font-mono)', fontSize: '12px' }} />
            <button class="btn btn-secondary btn-sm mt-md" onClick={decode}>← 解码</button>
          </div>
        </div>
        {error && <div class="status-msg status-error mt-md">{error}</div>}
      </div>
    </div>
  );
}
