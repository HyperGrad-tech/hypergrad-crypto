export type Priority = 'P0' | 'P1' | 'P2';
export type Category =
  | '对称加密'
  | '非对称加密'
  | '哈希摘要'
  | '编码转换'
  | '国密算法'
  | '密码工具'
  | '趣味加密';

export interface Tool {
  slug: string;
  name: string;
  shortName: string;
  desc: string;
  priority: Priority;
  category: Category;
  keywords: string[];
  icon: string;
  /** 搜索热度（百度日搜索量估算） */
  volume: number;
  /** SEO 长尾说明 */
  seoNote: string;
}

/**
 * 16 个加密工具元数据，按优先级排序。
 * P0 核心（6）→ P1 常用（6）→ P2 扩展（4）
 */
export const tools: Tool[] = [
  // ============ P0 核心 ============
  {
    slug: 'aes',
    name: 'AES 加密 / 解密',
    shortName: 'AES',
    desc: 'AES-128/192/256 对称加密解密，支持 ECB/CBC/CTR/GCM 模式与 PKCS7 填充，纯本地计算。',
    priority: 'P0',
    category: '对称加密',
    keywords: ['aes加密', 'aes解密', 'aes-256', 'aes在线', '对称加密', 'aes cbc', 'aes ecb'],
    icon: 'AES',
    volume: 480,
    seoNote: 'tool.lu「AES 加密」480/日，开发者最高频加密需求',
  },
  {
    slug: 'rsa',
    name: 'RSA 加密 / 解密',
    shortName: 'RSA',
    desc: 'RSA 非对称加密、解密、密钥对生成，支持 1024/2048/4096 位密钥。',
    priority: 'P0',
    category: '非对称加密',
    keywords: ['rsa加密', 'rsa解密', 'rsa密钥生成', 'rsa 2048', '公钥加密', '私钥解密'],
    icon: 'RSA',
    volume: 320,
    seoNote: 'RSA 与 JWT/HTTPS 场景深度绑定，刚需',
  },
  {
    slug: 'hash',
    name: 'Hash 哈希生成',
    shortName: 'Hash',
    desc: '同时生成 MD5、SHA-1、SHA-256、SHA-512、SHA-3 哈希，支持 HMAC 带密钥哈希。',
    priority: 'P0',
    category: '哈希摘要',
    keywords: ['hash生成', 'md5加密', 'sha1', 'sha256', 'sha512', 'sha-3', '哈希计算'],
    icon: '#',
    volume: 728,
    seoNote: 'tool.lu「MD5 加密」728/日，最经典高频需求',
  },
  {
    slug: 'hmac',
    name: 'HMAC 生成器',
    shortName: 'HMAC',
    desc: '基于哈希的消息认证码（HMAC）生成，支持 MD5/SHA-1/SHA-256/SHA-512 算法。',
    priority: 'P0',
    category: '哈希摘要',
    keywords: ['hmac', 'hmac生成', 'hmac-sha256', '消息认证码', 'hmac在线'],
    icon: 'HMAC',
    volume: 180,
    seoNote: 'API 签名、Webhook 校验场景需求',
  },
  {
    slug: 'password-generator',
    name: '随机密码生成器',
    shortName: '密码生成',
    desc: '可定制长度、字符集的强随机密码生成器，使用 crypto 安全随机源。',
    priority: 'P0',
    category: '密码工具',
    keywords: ['密码生成', '随机密码', '强密码生成', '密码生成器', 'password generator'],
    icon: '🔑',
    volume: 540,
    seoNote: 'tool.lu「密码生成」540/日，泛用户需求',
  },
  {
    slug: 'password-strength',
    name: '密码强度检测',
    shortName: '强度检测',
    desc: '检测密码强度，估算破解时间，给出改进建议，本地分析不上传。',
    priority: 'P0',
    category: '密码工具',
    keywords: ['密码强度', '密码强度检测', '密码安全性', '密码评估', 'password strength'],
    icon: '🛡',
    volume: 260,
    seoNote: '安全意识型用户与开发者的常用需求',
  },
  // ============ P1 常用 ============
  {
    slug: 'base64',
    name: 'Base64 编解码',
    shortName: 'Base64',
    desc: 'Base64 编码解码，支持 UTF-8 文本与图片 Data URL 互转。',
    priority: 'P1',
    category: '编码转换',
    keywords: ['base64', 'base64编码', 'base64解码', '图片转base64', 'base64转图片'],
    icon: 'B64',
    volume: 300,
    seoNote: '数据传输/图片内嵌场景，长青需求',
  },
  {
    slug: 'url-encode',
    name: 'URL 编码 / 解码',
    shortName: 'URL',
    desc: 'URL 编码（百分号编码）、解码，支持 UTF-8 与 URI 组件。',
    priority: 'P1',
    category: '编码转换',
    keywords: ['url编码', 'url解码', 'url encode', 'url转义', '百分号编码'],
    icon: '%20',
    volume: 250,
    seoNote: '前端/接口调试常用',
  },
  {
    slug: 'jwt',
    name: 'JWT 解析器',
    shortName: 'JWT',
    desc: '解析 JWT Token 的 Header、Payload、签名，检查过期时间，本地解析。',
    priority: 'P1',
    category: '编码转换',
    keywords: ['jwt', 'jwt解析', 'jwt解码', 'jwt token', 'json web token'],
    icon: 'JWT',
    volume: 280,
    seoNote: 'Token 调试，后端开发者高频需求',
  },
  {
    slug: 'totp',
    name: 'TOTP 两步验证',
    shortName: 'TOTP',
    desc: '基于时间的一次性密码（TOTP）生成器，兼容 Google Authenticator。',
    priority: 'P1',
    category: '密码工具',
    keywords: ['totp', '两步验证', '动态口令', '谷歌验证器', 'otp', '2fa'],
    icon: '⏱',
    volume: 150,
    seoNote: '运维/安全管理员刚需',
  },
  {
    slug: 'sm4',
    name: 'SM4 国密加密',
    shortName: 'SM4',
    desc: 'SM4 国密对称加密解密，支持 ECB/CBC 模式，符合 GM/T 0002 标准。',
    priority: 'P1',
    category: '国密算法',
    keywords: ['sm4', 'sm4加密', '国密sm4', 'gm/t 0002', 'sm4 cbc', '国密算法'],
    icon: 'SM4',
    volume: 90,
    seoNote: '政企合规刚需，竞争少流量稳',
  },
  {
    slug: 'sm3',
    name: 'SM3 国密哈希',
    shortName: 'SM3',
    desc: 'SM3 国密密码杂凑算法，输出 256 位摘要，符合 GM/T 0004 标准。',
    priority: 'P1',
    category: '国密算法',
    keywords: ['sm3', 'sm3哈希', '国密sm3', 'gm/t 0004', '国密哈希'],
    icon: 'SM3',
    volume: 70,
    seoNote: '国密合规场景的配套哈希',
  },
  // ============ P2 扩展 ============
  {
    slug: 'pgp',
    name: 'PGP 加密 / 解密',
    shortName: 'PGP',
    desc: 'OpenPGP 公钥加密、私钥解密，支持密钥对生成与 ASCII Armored 输出。',
    priority: 'P2',
    category: '非对称加密',
    keywords: ['pgp', 'pgp加密', 'openpgp', 'gpg', '公钥加密', 'pgp密钥'],
    icon: 'PGP',
    volume: 80,
    seoNote: '安全邮件/开源协作小众刚需',
  },
  {
    slug: 'hex',
    name: 'Hex 编解码',
    shortName: 'Hex',
    desc: '十六进制与文本互转，支持空格分隔、大小写、字节序设置。',
    priority: 'P2',
    category: '编码转换',
    keywords: ['hex', '十六进制', 'hex编码', 'hex解码', 'hex转字符串', '字符串转hex'],
    icon: '0x',
    volume: 120,
    seoNote: '逆向/底层调试的高频小工具',
  },
  {
    slug: 'caesar',
    name: '凯撒密码',
    shortName: '凯撒',
    desc: '经典凯撒移位密码的加密与解密，支持自定义偏移量、爆破所有位移。',
    priority: 'P2',
    category: '趣味加密',
    keywords: ['凯撒密码', 'caesar', '凯撒移位', '凯撒加密', '凯撒解密'],
    icon: '罗马',
    volume: 200,
    seoNote: '学生/CTF/教学场景常驻需求',
  },
  {
    slug: 'morse',
    name: '摩斯密码',
    shortName: '摩斯',
    desc: '摩斯电码翻译器，文本与摩斯码互转，支持声音播放与自定义分隔符。',
    priority: 'P2',
    category: '趣味加密',
    keywords: ['摩斯密码', 'morse', '摩斯电码', '摩斯翻译', '莫尔斯码'],
    icon: '·-',
    volume: 350,
    seoNote: '学生、爱好者搜索量大，长期稳定',
  },
];

