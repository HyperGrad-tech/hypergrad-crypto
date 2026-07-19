import { useState, useMemo } from 'react';

const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123', '111111', '123123', 'admin',
  'letmein', 'welcome', 'monkey', 'dragon', 'master', 'login', 'princess', 'football',
  'iloveyou', 'sunshine', 'starwars', '000000', '654321', '112233', 'asdfgh', 'zxcvbn',
  'password1', '123456789', '1234567890', 'qazwsx', 'trustno1', '1234567',
]);

function analyze(pwd: string) {
  if (!pwd) return null;

  const length = pwd.length;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
  const hasSpace = /\s/.test(pwd);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 32; // 常见可见符号约 32 个
  if (hasSpace) poolSize += 1;

  // 检测重复模式（如 abcabc, 1111）
  const isSequential = /^(?:0123456789|123456|234567|345678|456789|abcdef|qwerty|asdfgh|zxcvbn)/i.test(pwd);
  const isRepeated = /^(.)\1+$/.test(pwd);
  const isCommon = COMMON_PASSWORDS.has(pwd.toLowerCase());

  // 实际熵：检测到的模式会扣分
  let entropy: number;
  if (isCommon || isRepeated) {
    entropy = Math.log2(poolSize || 1) * 2; // 极弱
  } else if (isSequential) {
    entropy = Math.log2(poolSize || 1) * Math.min(length, 4);
  } else {
    entropy = Math.log2(poolSize || 1) * length;
  }

  // 假设离线破解速度：每秒 100 亿次（高端 GPU）
  const guessesPerSec = 1e10;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSec;

  function fmtTime(s: number): string {
    if (s < 1) return '< 1 秒';
    if (s < 60) return `${Math.round(s)} 秒`;
    if (s < 3600) return `${Math.round(s / 60)} 分钟`;
    if (s < 86400) return `${Math.round(s / 3600)} 小时`;
    if (s < 31536000) return `${Math.round(s / 86400)} 天`;
    if (s < 31536000 * 1000) return `${Math.round(s / 31536000)} 年`;
    if (s < 31536000 * 1e6) return `${(s / 31536000 / 1000).toFixed(1)} 千年`;
    if (s < 31536000 * 1e9) return `${(s / 31536000 / 1e6).toFixed(1)} 百万年`;
    return `> ${(s / 31536000 / 1e9).toExponential(1)} 亿年`;
  }

  let score: number;
  let label: string;
  let color: string;
  if (entropy < 28) { score = 1; label = '极弱'; color = '#B83A3A'; }
  else if (entropy < 36) { score = 2; label = '弱'; color = '#D9772E'; }
  else if (entropy < 60) { score = 3; label = '中'; color = '#C8862E'; }
  else if (entropy < 80) { score = 4; label = '强'; color = '#2D7A4F'; }
  else { score = 5; label = '极强'; color = '#1E3A5F'; }

  const issues: string[] = [];
  if (length < 8) issues.push('长度过短（建议至少 12 位）');
  if (!hasLower) issues.push('缺少小写字母');
  if (!hasUpper) issues.push('缺少大写字母');
  if (!hasDigit) issues.push('缺少数字');
  if (!hasSymbol) issues.push('缺少符号（符号显著提升熵）');
  if (isCommon) issues.push('常见弱口令，撞库必破');
  if (isRepeated) issues.push('全部相同字符，毫无熵');
  if (isSequential) issues.push('含连续键盘/数字序列');
  if (/(19|20)\d{2}/.test(pwd)) issues.push('含年份，易被字典命中');
  if (/(.)\1{2,}/.test(pwd)) issues.push('含连续重复字符（如 aaa）');

  return {
    length, poolSize, entropy, score, label, color,
    crackTime: fmtTime(seconds),
    issues,
    suggestions: issues.length === 0 ? ['该密码强度良好，可继续使用'] : [
      '增加长度至 16 位以上',
      '混合大小写字母、数字、符号',
      '避免使用日期、姓名、常用词',
      '考虑使用密码管理器（如 DeepSeal）',
    ],
  };
}

export default function PasswordStrength() {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const r = useMemo(() => analyze(pwd), [pwd]);

  return (
    <div>
      <div class="tool-card">
        <label class="text-sm font-bold">输入密码</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            class="input"
            type={show ? 'text' : 'password'}
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="输入要检测的密码（不会上传）"
            style={{ fontFamily: 'var(--font-mono)', flex: '1' }}
          />
          <button class="btn btn-ghost btn-sm" onClick={() => setShow(s => !s)}>{show ? '隐藏' : '显示'}</button>
        </div>
        <div class="text-xs text-muted mt-md">所有分析在浏览器本地完成，密码不会发送到任何服务器。</div>
      </div>

      {r && (
        <>
          <div class="tool-card" style={{ background: 'var(--bg-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span class="text-sm font-bold">强度评估</span>
              <span style={{ color: r.color, fontWeight: 700, fontSize: '18px' }}>{r.label}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '10px',
                    borderRadius: '3px',
                    background: i <= r.score ? r.color : 'var(--border-light)',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          </div>

          <div class="tool-card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              <div>
                <div class="text-xs text-muted">密码长度</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--blue-dark)' }}>{r.length} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>位</span></div>
              </div>
              <div>
                <div class="text-xs text-muted">字符池大小</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--blue-dark)' }}>{r.poolSize}</div>
              </div>
              <div>
                <div class="text-xs text-muted">熵（信息量）</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--blue-dark)' }}>{r.entropy.toFixed(0)} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>位</span></div>
              </div>
              <div>
                <div class="text-xs text-muted">破解耗时（离线 GPU）</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: r.color, paddingTop: '6px' }}>{r.crackTime}</div>
              </div>
            </div>
          </div>

          {r.issues.length > 0 && (
            <div class="tool-card" style={{ borderColor: 'var(--red)', background: 'var(--red-bg)' }}>
              <div class="text-sm font-bold mb-md" style={{ color: 'var(--red)' }}>发现 {r.issues.length} 个问题</div>
              {r.issues.map((issue, i) => (
                <div key={i} style={{ padding: '4px 0', color: 'var(--text)' }}>⚠ {issue}</div>
              ))}
            </div>
          )}

          <div class="tool-card" style={{ borderColor: 'var(--green)', background: 'var(--green-bg)' }}>
            <div class="text-sm font-bold mb-md" style={{ color: 'var(--green)' }}>改进建议</div>
            {r.suggestions.map((s, i) => (
              <div key={i} style={{ padding: '4px 0', color: 'var(--text)' }}>✓ {s}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
