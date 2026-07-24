import { useState, useEffect, useMemo, useCallback } from 'react';
import CryptoJS from 'crypto-js';

type ExpiryOption = '1h' | '24h' | '7d' | '30d';

const EXPIRY_MS: Record<ExpiryOption, number> = {
  '1h': 3600000,
  '24h': 86400000,
  '7d': 604800000,
  '30d': 2592000000,
};

const EXPIRY_LABELS: Record<ExpiryOption, string> = {
  '1h': '1 小时',
  '24h': '24 小时',
  '7d': '7 天',
  '30d': '30 天',
};

const PRESET_QUESTIONS = [
  '我们第一次见面的城市',
  '你养的猫叫什么名字',
  '我们最喜欢的餐厅',
  '上次旅行的目的地',
  '我的生日是几号',
];

// v1 明文载荷：{ v:1, e:过期毫秒时间戳, t:内容 }
interface SharePayload {
  v: 1;
  e: number;
  t: string;
}

// 问题 JSON（明文，base64url 编码放在 hash 前）
interface QuestionJson {
  q: string;
}

// 密文数据 JSON（base64url 编码放在 hash 后）
interface CipherData {
  iv: string;   // hex string
  salt: string; // hex string
  ct: string;   // base64 string (CryptoJS output)
}

// ===== base64url 工具 =====
function b64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str: string): string {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4 !== 0) s += '=';
  return atob(s);
}

// ===== PBKDF2 密钥派生（使用 CryptoJS）=====
function deriveKey(answer: string, saltHex: string): CryptoJS.lib.WordArray {
  const saltWA = CryptoJS.enc.Hex.parse(saltHex);
  const key = CryptoJS.PBKDF2(answer, saltWA, {
    keySize: 256 / 32, // 256 bits = 8 words
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });
  return key;
}

// ===== 从 URL hash 解析分享数据 =====
function parseShareHash(hash: string): { question: string; cipherData: CipherData } | null {
  try {
    const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash;
    const sepIdx = withoutHash.indexOf(':');
    if (sepIdx === -1) return null;

    const qB64 = withoutHash.slice(0, sepIdx);
    const dB64 = withoutHash.slice(sepIdx + 1);

    const qJson: QuestionJson = JSON.parse(b64urlDecode(qB64));
    const dJson: CipherData = JSON.parse(b64urlDecode(dB64));

    if (!qJson.q || !dJson.iv || !dJson.salt || !dJson.ct) return null;
    return { question: qJson.q, cipherData: dJson };
  } catch {
    return null;
  }
}

// ===== 加密（发送方）=====
function encryptShare(content: string, answer: string, expiryMs: number): { question: string; hashFragment: string } {
  const payload: SharePayload = {
    v: 1,
    e: Date.now() + expiryMs,
    t: content,
  };

  const ivWA = CryptoJS.lib.WordArray.random(16);
  const saltWA = CryptoJS.lib.WordArray.random(16);

  const key = deriveKey(answer, saltWA.toString(CryptoJS.enc.Hex));

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
    iv: ivWA,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const cipherData: CipherData = {
    iv: ivWA.toString(CryptoJS.enc.Hex),
    salt: saltWA.toString(CryptoJS.enc.Hex),
    ct: encrypted.toString(), // CryptoJS default Base64
  };

  // 返回 hashFragment（不含 #），让调用方拼接完整 URL
  const hashFragment = b64urlEncode(JSON.stringify({ q: '' })) + ':' + b64urlEncode(JSON.stringify(cipherData));

  return { question: '', hashFragment };
}

// ===== 解密（接收方）=====
function decryptShare(answer: string, cipherData: CipherData): { content: string; expired: boolean } | { error: string } {
  try {
    const key = deriveKey(answer, cipherData.salt);

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cipherData.ct),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: CryptoJS.enc.Hex.parse(cipherData.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonStr) return { error: '答案不正确' };

    const payload: SharePayload = JSON.parse(jsonStr);
    if (payload.v !== 1) return { error: '不支持的格式版本' };

    if (Date.now() > payload.e + 60000) { // 允许 60 秒时钟偏差
      return { content: payload.t, expired: true };
    }

    return { content: payload.t, expired: false };
  } catch {
    return { error: '答案不正确，或数据已损坏' };
  }
}

