import { useState, useMemo } from 'react';

function shiftChar(c: string, n: number): string {
  const code = c.charCodeAt(0);
  // 大写 A-Z
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + n) % 26 + 26) % 26 + 65);
  }
  // 小写 a-z
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + n) % 26 + 26) % 26 + 97);
  }
  return c;
}

function caesar(text: string, n: number): string {
  return text.split('').map(c => shiftChar(c, n)).join('');
}

export default function CaesarCipher() {
  const [input, setInput] = useState('Hello HyperGrad');
  const [shift, setShift] = useState(3);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => caesar(input, shift), [input, shift]);
  const allShifts = useMemo(() => {
    if (!input) return [];
    return Array.from({ length: 26 }, (_, i) => ({
      shift: i,
      text: caesar(input, i),
    }));
  }, [input]);

  function copy() {
    if (output) { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  }

  return (
    <div>
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">凯撒密码（Caesar Cipher）</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label class="text-xs text-muted">移位量（Shift）</label>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue)', fontSize: '18px' }}>{shift}</span>
        </div>
        <input
          type="range"
          min="0"
          max="25"
          value={shift}
          onChange={e => setShift(Number(e.target.value))}
          style={{ width: '100%', marginTop: '8px' }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button class="btn btn-ghost btn-sm" onClick={() => setShift(0)}>0</button>
          <button class="btn btn-ghost btn-sm" onClick={() => setShift(13)}>ROT13</button>
          <button class="btn btn-ghost btn-sm" onClick={() => setShift(3)}>凯撒 3</button>
        </div>
      </div>

      <div class="tool-card">
        <label class="text-xs text-muted">原文 / 密文（同一框，<strong>双向</strong>加密解密）</label>
        <textarea
          class="text-area mt-md"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入要加密或解密的文本（仅英文字母会位移）"
          style={{ minHeight: '100px' }}
        />
      </div>

      <div class="tool-card" style={{ background: 'var(--blue-bg)', borderColor: 'var(--blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">位移 {shift} 后</span>
          <button class="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓' : '复制'}</button>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '15px',
          wordBreak: 'break-all',
          color: 'var(--blue-dark)',
          minHeight: '40px',
        }}>
          {output || '—'}
        </div>
      </div>

      {allShifts.length > 0 && (
        <div class="tool-card">
          <div class="text-sm font-bold mb-md">爆破所有 26 种位移（用于解密未知密文）</div>
          {allShifts.map(s => (
            <div
              key={s.shift}
              onClick={() => setShift(s.shift)}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '6px 10px',
                background: s.shift === shift ? 'var(--blue-bg)' : 'transparent',
                border: s.shift === shift ? '1px solid var(--blue)' : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              <span style={{ width: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>+{s.shift}</span>
              <span style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{s.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
