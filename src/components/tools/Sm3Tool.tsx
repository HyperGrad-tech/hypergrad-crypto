import { useState, useMemo, useCallback } from 'react';
import smCrypto from 'sm-crypto';

const { sm3 } = smCrypto;

export default function Sm3Tool() {
  const [input, setInput] = useState('Hello HyperGrad 国密');
  const [copied, setCopied] = useState(false);

  const hash = useMemo(() => {
    if (!input) return '';
    try {
      return sm3(input);
    } catch {
      return '';
    }
  }, [input]);

  const copy = useCallback(() => {
    if (hash) { navigator.clipboard.writeText(hash); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  }, [hash]);

  return (
    <div>
      <div class="tool-card">
        <style>{`@keyframes hashPulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} class="mb-md">
          <span class="text-sm font-bold">输入内容</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '2px 9px', borderRadius: '10px', fontWeight: 500 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'hashPulse 1.4s ease-in-out infinite' }}></span>
            实时计算
          </span>
          <span class="tag tag-p1" style={{ marginLeft: 'auto' }}>GM/T 0004-2012</span>
        </div>
        <textarea
          class="text-area"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入要计算 SM3 哈希的文本"
          style={{ minHeight: '100px' }}
        />
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span class="text-sm font-bold">SM3 摘要</span>
            <span class="text-xs text-muted" style={{ marginLeft: '8px' }}>256 位 · 64 字符</span>
          </div>
          {hash && <button class="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓' : '复制'}</button>}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          wordBreak: 'break-all',
          color: 'var(--blue-dark)',
          background: 'var(--bg-soft)',
          padding: '14px 16px',
          borderRadius: 'var(--radius)',
          minHeight: '60px',
        }}>
          {hash || '请输入内容'}
        </div>
      </div>

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">SM3 算法说明</div>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8', fontSize: '13px', color: 'var(--text-muted)' }}>
          <li>SM3 是中国国家密码管理局发布的密码杂凑算法（GM/T 0004-2012）</li>
          <li>输出 256 位（32 字节 / 64 十六进制字符）摘要，安全强度与 SHA-256 相当</li>
          <li>用于电子签名、数字证书、消息完整性校验等场景</li>
          <li>与 SM2、SM4 同属"国密 SM 系列"，政企合规场景必备</li>
        </ul>
      </div>
    </div>
  );
}