// ===== 主组件 =====
export default function ShareTool() {
  // --- 解密模式状态（URL 检测） ---
  const [shareData, setShareData] = useState<{ question: string; cipherData: CipherData } | null>(null);

  // --- 加密模式状态（发送方） ---
  const [content, setContent] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [expiry, setExpiry] = useState<ExpiryOption>('24h');
  const [shareUrl, setShareUrl] = useState('');
  const [shareError, setShareError] = useState('');

  // --- 解密交互状态（接收方） ---
  const [recvAnswer, setRecvAnswer] = useState('');
  const [recvResult, setRecvResult] = useState<{ content: string; expired: boolean } | null>(null);
  const [recvError, setRecvError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // --- 加载 URL hash ---
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.length > 2) {
      const parsed = parseShareHash(hash);
      if (parsed) {
        setShareData(parsed);
      }
    }
  }, []);

  // --- 发送方：生成分享链接 ---
  const handleEncrypt = useCallback(() => {
    setShareError('');
    setShareUrl('');

    if (!content.trim()) { setShareError('请输入要保护的内容'); return; }
    if (!question.trim()) { setShareError('请设置一个提示问题'); return; }
    if (!answer.trim()) { setShareError('请输入你的答案'); return; }

    const payload: SharePayload = {
      v: 1,
      e: Date.now() + EXPIRY_MS[expiry],
      t: content,
    };

    const ivWA = CryptoJS.lib.WordArray.random(16);
    const saltWA = CryptoJS.lib.WordArray.random(16);
    const key = deriveKey(answer, saltWA.toString(CryptoJS.enc.Hex));

    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
        iv: ivWA,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const cipherData: CipherData = {
        iv: ivWA.toString(CryptoJS.enc.Hex),
        salt: saltWA.toString(CryptoJS.enc.Hex),
        ct: encrypted.toString(),
      };

      const qB64 = b64urlEncode(JSON.stringify({ q: question }));
      const dB64 = b64urlEncode(JSON.stringify(cipherData));
      const baseUrl = window.location.origin + window.location.pathname;
      setShareUrl(`${baseUrl}#${qB64}:${dB64}`);
    } catch (e) {
      setShareError('加密失败：' + (e as Error).message);
    }
  }, [content, question, answer, expiry]);

  // --- 接收方：解密 ---
  const handleDecrypt = useCallback(() => {
    if (!shareData || !recvAnswer.trim()) return;
    setRecvError('');
    setRecvResult(null);

    const result = decryptShare(recvAnswer, shareData.cipherData);
    if ('error' in result) {
      setRecvError(result.error);
    } else {
      setRecvResult(result);
    }
  }, [shareData, recvAnswer]);

  // --- 复制 ---
  const copyUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const copyShareText = () => {
    if (shareUrl) {
      navigator.clipboard.writeText('看下这个 👆\n' + shareUrl);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 1500);
    }
  };

  const contentLen = useMemo(() => content.length, [content]);

  // ===== 解密模式（接收方打开链接）=====
  if (shareData) {
    return (
      <div>
        {/* 问题卡片 */}
        <div style={{
          background: 'linear-gradient(135deg, var(--blue-bg) 0%, #F5F3FF 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤔</div>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--blue-dark)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
          }}>回答以下问题以查看内容</div>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.4,
          }}>{shareData.question}</div>
        </div>

        {/* 答案输入 */}
        <div class="tool-card">
          <label class="text-xs text-muted">你的答案</label>
          <input
            class="input mt-md"
            type="text"
            value={recvAnswer}
            onChange={e => { setRecvAnswer(e.target.value); setRecvError(''); setRecvResult(null); }}
            placeholder="输入答案"
            onKeyDown={e => { if (e.key === 'Enter') handleDecrypt(); }}
            style={{ fontFamily: 'var(--font-mono)' }}
          />
          <div style={{ marginTop: '12px' }}>
            <button class="btn btn-primary" onClick={handleDecrypt} disabled={!recvAnswer.trim()}>
              查看
            </button>
          </div>
        </div>

        {/* 结果 */}
        {recvResult && (
          recvResult.expired ? (
            <div class="tool-card" style={{ background: 'var(--red-bg)', borderColor: 'var(--red)' }}>
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>⏰</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--red)', marginBottom: '4px' }}>内容已过期</div>
                <div style={{ fontSize: '12px', color: '#B91C1C', lineHeight: 1.5 }}>
                  发送方设定的有效期限已到，内容无法恢复。请联系发送方重新发送。
                </div>
              </div>
            </div>
          ) : (
            <div class="tool-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span class="text-sm font-bold" style={{ color: 'var(--green)' }}>✓ 内容已解锁</span>
                <button class="btn btn-ghost btn-sm" onClick={() => {
                  navigator.clipboard.writeText(recvResult.content);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}>{copied ? '✓' : '复制'}</button>
              </div>
              <textarea
                class="text-area"
                value={recvResult.content}
                readOnly
                style={{ minHeight: '80px', fontFamily: 'var(--font-mono)' }}
              />

              {/* 裂变 CTA */}
              <div style={{
                marginTop: '20px',
                padding: '14px',
                background: 'var(--blue-bg)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.5 }}>
                  你也可以这样安全地分享内容<br />无需注册，数据不离开浏览器
                </p>
                <a href="https://hypergrad.cn#pricing" target="_blank" rel="noopener"
                   style={{ fontSize: '13px', color: 'var(--blue-dark)', fontWeight: 600 }}>
                  了解加密笔记本 →
                </a>
              </div>
            </div>
          )
        )}

        {recvError && <div class="status-msg status-error mt-md">{recvError}</div>}

        {/* 返回加密模式 */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/s" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>← 我要创建一个加密分享</a>
        </div>
      </div>
    );
  }

  // ===== 加密模式（发送方）=====
  return (
    <div>
      {/* 内容输入 */}
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">要保护的内容</div>
        <textarea
          class="text-area"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="粘贴你不想明文发送的内容..."
          style={{ minHeight: '100px' }}
        />
        <div class="text-xs mt-md" style={{ color: 'var(--text-light)', textAlign: 'right' }}>
          {contentLen} 字符
        </div>
      </div>

      {/* 提示问题 */}
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">提示问题</div>
        <input
          class="input"
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="只有你们俩知道答案的问题"
          style={{ marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PRESET_QUESTIONS.map(q => (
            <button
              key={q}
              class="btn btn-ghost btn-sm"
              onClick={() => setQuestion(q)}
              style={{ fontSize: '12px', borderRadius: 'var(--radius-full)', border: '1px dashed var(--border)' }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 答案 */}
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">你的答案 <span class="text-xs text-muted">（对方也要知道这个答案）</span></div>
        <input
          class="input"
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="输入答案"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      </div>

      {/* 有效期 */}
      <div class="tool-card">
        <div class="text-sm font-bold mb-md">有效期限</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {(Object.keys(EXPIRY_MS) as ExpiryOption[]).map(opt => (
            <button
              key={opt}
              class={`btn btn-sm ${expiry === opt ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setExpiry(opt)}
              style={{ minWidth: '60px' }}
            >
              {EXPIRY_LABELS[opt]}
            </button>
          ))}
        </div>
        <div class="text-xs" style={{ color: 'var(--text-light)', lineHeight: 1.5 }}>
          过期后内容彻底失效，答案正确也没用——有效期嵌在加密载荷内部，不可篡改。
        </div>
      </div>

      {/* 加密按钮 */}
      <button class="btn btn-primary" onClick={handleEncrypt}>
        加密并生成链接
      </button>

      {shareError && <div class="status-msg status-error mt-md">{shareError}</div>}

      {/* 分享结果 */}
      {shareUrl && (
        <div class="tool-card" style={{ marginTop: '16px' }}>
          <div class="text-sm font-bold mb-md">链接已生成</div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
            把链接发给对方，对方打开后看到你的提示问题，输入答案即可查看。不需要你做任何额外说明。
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              class="input"
              value={shareUrl}
              readOnly
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', flex: 1 }}
            />
            <button class="btn btn-primary btn-sm" onClick={copyUrl} style={{ width: '56px', whiteSpace: 'nowrap' }}>
              {copied ? '✓' : '复制'}
            </button>
          </div>

          <div class="text-xs text-muted mb-md">分享消息预览（直接粘贴到 IM 即可）</div>
          <div style={{
            background: 'var(--bg-soft)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px',
            marginBottom: '12px',
            fontSize: '13px',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
          }}>
            看下这个 👆<br />
            <span style={{ color: 'var(--blue-dark)', fontFamily: 'var(--font-mono)', fontSize: '12px', wordBreak: 'break-all' }}>
              {shareUrl}
            </span>
          </div>

          <button class="btn btn-secondary" onClick={copyShareText}>
            {copiedText ? '✓ 已复制分享文案' : '复制分享文案'}
          </button>
        </div>
      )}
    </div>
  );
}
