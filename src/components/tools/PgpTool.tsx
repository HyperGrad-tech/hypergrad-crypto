import { useState } from 'react';
import * as openpgp from 'openpgp';

export default function PgpTool() {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [name, setName] = useState('HyperGrad');
  const [email, setEmail] = useState('user@hypergrad.cn');
  const [rsaBits, setRsaBits] = useState(2048);
  const [generating, setGenerating] = useState(false);
  const [plaintext, setPlaintext] = useState('Hello HyperGrad Crypto PGP');
  const [ciphertext, setCiphertext] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  async function generate() {
    setError('');
    setGenerating(true);
    try {
      const userIDs: any[] = [];
      const uid: any = {};
      if (name) uid.name = name;
      if (email) uid.email = email;
      if (Object.keys(uid).length > 0) userIDs.push(uid);
      const kp = await openpgp.generateKey({
        type: 'rsa',
        rsaBits,
        userIDs,
        format: 'armored',
      });
      setPrivateKey(kp.privateKey);
      setPublicKey(kp.publicKey);
    } catch (e) {
      setError('密钥对生成失败：' + (e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function encrypt() {
    setError('');
    if (!publicKey) { setError('请先输入或生成公钥'); return; }
    if (!plaintext) { setError('请输入明文'); return; }
    try {
      const pub = await openpgp.readKey({ armoredKey: publicKey.trim() });
      const msg = await openpgp.createMessage({ text: plaintext });
      const encrypted = await openpgp.encrypt({
        message: msg,
        encryptionKeys: pub,
      });
      setCiphertext(encrypted as string);
    } catch (e) {
      setError('加密失败：' + (e as Error).message);
    }
  }

  async function decrypt() {
    setError('');
    if (!privateKey) { setError('请先输入或生成私钥'); return; }
    if (!ciphertext) { setError('请粘贴要解密的 PGP 消息'); return; }
    try {
      const priv = await openpgp.readPrivateKey({ armoredKey: privateKey.trim() });
      const msg = await openpgp.readMessage({ armoredMessage: ciphertext.trim() });
      const result = await openpgp.decrypt({
        message: msg,
        decryptionKeys: priv,
      });
      let text: string;
      if (typeof result.data === 'string') {
        text = result.data;
      } else if (result.data instanceof Uint8Array) {
        text = new TextDecoder().decode(result.data);
      } else {
        text = '';
      }
      setPlaintext(text);
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
            <div class="text-sm font-bold">OpenPGP 密钥对生成</div>
            <div class="text-xs text-muted mt-md">基于 openpgp.js，支持 RSA 1024/2048/4096 位</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {([1024, 2048, 4096] as number[]).map(b => (
              <button
                key={b}
                class={`btn btn-sm ${rsaBits === b ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setRsaBits(b)}
              >{b}</button>
            ))}
            <button class="btn btn-primary btn-sm" onClick={generate} disabled={generating}>
              {generating ? '生成中…' : '生成密钥对'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <div style={{ flex: '1' }}>
            <label class="text-xs text-muted">User ID Name</label>
            <input class="input mt-md" type="text" value={name} onChange={e => setName(e.target.value)} style={{ display: 'block', width: '100%' }} />
          </div>
          <div style={{ flex: '1' }}>
            <label class="text-xs text-muted">User ID Email</label>
            <input class="input mt-md" type="text" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%' }} />
          </div>
        </div>
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">公钥（Public Key · Armored）</span>
          {publicKey && <button class="btn btn-ghost btn-sm" onClick={() => copy('pub', publicKey)}>{copied === 'pub' ? '✓' : '复制'}</button>}
        </div>
        <textarea
          class="text-area"
          value={publicKey}
          onChange={e => setPublicKey(e.target.value)}
          placeholder={`-----BEGIN PGP PUBLIC KEY BLOCK-----\n...\n-----END PGP PUBLIC KEY BLOCK-----`}
          style={{ minHeight: '160px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
        />
      </div>

      <div class="tool-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">私钥（Private Key · Armored）</span>
          {privateKey && <button class="btn btn-ghost btn-sm" onClick={() => copy('priv', privateKey)}>{copied === 'priv' ? '✓' : '复制'}</button>}
        </div>
        <textarea
          class="text-area"
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
          placeholder={`-----BEGIN PGP PRIVATE KEY BLOCK-----\n...\n-----END PGP PRIVATE KEY BLOCK-----`}
          style={{ minHeight: '200px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
        />
        <div class="text-xs text-muted mt-md">⚠ 私钥请妥善保管，本工具不会上传密钥到任何服务器，但请在使用后清空浏览器输入。</div>
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
          <span class="text-sm font-bold">PGP 密文</span>
          {ciphertext && <button class="btn btn-ghost btn-sm" onClick={() => copy('cipher', ciphertext)}>{copied === 'cipher' ? '✓' : '复制'}</button>}
        </div>
        <textarea
          class="text-area dark"
          value={ciphertext}
          onChange={e => setCiphertext(e.target.value)}
          placeholder="-----BEGIN PGP MESSAGE-----..."
          style={{ minHeight: '120px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
        />
        {error && <div class="status-msg status-error mt-md">{error}</div>}
      </div>
    </div>
  );
}
