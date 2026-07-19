import { useState, useEffect, useRef } from 'react';

// RFC 4648 Base32 解码（兼容 Google Authenticator secret 格式）
function base32Decode(s: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = s.toUpperCase().replace(/[\s=]/g, '').replace(/-/g, '');
  let bits = '';
  for (const c of cleaned) {
    const idx = chars.indexOf(c);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return new Uint8Array(bytes);
}

async function generateTOTP(secretBase32: string, period = 30, digits = 6, algo: 'SHA-1' | 'SHA-256' | 'SHA-512' = 'SHA-1'): Promise<string> {
  const keyBytes = base32Decode(secretBase32);
  if (keyBytes.length === 0) throw new Error('密钥无效');
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: algo }, false, ['sign']);
  const counter = Math.floor(Date.now() / 1000 / period);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 0x100000000));
  view.setUint32(4, counter >>> 0);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const offset = sig[sig.length - 1] & 0xf;
  const binCode = ((sig[offset] & 0x7f) << 24) | (sig[offset + 1] << 16) | (sig[offset + 2] << 8) | sig[offset + 3];
  const code = binCode % Math.pow(10, digits);
  return code.toString().padStart(digits, '0');
}

export default function TotpGenerator() {
  const [secret, setSecret] = useState('JBSWY3DPEHPK3PXP');
  const [period, setPeriod] = useState(30);
  const [digits, setDigits] = useState(6);
  const [algo, setAlgo] = useState<'SHA-1' | 'SHA-256' | 'SHA-512'>('SHA-1');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [remaining, setRemaining] = useState(period);
  const [copied, setCopied] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function update() {
      try {
        const c = await generateTOTP(secret, period, digits, algo);
        if (!cancelled) {
          setCode(c);
          setError('');
          const sec = Math.floor(Date.now() / 1000);
          setRemaining(period - (sec % period));
        }
      } catch (e) {
        if (!cancelled) {
          setError('生成失败：' + (e as Error).message);
          setCode('');
        }
      }
    }

    update();
    tickRef.current = window.setInterval(update, 1000);
    return () => {
      cancelled = true;
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [secret, period, digits, algo]);

  function copy() {
    if (code) { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  }

  const progressPct = (remaining / period) * 100;

  return (
    <div>
      <div class="tool-card" style={{ background: 'var(--blue-bg)', borderColor: 'var(--blue)' }}>
        <style>{`@keyframes totpPulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        <div class="text-xs text-muted" style={{ marginBottom: '8px' }}>当前动态口令</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '36px',
          fontWeight: 700,
          color: 'var(--blue-dark)',
          letterSpacing: '4px',
          minHeight: '48px',
          animation: remaining <= 5 ? 'totpPulse 1s ease-in-out infinite' : 'none',
        }}>
          {code || '------'}
        </div>
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{remaining} 秒后刷新</span>
            <button class="btn btn-ghost btn-sm" onClick={copy} style={{ padding: '2px 10px' }}>{copied ? '✓' : '复制'}</button>
          </div>
          <div style={{ height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: remaining <= 5 ? 'var(--red)' : 'var(--green)',
              transition: 'width 1s linear, background 0.3s',
            }}></div>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <label class="text-xs text-muted">Base32 密钥（从 Google Authenticator 二维码中获取）</label>
        <input
          class="input mt-md"
          type="text"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          placeholder="如 JBSWY3DPEHPK3PXP"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}
        />
        <div class="text-xs text-muted mt-md">
          兼容 otpauth:// URI 的 secret 参数。Google/Microsoft Authenticator 默认 Base32 编码。
        </div>
      </div>

      <div class="tool-card">
        <div class="tool-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          <div>
            <label class="text-xs text-muted">时间步长（秒）</label>
            <select class="input mt-md" value={period} onChange={e => setPeriod(Number(e.target.value))} style={{ display: 'block', width: '100%' }}>
              <option value={30}>30 秒（默认）</option>
              <option value={60}>60 秒</option>
              <option value={15}>15 秒</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">位数</label>
            <select class="input mt-md" value={digits} onChange={e => setDigits(Number(e.target.value))} style={{ display: 'block', width: '100%' }}>
              <option value={6}>6 位（默认）</option>
              <option value={8}>8 位</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">哈希算法</label>
            <select class="input mt-md" value={algo} onChange={e => setAlgo(e.target.value as any)} style={{ display: 'block', width: '100%' }}>
              <option value="SHA-1">SHA-1（默认）</option>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div class="status-msg status-error">{error}</div>}

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">使用说明</div>
        <div class="text-xs text-muted" style={{ lineHeight: '1.8' }}>
          · TOTP（基于时间的一次性密码）是大多数两步验证（2FA）应用的底层算法<br />
          · 将密钥填入上方，每 30 秒自动刷新 6 位口令，与 Google Authenticator 同步<br />
          · 密钥不会上传，所有计算在浏览器本地完成
        </div>
      </div>
    </div>
  );
}
