import { useState, useMemo, useCallback } from 'react';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?/`~';
const AMBIGUOUS = 'Il1O0o';

function secureRandomInt(max: number): number {
  // 拒绝采样，避免模偏
  const range = 256 - (256 % max);
  const arr = new Uint8Array(1);
  while (true) {
    crypto.getRandomValues(arr);
    if (arr[0] < range) return arr[0] % max;
  }
}

function generate(opts: {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  noRepeat: boolean;
}): string {
  let pool = '';
  if (opts.upper) pool += UPPER;
  if (opts.lower) pool += LOWER;
  if (opts.digits) pool += DIGITS;
  if (opts.symbols) pool += SYMBOLS;
  if (opts.excludeAmbiguous) {
    pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
  }
  if (!pool) return '';
  const poolArr = pool.split('');
  if (opts.noRepeat && opts.length > poolArr.length) {
    // 池子不够大无法避免重复，截断长度
    opts = { ...opts, length: poolArr.length };
  }
  const result: string[] = [];
  const used = new Set<number>();
  for (let i = 0; i < opts.length; i++) {
    let idx: number;
    do {
      idx = secureRandomInt(poolArr.length);
    } while (opts.noRepeat && used.has(idx));
    used.add(idx);
    result.push(poolArr[idx]);
  }
  return result.join('');
}

function estimateEntropy(opts: {
  upper: boolean; lower: boolean; digits: boolean; symbols: boolean; excludeAmbiguous: boolean;
}): number {
  let size = 0;
  if (opts.upper) size += 26;
  if (opts.lower) size += 26;
  if (opts.digits) size += 10;
  if (opts.symbols) size += SYMBOLS.length;
  if (opts.excludeAmbiguous) size -= AMBIGUOUS.length;
  return size > 0 ? Math.log2(size) : 0;
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [noRepeat, setNoRepeat] = useState(false);
  const [password, setPassword] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const opts = { length, upper, lower, digits, symbols, excludeAmbiguous, noRepeat };
  const entropyPerChar = useMemo(() => estimateEntropy(opts), [upper, lower, digits, symbols, excludeAmbiguous]);
  const totalEntropy = entropyPerChar * length;

  const doGenerate = useCallback(() => {
    const pwd = generate(opts);
    if (pwd) {
      setPassword(pwd);
      setHistory(h => [pwd, ...h].slice(0, 8));
    }
  }, [opts]);

  // 首次进入自动生成一次
  useMemo(() => { doGenerate(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  function copy() {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function copyHistory(p: string) {
    navigator.clipboard.writeText(p);
    setPassword(p);
  }

  const strengthLabel = totalEntropy < 40 ? '弱' : totalEntropy < 60 ? '中' : totalEntropy < 80 ? '强' : '极强';
  const strengthColor = totalEntropy < 40 ? 'var(--red)' : totalEntropy < 60 ? 'var(--amber)' : totalEntropy < 80 ? 'var(--green)' : '#4F46E5';
  const strengthPct = Math.min(100, (totalEntropy / 128) * 100);

  return (
    <div>
      <div class="tool-card" style={{ background: 'var(--blue-bg)', borderColor: 'var(--blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--blue-dark)',
            wordBreak: 'break-all',
            flex: '1',
            minWidth: '200px',
            letterSpacing: '0.5px',
          }}>{password || '点击生成'}</div>
          <button class="btn btn-primary" onClick={doGenerate}>生成</button>
          <button class="btn btn-secondary" onClick={copy}>{copied ? '✓ 已复制' : '复制'}</button>
        </div>
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>强度：{totalEntropy.toFixed(0)} 位熵</span>
            <span style={{ color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${strengthPct}%`, height: '100%', background: strengthColor, transition: 'width 0.2s' }}></div>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label class="text-sm font-bold">密码长度</label>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue)', fontSize: '16px' }}>{length}</span>
        </div>
        <input
          type="range"
          min="4"
          max="64"
          value={length}
          onChange={e => setLength(Number(e.target.value))}
          style={{ width: '100%', marginTop: '8px' }}
        />
      </div>

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">字符集</div>
        {[
          { label: '大写字母 (A-Z)', val: upper, set: setUpper },
          { label: '小写字母 (a-z)', val: lower, set: setLower },
          { label: '数字 (0-9)', val: digits, set: setDigits },
          { label: `符号 (${SYMBOLS.slice(0, 8)}…)`, val: symbols, set: setSymbols },
        ].map((opt, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={opt.val}
              onChange={e => opt.set(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--blue)' }}
            />
            <span class="text-sm">{opt.label}</span>
          </label>
        ))}
        <div style={{ borderTop: '1px solid var(--border-light)', margin: '8px 0' }}></div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={e => setExcludeAmbiguous(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--blue)' }}
          />
          <span class="text-sm">排除易混淆字符 ({AMBIGUOUS})</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={noRepeat}
            onChange={e => setNoRepeat(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--blue)' }}
          />
          <span class="text-sm">字符不重复</span>
        </label>
      </div>

      {history.length > 1 && (
        <div class="tool-card">
          <div class="text-sm font-bold mb-md">历史记录（最近 8 次）</div>
          {history.map((p, i) => (
            <div
              key={i}
              onClick={() => copyHistory(p)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                padding: '6px 10px',
                background: i === 0 ? 'transparent' : 'var(--bg-soft)',
                borderRadius: 'var(--radius-sm)',
                margin: '4px 0',
                cursor: 'pointer',
                color: i === 0 ? 'var(--text-light)' : 'var(--text)',
                wordBreak: 'break-all',
              }}
            >
              {i === 0 ? '当前：' : ''}{p}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
