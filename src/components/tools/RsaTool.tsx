import { useState } from 'react';

type KeyBits = 1024 | 2048 | 4096;

function bufToPem(buf: ArrayBuffer, label: string): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  const lines = b64.match(/.{1,64}/g) || [b64];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----\n`;
}

export default function RsaTool() {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [plaintext, setPlaintext] = useState('Hello HyperGrad Crypto');
  const [ciphertext, setCiphertext] = useState('');
  const [bits, setBits] = useState<KeyBits>(2048);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  async function generate() {
    setError('');
    setGenerating(true);
    try {
      const kp = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: bits,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );
      const priv = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
      const pub = await crypto.subtle.exportKey('spki', kp.publicKey);
      setPrivateKey(bufToPem(priv, 'PRIVATE KEY'));
      setPublicKey(bufToPem(pub, 'PUBLIC KEY'));
    } catch (e) {
      setError('密钥生成失败：' + (e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function encrypt() {
    setError('');
    if (!publicKey) { setError('请先输入或生成 RSA 公钥'); return; }
    if (!plaintext) { setError('请输入要加密的明文'); return; }
    try {
      const { JSEncrypt } = await import('jsencrypt');
      const enc = new JSEncrypt();
      enc.setPublicKey(publicKey);
      const result = enc.encrypt(plaintext);
      if (!result) {
        setError('加密失败：公钥格式不正确，或明文过长（RSA 单次加密明文长度受密钥长度限制）。');
        return;
      }
      setCiphertext(result);
    } catch (e) {
      setError('加密失败：' + (e as Error).message);
    }
  }

  async function decrypt() {
    setError('');
    if (!privateKey) { setError('请先输入或生成 RSA 私钥'); return; }
    if (!ciphertext) { setError('请粘贴要解密的 Base64 密文'); return; }
    try {
      const { JSEncrypt } = await import('jsencrypt');
      const enc = new JSEncrypt();
      enc.setPrivateKey(privateKey);
      const result = enc.decrypt(ciphertext.trim());
      if (!result) {
        setError('解密失败：私钥格式不正确、密文不完整或不匹配。');
        return;
      }
      setPlaintext(result);
    } catch (e) {
      setError('解密失败：' + (e as Error).message);
    }
  }

  function copy(name: string, val: string) {
    if (val) { navigator.clipboard.writeText(val); setCopied(name); setTimeout(() => setCopied(''), 1500); }
  }

  return (
    <div>
      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div class="text-sm font-bold">密钥对生成（Web Crypto）</div>
            <div class="text-xs text-muted mt-md">使用浏览器原生 Web Crypto API 生成 RSA 密钥对，安全可信。</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {([1024, 2048, 4096] as KeyBits[]).map(b => (
                <button
                  key={b}
                  class={`btn btn-sm ${bits === b ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setBits(b)}
                >{b}</button>
              ))}
            </div>
            <button class="btn btn-primary btn-sm" onClick={generate} disabled={generating}>
              {generating ? '生成中…' : '生成密钥对'}
            </button>
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">公钥（Public Key · PEM）</span>
          {publicKey && <button class="btn btn-ghost btn-sm" onClick={() => copy('pub', publicKey)}>{copied === 'pub' ? '✓' : '复制'}</button>}
        </div>
        <textarea
          class="text-area"
          value={publicKey}
          onChange={e => setPublicKey(e.target.value)}
          placeholder={`-----BEGIN PUBLIC KEY-----\n在这里粘贴公钥，或点击上方"生成密钥对"\n-----END PUBLIC KEY-----`}
          style={{ minHeight: '120px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
        />
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">私钥（Private Key · PEM）</span>
          {privateKey && <button class="btn btn-ghost btn-sm" onClick={() => copy('priv', privateKey)}>{copied === 'priv' ? '✓' : '复制'}</button>}
        </div>
        <textarea
          class="text-area"
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
          placeholder={`-----BEGIN PRIVATE KEY-----\n在这里粘贴私钥，或点击上方"生成密钥对"\n-----END PRIVATE KEY-----`}
          style={{ minHeight: '180px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
        />
      </div>

      <div class="tool-card">
        <div class="text-sm font-bold mb-md">明文</div>
        <textarea
          class="text-area"
          value={plaintext}
          onChange={e => setPlaintext(e.target.value)}
          placeholder="输入要加密的明文"
          style={{ minHeight: '80px' }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button class="btn btn-primary" onClick={encrypt}>↓ 用公钥加密</button>
          <button class="btn btn-secondary" onClick={decrypt}>↑ 用私钥解密</button>
        </div>
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">密文（Base64）</span>
          {ciphertext && <button class="btn btn-ghost btn-sm" onClick={() => copy('cipher', ciphertext)}>{copied === 'cipher' ? '✓' : '复制'}</button>}
        </div>
        <textarea
          class="text-area dark"
          value={ciphertext}
          onChange={e => setCiphertext(e.target.value)}
          placeholder="密文将显示在这里，也可在此粘贴密文进行解密"
          style={{ minHeight: '100px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        />
        {error && <div class="status-msg status-error mt-md">{error}</div>}
      </div>
    </div>
  );
}
