import { useState, useMemo, useRef } from 'react';

const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
  '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
  '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.',
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

function textToMorse(s: string, letterSep = ' / ', charSep = ' '): string {
  const out: string[] = [];
  for (const c of s.toUpperCase()) {
    if (c === ' ') {
      out.push(letterSep.trim() === '/' ? '/' : ' / ');
    } else if (MORSE_MAP[c]) {
      out.push(MORSE_MAP[c]);
    }
    // 非法字符忽略
  }
  return out.join(charSep).replace(/ \/ /g, ' / ');
}

function morseToText(s: string): string {
  // 标准化分隔符：先转空格，再用 / 切词
  const normalized = s.replace(/[_·.]/g, m => m === '·' ? '.' : m === '_' ? '-' : m)
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = normalized.split(' / ');
  return words.map(w => {
    return w.split(' ').map(code => REVERSE_MAP[code] || '').join('');
  }).filter(Boolean).join(' ');
}

let audioCtx: AudioContext | null = null;

function playMorse(morse: string, wpm = 15) {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const unit = 1.2 / wpm; // 秒
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 700;
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.value = 0;

  let t = audioCtx.currentTime;
  for (const c of morse) {
    if (c === '.') {
      gain.gain.setValueAtTime(0.3, t);
      t += unit;
      gain.gain.setValueAtTime(0, t);
      t += unit;
    } else if (c === '-') {
      gain.gain.setValueAtTime(0.3, t);
      t += unit * 3;
      gain.gain.setValueAtTime(0, t);
      t += unit;
    } else if (c === ' ') {
      t += unit * 2;
    } else if (c === '/') {
      t += unit * 4;
    }
  }
  oscillator.start();
  oscillator.stop(t + 0.1);
}

export default function MorseCode() {
  const [text, setText] = useState('Hello HyperGrad');
  const [morse, setMorse] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [wpm, setWpm] = useState(15);
  const playingRef = useRef(false);

  const liveMorse = useMemo(() => textToMorse(text), [text]);

  function encode() {
    setError('');
    try {
      setMorse(textToMorse(text));
    } catch { setError('编码失败'); }
  }
  function decode() {
    setError('');
    try {
      setText(morseToText(morse));
    } catch { setError('解码失败：非合法摩斯电码'); }
  }
  function copy() {
    if (morse) { navigator.clipboard.writeText(morse); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  }
  function play() {
    if (liveMorse && !playingRef.current) {
      playingRef.current = true;
      try { playMorse(liveMorse, wpm); } catch (e) { setError('播放失败：' + (e as Error).message); }
      setTimeout(() => { playingRef.current = false; }, 1000);
    }
  }

  return (
    <div>
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">文本 ↔ 摩斯电码</div>
        <div class="tool-grid-2">
          <div>
            <div class="text-xs text-muted mb-md">文本（英文字母、数字、标点）</div>
            <textarea class="text-area" value={text} onChange={e => setText(e.target.value)} placeholder="Hello World" style={{ minHeight: '140px' }} />
            <button class="btn btn-primary btn-sm mt-md" onClick={encode}>编码 →</button>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} class="mb-md">
              <span class="text-xs text-muted">摩斯电码（. 为嘀，- 为嗒，/ 切词）</span>
              {morse && <button class="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓' : '复制'}</button>}
            </div>
            <textarea class="text-area dark" value={morse} onChange={e => setMorse(e.target.value)} placeholder=".... . .-.. .-.. ---" style={{ minHeight: '140px', fontFamily: 'var(--font-mono)', fontSize: '13px' }} />
            <button class="btn btn-secondary btn-sm mt-md" onClick={decode}>← 解码</button>
          </div>
        </div>
        {error && <div class="status-msg status-error mt-md">{error}</div>}
      </div>

      <div class="tool-card" style={{ background: 'var(--blue-bg)', borderColor: 'var(--blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span class="text-sm font-bold">实时预览</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>速度：
              <input
                type="number"
                min="5"
                max="40"
                value={wpm}
                onChange={e => setWpm(Number(e.target.value))}
                style={{ width: '50px', marginLeft: '4px', padding: '2px 4px' }}
              /> WPM
            </label>
            <button class="btn btn-primary btn-sm" onClick={play}>🔊 播放</button>
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '18px',
          letterSpacing: '2px',
          color: 'var(--blue-dark)',
          wordBreak: 'break-all',
          minHeight: '30px',
        }}>
          {liveMorse || '—'}
        </div>
      </div>

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">通用摩斯电码表（节选）</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '6px', fontSize: '12px' }}>
          {Object.entries(MORSE_MAP).slice(0, 36).map(([k, v]) => (
            <div key={k} style={{ padding: '4px 8px', background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{k}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