export const priorityMeta: Record<Priority, { label: string; desc: string; color: string; bg: string }> = {
  P0: { label: '核心工具', desc: '加解密最高频使用', color: '#1E3A5F', bg: '#EEF2F7' },
  P1: { label: '常用工具', desc: '日常安全常用', color: '#C8862E', bg: '#FDF5EA' },
  P2: { label: '扩展工具', desc: '特定场景补齐', color: '#2D7A4F', bg: '#EEF7F1' },
};

export const categoryMeta: Record<Category, { icon: string; color: string }> = {
  '对称加密': { icon: '🔐', color: '#1E3A5F' },
  '非对称加密': { icon: '🔑', color: '#7A4FB8' },
  '哈希摘要': { icon: '#', color: '#B83A3A' },
  '编码转换': { icon: '⇄', color: '#2D7A4F' },
  '国密算法': { icon: '🇨🇳', color: '#C8862E' },
  '密码工具': { icon: '🛡', color: '#1E3A5F' },
  '趣味加密': { icon: '⚡', color: '#7A4FB8' },
};

export function getTool(slug: string): Tool | undefined {
  return tools.find(t => t.slug === slug);
}

export function toolsByPriority(p: Priority): Tool[] {
  return tools.filter(t => t.priority === p);
}

export function toolsByCategory(c: Category): Tool[] {
  return tools.filter(t => t.category === c);
}
