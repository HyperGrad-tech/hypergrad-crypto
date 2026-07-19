import { useState, useMemo } from 'react';

function base64UrlDecode(s: string): string {
  let b = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  const bin = atob(b);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

interface Parsed {
  header: any;
  payload: any;
  signature: string;
  exp?: number;
  iat?: number;
  nbf?: number;
}

export default function JwtParser() {
  const [token, setToken] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikh5cGVyR3JhZCIsImlhdCI6MTczNzQ0MDAwMCwiZXhwIjoxNzM3NTI2NDAwfQ.signature-placeholder');

  const parsed = useMemo<{ ok: boolean; data?: Parsed; error?: string }>(() => {
    const t = token.trim();
    if (!t) return { ok: false, error: '请输入 JWT Token' };
    const parts = t.split('.');
    if (parts.length !== 3) return { ok: false, error: 'JWT 必须由 3 段以 . 分隔的 Base64Url 组成' };
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      return {
        ok: true,
        data: {
          header,
          payload,
          signature: parts[2],
          exp: typeof payload.exp === 'number' ? payload.exp : undefined,
          iat: typeof payload.iat === 'number' ? payload.iat : undefined,
          nbf: typeof payload.nbf === 'number' ? payload.nbf : undefined,
        },
      };
    } catch (e) {
      return { ok: false, error: '解析失败：' + (e as Error).message };
    }
  }, [token]);

  const now = Math.floor(Date.now() / 1000);
  const exp = parsed.data?.exp;
  const timeLeft = exp !== undefined ? exp - now : undefined;

  function fmtTime(ts: number): string {
    return new Date(ts * 1000).toLocaleString('zh-CN', { hour12: false });
  }

  return (
    <div>
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">JWT Token</div>
        <textarea
          class="text-area"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="粘贴 JWT Token（Header.Payload.Signature）"
          style={{ minHeight: '100px', fontFamily: 'var(--font-mono)', fontSize: '11px', wordBreak: 'break-all' }}
        />
      </div>

      {!parsed.ok && parsed.error && (
        <div class="tool-card" style={{ borderColor: 'var(--red)', background: 'var(--red-bg)' }}>
          <div style={{ color: 'var(--red)' }}>⚠ {parsed.error}</div>
        </div>
      )}

      {parsed.ok && parsed.data && (() => {
        const d = parsed.data;
        return (
          <>
            {/* 过期状态 */}
            <div class="tool-card" style={{
              borderColor: timeLeft === undefined ? 'var(--border)' : (timeLeft > 0 ? 'var(--green)' : 'var(--red)'),
              background: timeLeft === undefined ? 'transparent' : (timeLeft > 0 ? 'var(--green-bg)' : 'var(--red-bg)'),
            }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                  <div class="text-xs text-muted">签发时间 (iat)</div>
                  <div style={{ fontWeight: 600 }}>{d.iat ? fmtTime(d.iat) : '未指定'}</div>
                </div>
                <div>
                  <div class="text-xs text-muted">生效时间 (nbf)</div>
                  <div style={{ fontWeight: 600 }}>{d.nbf ? fmtTime(d.nbf) : '未指定'}</div>
                </div>
                <div>
                  <div class="text-xs text-muted">过期时间 (exp)</div>
                  <div style={{ fontWeight: 600 }}>{d.exp ? fmtTime(d.exp) : '未指定'}</div>
                </div>
                {timeLeft !== undefined && (
                  <div style={{ marginLeft: 'auto' }}>
                    <div class="text-xs text-muted">状态</div>
                    <div style={{ fontWeight: 700, color: timeLeft > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {timeLeft > 0 ? `剩余 ${Math.floor(timeLeft / 86400)} 天 ${Math.floor((timeLeft % 86400) / 3600)} 小时` : '已过期'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div class="tool-card">
              <div class="text-sm font-bold mb-md" style={{ color: 'var(--red)' }}>Header（头部 · 红色段）</div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--blue-dark)', background: 'var(--bg-soft)', padding: '12px', borderRadius: 'var(--radius)', overflow: 'auto', margin: 0 }}>{JSON.stringify(d.header, null, 2)}</pre>
            </div>

            <div class="tool-card">
              <div class="text-sm font-bold mb-md" style={{ color: 'var(--purple)' }}>Payload（负载 · 紫色段）</div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--blue-dark)', background: 'var(--bg-soft)', padding: '12px', borderRadius: 'var(--radius)', overflow: 'auto', margin: 0 }}>{JSON.stringify(d.payload, null, 2)}</pre>
            </div>

            <div class="tool-card">
              <div class="text-sm font-bold mb-md" style={{ color: 'var(--blue)' }}>Signature（签名 · 蓝色段）</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-soft)', padding: '12px', borderRadius: 'var(--radius)', wordBreak: 'break-all' }}>{d.signature}</div>
              <div class="text-xs text-muted mt-md">
                签名验证需要服务端密钥，本工具仅做本地解析，不会向任何服务器发送 Token。
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
