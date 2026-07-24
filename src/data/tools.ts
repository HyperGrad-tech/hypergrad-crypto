export type Priority = 'P0' | 'P1' | 'P2';
export type Category =
  | '对称加密'
  | '非对称加密'
  | '哈希摘要'
  | '编码转换'
  | '国密算法'
  | '密码工具'
  | '趣味加密'
  | '分享加密';

export interface FaqItem {
  q: string;
  a: string;
}

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
  /** 优化后的 <title>，主关键词前置 + 长尾修饰词 */
  seoTitle: string;
  /** 优化后的 meta description，140-160 字符 */
  seoDescription: string;
  /** FAQ 问答，用于 FAQPage Schema + 页面自动渲染 */
  faq: FaqItem[];
  /** 相关工具 slug 列表，用于内链卡片 */
  related: string[];
}

/**
 * 16 个加密工具元数据，按优先级排序。
 * P0 核心（6）→ P1 常用（6）→ P2 扩展（4）
 */
export const tools: Tool[] = [
  // ============ P0 核心 ============
  {
    slug: 'share',
    name: '加密分享',
    shortName: '分享',
    desc: '设置提示问题和答案，生成加密链接安全传递敏感信息，支持自动过期，零额外沟通。',
    priority: 'P0',
    category: '分享加密',
    keywords: ['加密分享', '加密链接', '安全分享', '加密传话', '私密分享', 'aes分享'],
    icon: '🔗',
    volume: 620,
    seoNote: 'IM场景高频刚需：微信/钉钉传WiFi口令、API Key等',
    seoTitle: '加密分享 - 在线生成加密链接安全传递敏感信息 | HyperGrad',
    seoDescription: '免费在线加密分享工具，设置提示问题和答案生成加密链接，支持自动过期、AES-256加密。适合在微信、钉钉中安全传递WiFi口令、API Key等敏感信息。纯浏览器本地运算。',
    faq: [
      { q: '加密分享是什么？', a: '加密分享是一种安全传递敏感信息的方式。你设置一个只有对方知道答案的提示问题，输入要保护的内容，工具会生成一个加密链接。对方打开链接看到问题，输入答案即可解密——全程不需要打电话、发短信或其他额外沟通。' },
      { q: '加密分享安全吗？', a: '所有运算在浏览器本地完成，使用 AES-256-CBC 加密 + PBKDF2 100,000 次迭代密钥派生。过期时间戳嵌在加密载荷内部，篡改任何比特都会导致解密失败。链接过期后即使知道答案也无法解密。' },
      { q: '提示问题会被别人看到吗？', a: '提示问题以明文形式放在链接中，任何人打开链接都能看到。但问题本身不泄露内容信息（比如"我们第一次见面的城市"不会暴露你要分享什么）。真正的保护在于答案——不知道答案就无法解密内容。' },
      { q: '加密分享和直接发口令有什么区别？', a: '传统方式需要加密后还要打电话/发短信告诉对方口令，多一步额外沟通。加密分享用"提示问题"代替口令传递——答案是你们共有的记忆（如"我们第一次见面的城市→成都"），对方打开链接直接看到问题，输入答案就行，零额外沟通。' },
      { q: '链接过期后还能解密吗？', a: '不能。过期时间戳在 AES 加密载荷内部，过期后即使知道正确答案也无法解密。这是因为过期时间戳在加密前就已嵌入明文，篡改密文的任何比特都会导致 AES 解密失败。' },
    ],
    related: ['aes', 'sm4', 'password-generator', 'password-strength'],
  },
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
    seoTitle: 'AES 加密解密 - 在线 AES-256/128 CBC ECB 工具 | HyperGrad',
    seoDescription: '免费在线 AES 加密解密工具，支持 AES-128/192/256、CBC/ECB/CTR/OFB/CFB 模式、PKCS7 填充，Base64/Hex 输出。纯浏览器本地运算，密钥不上传。',
    faq: [
      { q: 'AES 加密是什么？', a: 'AES（Advanced Encryption Standard，高级加密标准）是美国 NIST 于 2001 年发布的对称加密标准（FIPS 197），取代 DES 成为全球最广泛使用的加密算法。它支持 128/192/256 位密钥，加密和解密使用同一把密钥。' },
      { q: 'AES-128 和 AES-256 哪个更安全？', a: 'AES-256 安全性更高，使用 32 字节密钥、14 轮迭代，理论抗暴力破解能力比 AES-128 强 2^128 倍。但 AES-128 在可预见未来同样安全，且性能更好。长期数据保护推荐 AES-256。' },
      { q: 'CBC 和 ECB 模式有什么区别？', a: 'CBC（分组链接）模式每个块加密前先与前一个密文块异或，需要 IV，相同明文产生不同密文，推荐使用。ECB（电子密码本）模式相同明文块产生相同密文块，会泄露数据模式信息，不安全，仅用于单块加密。' },
      { q: '这个 AES 工具安全吗？会保存我的数据吗？', a: '完全安全。所有加密解密运算在你的浏览器本地完成，密钥和明文不会上传到任何服务器，刷新页面即清除。本工具不存储任何用户数据。' },
      { q: 'AES 密钥长度必须正好等于 128/192/256 位吗？', a: '是的。AES 是分组密码，密钥长度由算法规定，不可任意。本工具要求 UTF-8 字节长度精确等于 16/24/32 字节。如果需要用任意长度密码，建议先用 PBKDF2/Bcrypt 派生为标准长度密钥。' },
    ],
    related: ['rsa', 'hash', 'sm4', 'base64'],
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
    seoTitle: 'RSA 加密解密 - 在线 RSA 2048 密钥生成工具 | HyperGrad',
    seoDescription: '免费在线 RSA 非对称加密解密工具，支持 1024/2048/4096 位密钥对生成、公钥加密私钥解密。纯浏览器本地运算，私钥不上传。',
    faq: [
      { q: 'RSA 加密原理是什么？', a: 'RSA 是基于大整数分解难题的非对称加密算法，由 Rivest、Shamir、Adleman 于 1977 年提出。使用一对密钥：公钥加密、私钥解密。安全性依赖于分解两个大素数的乘积在计算上不可行。' },
      { q: 'RSA 密钥长度选多少合适？', a: '2048 位是当前推荐的最小长度，NIST 规定 2030 年前 2048 位安全。1024 位已被认为不安全。对长期数据保护（2030 年后）建议使用 4096 位。' },
      { q: 'RSA 和 AES 有什么区别？什么时候用哪个？', a: 'RSA 是非对称加密，速度慢但解决了密钥分发问题，适合加密小数据（如会话密钥）。AES 是对称加密，速度快，适合加密大量数据。实际应用中通常混合使用：RSA 加密 AES 密钥，AES 加密数据。' },
      { q: '为什么 RSA 加密有长度限制？', a: 'RSA 单次加密的数据长度不能超过密钥长度减去填充长度。2048 位密钥用 PKCS#1 v1.5 填充最多加密 245 字节。加密更长数据需要分块或混合使用对称加密。' },
    ],
    related: ['aes', 'jwt', 'pgp', 'hash'],
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
    seoTitle: '哈希加密在线 - MD5/SHA-256/SHA-512 哈希生成器 | HyperGrad',
    seoDescription: '免费在线哈希生成器，同时计算 MD5、SHA-1、SHA-256、SHA-512、SHA-3、RIPEMD-160 六种哈希，支持 HMAC 带密钥哈希。纯浏览器本地运算。',
    faq: [
      { q: '哈希和加密有什么区别？', a: '哈希是单向不可逆函数，无法从哈希值还原原文，用于完整性校验、密码存储、数字签名。加密是双向的，可用密钥解密还原原文，用于保护数据机密性。' },
      { q: 'MD5 还能用吗？', a: 'MD5 存在已知碰撞攻击，不应用于任何安全场景（如密码存储、数字签名）。仅适合非安全场景的校验和、文件去重。密码存储请用 bcrypt/scrypt/Argon2，完整性校验请用 SHA-256。' },
      { q: 'SHA-256 和 SHA-512 选哪个？', a: '两者都安全。SHA-256 更通用，广泛用于区块链、TLS 证书。SHA-512 在 64 位系统上更快（因使用 64 位字），适合大规模数据。日常使用 SHA-256 足够。' },
      { q: 'HMAC 是什么？和普通哈希的区别？', a: 'HMAC（Hash-based Message Authentication Code）是带密钥的哈希，用于验证消息完整性和真实性。普通哈希任何人都能计算，HMAC 只有知道密钥的人才能生成有效值。微信支付、阿里云 API、GitHub Webhook 等签名都使用 HMAC-SHA256。' },
      { q: '可以用哈希存密码吗？', a: '普通哈希存密码不安全，攻击者可用彩虹表秒破。密码存储必须用专门算法如 bcrypt、scrypt、Argon2，内置 salt 和慢速计算抵抗暴力破解。' },
    ],
    related: ['hmac', 'aes', 'sm3', 'base64'],
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
    seoTitle: 'HMAC 在线生成器 - HMAC-SHA256/MD5 消息认证码 | HyperGrad',
    seoDescription: '免费在线 HMAC 生成器，支持 HMAC-MD5/SHA-1/SHA-256/SHA-512 算法。用于 API 签名、Webhook 校验。纯浏览器本地运算，密钥不上传。',
    faq: [
      { q: 'HMAC 是什么？', a: 'HMAC（Hash-based Message Authentication Code）是基于哈希的消息认证码，用密钥对消息计算哈希，同时验证数据完整性和真实性。只有持有密钥的双方才能生成和验证有效的 HMAC。' },
      { q: 'HMAC-SHA256 怎么用于 API 签名？', a: '典型流程：将请求参数按字典序排列拼接，用密钥对拼接串计算 HMAC-SHA256，将结果作为签名参数随请求发送。服务端用相同密钥重新计算并比对，一致则通过。阿里云、腾讯云、AWS 等均采用此模式。' },
      { q: 'HMAC 和普通哈希有什么区别？', a: '普通哈希无密钥，任何人都能计算，只能验证完整性。HMAC 需要密钥，能同时验证完整性和真实性——既能确认数据没被篡改，也能确认发送方身份。' },
      { q: 'HMAC 密钥应该多长？', a: 'HMAC 密钥长度建议等于哈希输出长度（如 HMAC-SHA256 用 32 字节）。密钥应使用密码学安全的随机数生成，不可用短密码或可预测值。' },
    ],
    related: ['hash', 'jwt', 'aes', 'totp'],
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
    seoTitle: '随机密码生成器 - 在线强密码生成 12-64 位 | HyperGrad',
    seoDescription: '免费在线随机密码生成器，可定制长度（4-64 位）、大小写字母/数字/符号组合，使用 crypto 安全随机源。纯浏览器本地生成，密码不上传。',
    faq: [
      { q: '强密码的标准是什么？', a: '强密码应当：长度至少 12 位（推荐 16 位以上），包含大小写字母、数字、符号四类字符，不包含字典词、个人信息、键盘序列。本工具使用 crypto.getRandomValues 密码学安全随机源生成。' },
      { q: '密码多长才安全？', a: '以当前算力，12 位混合字符密码抗暴力破解约 10^4 年，16 位约 10^9 年。考虑未来量子计算，建议重要账户使用 16 位以上。日常账户 12 位足够。' },
      { q: '这个密码生成器安全吗？', a: '完全安全。使用浏览器内置 crypto.getRandomValues 密码学安全随机数生成器，不使用 Math.random（不安全）。密码在你的浏览器本地生成，不通过网络传输，不存储。' },
      { q: '应该每个网站用不同密码吗？', a: '必须如此。一旦某网站泄露导致密码外泄，攻击者会用相同密码尝试登录其他网站（撞库攻击）。建议使用密码管理器（如 DeepSeal）为每个网站生成并保存独立强密码。' },
    ],
    related: ['password-strength', 'totp', 'hash', 'hmac'],
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
    seoTitle: '密码强度检测 - 在线密码安全性评估工具 | HyperGrad',
    seoDescription: '免费在线密码强度检测工具，分析熵值、估算破解时间、识别弱密码模式。纯浏览器本地分析，密码不上传。',
    faq: [
      { q: '密码强度怎么计算？', a: '本工具基于信息熵估算密码强度：根据字符集大小和密码长度计算熵值（bits），再结合当前算力（约 10^10 次/秒）估算暴力破解时间。同时检测常见弱密码模式（字典词、重复、序列、日期等）。' },
      { q: '多少位的密码才安全？', a: '熵值 60 位以下为弱，60-80 位中等，80 位以上强。对应混合字符（94 种）：8 位约 52.7 位熵（弱），12 位约 79 位（中等），16 位约 105 位（强）。推荐使用 16 位以上混合字符密码。' },
      { q: '检测密码会上传吗？', a: '不会。所有分析在你的浏览器本地完成，密码不通过网络传输，不存储，检测完关闭页面即清除。' },
      { q: '为什么我的密码显示弱？', a: '常见原因：使用字典词（如 password、admin）、包含个人信息、使用键盘序列（qwerty）、重复字符（aaaa）、日期格式。即使长，如果是可预测模式，实际熵远低于理论值。建议用密码生成器生成随机密码。' },
    ],
    related: ['password-generator', 'totp', 'hash', 'hmac'],
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
    seoTitle: 'Base64 编解码在线工具 - 图片/文本转 Base64 | HyperGrad',
    seoDescription: '免费在线 Base64 编码解码工具，支持 UTF-8 文本、图片 Data URL 互转。纯浏览器本地处理，数据不上传。',
    faq: [
      { q: 'Base64 是加密吗？', a: 'Base64 不是加密，是编码方式。它将二进制数据用 64 个可打印字符表示，任何人都能解码，无保密性。Base64 用于在文本环境（如 JSON、URL、邮件）传输二进制数据，不要用它保护敏感信息。' },
      { q: 'Base64 会让数据变大吗？', a: '会。Base64 编码后数据约为原始大小的 4/3（约 133%），每 3 字节编码为 4 字符。这是为了用可打印字符表示二进制数据的必然代价。' },
      { q: 'Base64 Data URL 是什么？', a: 'Data URL 是将小图片等资源直接以 Base64 编码嵌入 HTML/CSS 的方案，格式为 data:image/png;base64,xxxx。优点：减少 HTTP 请求；缺点：不走缓存，大图会增大 HTML 体积。适合小图标、装饰图。' },
      { q: 'Base64 和 Hex 编码的区别？', a: 'Base64 用 64 个字符，编码效率高（133% 体积）。Hex 用 16 个字符（0-9a-f），编码效率低（200% 体积）但可读性好，常用于显示哈希值、密钥指纹。' },
    ],
    related: ['url-encode', 'hex', 'jwt', 'hash'],
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
    seoTitle: 'URL 编码解码在线工具 - 百分号编码/URI 组件 | HyperGrad',
    seoDescription: '免费在线 URL 编码解码工具，支持 encodeURIComponent、encodeURI、百分号编码。处理中文、特殊字符。纯浏览器本地运算。',
    faq: [
      { q: '什么是 URL 编码？', a: 'URL 编码（百分号编码）将 URL 中不允许的字符转换为 % 后跟两位十六进制的形式。例如空格编码为 %20，中文"中"编码为 %E4%B8%AD。URL 只允许 ASCII 字母数字和少数符号，其他字符必须编码。' },
      { q: 'encodeURIComponent 和 encodeURI 的区别？', a: 'encodeURIComponent 编码所有非 URL 安全字符，包括 :/?&= 等保留字符，适合编码 URL 参数值。encodeURI 保留 URL 结构字符（:/?&= 等），适合编码完整 URL。一般编码参数用 encodeURIComponent。' },
      { q: '中文 URL 需要编码吗？', a: '需要。URL 标准只允许 ASCII 字符，中文必须编码。现代浏览器地址栏会显示中文（自动解码），但复制出来或作为链接传递时是编码形式。在 HTML 的 href 中建议使用编码后的 URL 以避免兼容性问题。' },
      { q: 'URL 编码后还能再编码吗？', a: '可以，会形成双重编码。例如 %20 再编码为 %2520。这通常是由于程序重复编码导致的 bug，需要注意只编码一次。' },
    ],
    related: ['base64', 'hex', 'jwt', 'hash'],
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
    seoTitle: 'JWT 解析器在线 - JSON Web Token 解码工具 | HyperGrad',
    seoDescription: '免费在线 JWT 解析器，解码 Token 的 Header、Payload、Signature，检查 exp/iat/nbf 过期时间。纯浏览器本地解析。',
    faq: [
      { q: 'JWT 是什么？', a: 'JWT（JSON Web Token）是一种紧凑的、URL 安全的令牌格式，用于在各方之间安全传输信息。由三部分组成：Header（算法类型）.Payload（声明数据）.Signature（签名），用点分隔，均 Base64Url 编码。' },
      { q: 'JWT 是加密的吗？', a: 'JWT 默认不是加密的。Header 和 Payload 只是 Base64 编码，任何人都能解码查看内容。JWT 保证的是完整性（防篡改）而非机密性。如需加密内容，应使用 JWE（JSON Web Encryption）。' },
      { q: 'JWT 的 exp、iat、nbf 是什么？', a: 'exp（Expiration Time）过期时间，iat（Issued At）签发时间，nbf（Not Before）生效时间，均为 Unix 时间戳。服务器验证 Token 时会检查这些字段，过期或未生效的 Token 会被拒绝。' },
      { q: 'JWT 和 Session 有什么区别？', a: 'Session 状态存在服务端，客户端只存 Session ID（通常在 Cookie），服务端查 Session 存储。JWT 是无状态的，Token 自带用户信息，服务端只需验签无需查询。JWT 适合微服务、跨域、移动端；Session 适合传统 Web 应用。' },
    ],
    related: ['rsa', 'hmac', 'base64', 'url-encode'],
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
    seoTitle: 'TOTP 两步验证码在线生成 - 动态口令/2FA 工具 | HyperGrad',
    seoDescription: '免费在线 TOTP 两步验证码生成器，兼容 Google Authenticator，RFC 6238 标准，30 秒刷新。纯浏览器本地生成。',
    faq: [
      { q: 'TOTP 是什么？', a: 'TOTP（Time-based One-Time Password）是基于时间的一次性密码，RFC 6238 标准。基于共享密钥和当前时间生成 6 位数字验证码，每 30 秒变化一次。Google Authenticator、Microsoft Authenticator 等都使用此算法。' },
      { q: 'TOTP 和 HOTP 的区别？', a: 'TOTP 基于时间计数，每 30 秒生成新码。HOTP（RFC 4226）基于事件计数，每次使用后计数器加 1 生成新码。TOTP 无需同步计数器，更方便，是目前主流的 2FA 方案。' },
      { q: '为什么我的 TOTP 码和手机上不一样？', a: 'TOTP 依赖时间同步，如果设备时间偏差超过 30 秒，生成的验证码会不一致。请确保设备时间已通过 NTP 自动校准。另外检查 Base32 密钥是否正确输入。' },
      { q: 'TOTP 安全吗？', a: 'TOTP 提供强第二因素认证。即使密码泄露，攻击者没有动态码也无法登录。但 TOTP 密钥需妥善保管，建议在启用 2FA 时保存恢复码，以防丢失设备。本工具密钥仅本地存储，不传输。' },
    ],
    related: ['password-generator', 'password-strength', 'hmac', 'hash'],
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
    seoTitle: 'SM4 国密加密在线 - 国密对称算法 ECB/CBC 工具 | HyperGrad',
    seoDescription: '免费在线 SM4 国密对称加密解密工具，支持 ECB/CBC 模式，符合 GM/T 0002 标准。纯浏览器本地运算，密钥不上传。',
    faq: [
      { q: 'SM4 是什么？', a: 'SM4 是中国国家密码管理局发布的分组对称加密算法，GM/T 0002 标准，2012 年成为国家标准 GB/T 32907。分组长度和密钥长度均为 128 位，32 轮非平衡 Feistel 结构。用于政务、金融、电信等需要国密合规的场景。' },
      { q: 'SM4 和 AES 有什么区别？', a: '两者都是 128 位分组对称加密。SM4 密钥固定 128 位，AES 支持 128/192/256 位。SM4 采用 32 轮 Feistel 结构，AES 采用 10-14 轮替换置换网络。性能上 AES 通常更快（硬件加速），SM4 在国产化环境有优化。功能上可互相替代。' },
      { q: '什么场景需要用 SM4？', a: '中国政务系统、金融 IC 卡、电子政务、电信基础设施等强制要求国密算法的场景。涉及等保三级以上、密评合规的系统通常要求使用 SM2/SM3/SM4 替换 RSA/SHA/AES。' },
      { q: 'SM4 的密钥怎么生成？', a: 'SM4 密钥为 128 位（16 字节），应使用密码学安全的随机数生成器产生。本工具支持随机生成或手动输入 16 字节密钥。密钥应通过安全渠道分发和存储，不可明文传输。' },
    ],
    related: ['sm3', 'aes', 'hash', 'hmac'],
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
    seoTitle: 'SM3 国密哈希在线 - 256 位密码杂凑算法工具 | HyperGrad',
    seoDescription: '免费在线 SM3 国密密码杂凑算法工具，输出 256 位摘要，符合 GM/T 0004 标准。纯浏览器本地运算。',
    faq: [
      { q: 'SM3 是什么？', a: 'SM3 是中国国家密码管理局发布的密码杂凑算法，GM/T 0004 标准，2010 年发布，2012 年成为国家标准 GB/T 32905。输出 256 位摘要，采用 Merkle-Dåmgard 结构，安全性等同于 SHA-256。' },
      { q: 'SM3 和 SHA-256 有什么区别？', a: '两者都输出 256 位哈希，安全性相当。SM3 是中国国密标准，SHA-256 是美国 NIST 标准。SM3 采用 64 轮压缩，SHA-256 采用 64 轮压缩，结构不同但安全等级相同。需要国密合规用 SM3，否则 SHA-256 更通用。' },
      { q: 'SM3 用在哪些场景？', a: 'SM3 用于国密合规场景的完整性校验、数字签名、密码存储。SM2 数字签名使用 SM3 作为哈希函数。配合 SM4 组成国密套件，用于政务、金融等系统的数据保护。' },
      { q: 'SM3 可以用于存密码吗？', a: '和其他普通哈希一样，SM3 直接存密码不安全，易受彩虹表攻击。密码存储应使用专门的慢速哈希算法（bcrypt/scrypt/Argon2），或在 SM3 基础上实现类似 PBKDF2 的密钥派生。' },
    ],
    related: ['sm4', 'hash', 'hmac', 'aes'],
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
    seoTitle: 'PGP 加密解密在线 - OpenPGP 公钥加密工具 | HyperGrad',
    seoDescription: '免费在线 PGP 加密解密工具，基于 OpenPGP 标准，支持 RSA 密钥对生成、ASCII Armored 输出、公钥加密私钥解密。纯浏览器本地运算。',
    faq: [
      { q: 'PGP 是什么？', a: 'PGP（Pretty Good Privacy）是 Phil Zimmermann 于 1991 年创建的加密程序，OpenPGP 是其开放标准（RFC 4880）。用于加密签名通信，广泛用于安全邮件（如 ProtonMail）、软件包签名、密钥服务器等场景。' },
      { q: 'PGP 和 GPG 的区别？', a: 'PGP 是商业软件（现属 Broadcom）。GPG（GnuPG）是 OpenPGP 标准的免费开源实现，命令行工具。两者实现同一标准，密钥和消息格式兼容。本工具使用 openpgp.js 库，遵循 OpenPGP 标准。' },
      { q: 'PGP 怎么用？', a: '1.生成密钥对（公钥+私钥）；2.把公钥分享给对方；3.对方用你的公钥加密消息发给你；4.你用自己的私钥解密。反之亦然。私钥必须保密，公钥可公开。' },
      { q: 'PGP 安全吗？', a: 'PGP 本身设计安全，使用 RSA/ECC 强加密。但实际安全性取决于私钥保管和密码强度。PGP 的争议主要在易用性——邮件加密 UX 难以普及。本工具私钥仅在浏览器内存中使用，不存储不传输。' },
    ],
    related: ['rsa', 'aes', 'hash', 'base64'],
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
    seoTitle: 'Hex 十六进制编解码在线 - 字符串/Hex 互转工具 | HyperGrad',
    seoDescription: '免费在线 Hex 十六进制编解码工具，支持文本与 Hex 互转、空格分隔、大小写设置、字节序。纯浏览器本地运算。',
    faq: [
      { q: '十六进制是什么？', a: '十六进制（Hexadecimal）是基数为 16 的计数法，用 0-9 和 a-f 表示一个字节（0-255）。一个字节用两个十六进制字符表示，如 0x41 表示字符 A。常用于显示二进制数据、内存地址、哈希值、密钥等。' },
      { q: 'Hex 和 Base64 哪个好？', a: 'Hex 编码体积是原文的 2 倍（200%），Base64 约 133%。Base64 更紧凑适合传输。Hex 可读性更好、每字节对齐，适合调试和显示密钥/哈希。根据场景选择。' },
      { q: '十六进制怎么转中文？', a: '中文以 UTF-8 编码存储，每个汉字占 3 字节，即 6 个十六进制字符。例如"中"的 UTF-8 编码为 E4 B8 AD。把 Hex 字符串按字节解析为 Uint8Array，再用 TextDecoder 以 UTF-8 解码即可得到中文。' },
      { q: 'Hex 编码能加密吗？', a: '不能。Hex 只是编码，任何人都能解码，无保密性。如果需要保护数据，请使用 AES/RSA 等真正的加密算法。Hex 常用于显示加密后的密文（因为密文是二进制，不便直接显示）。' },
    ],
    related: ['base64', 'url-encode', 'hash', 'aes'],
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
    seoTitle: '凯撒密码在线 - 凯撒移位加密解密/爆破工具 | HyperGrad',
    seoDescription: '免费在线凯撒密码工具，支持自定义偏移量移位加密解密，爆破所有 26 种位移，ROT13 特殊模式。纯浏览器本地运算。',
    faq: [
      { q: '凯撒密码是什么？', a: '凯撒密码（Caesar Cipher）是最古老的加密方法之一，相传凯撒大帝用于军事通信。原理是将字母表中的每个字母按固定位数向后移位，如偏移 3 则 A→D、B→E。简单但具有历史意义，是密码学入门经典。' },
      { q: '凯撒密码安全吗？', a: '不安全。凯撒密码只有 25 种可能的偏移量（1-25，0 为不加密），暴力破解只需尝试 25 次。它仅用于教学、CTF 比赛、趣味解密，绝不能用于真实安全场景。' },
      { q: 'ROT13 是什么？', a: 'ROT13 是凯撒密码偏移量为 13 的特殊情况。由于英文字母 26 个，偏移 13 后再次偏移 13 即还原，所以 ROT13 加密和解密是同一操作。常用于在线论坛隐藏剧透、谜底等。' },
      { q: '怎么破解凯撒密码？', a: '两种方法：1.暴力破解——尝试所有 25 种偏移量，人工识别哪个是有意义的文本；2.频率分析——统计密文字母频率，与英文标准频率对比（E 出现最多），推断偏移量。本工具内置 26 位移爆破功能。' },
    ],
    related: ['morse', 'base64', 'hex', 'hash'],
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
    seoTitle: '摩斯密码在线翻译 - 摩斯电码编解码/声音播放 | HyperGrad',
    seoDescription: '免费在线摩斯密码翻译器，文本与摩斯电码互转，支持声音播放、自定义 WPM 速度与分隔符。纯浏览器本地运算。',
    faq: [
      { q: '摩斯密码是什么？', a: '摩斯密码（Morse Code）由 Samuel Morse 于 1830 年代发明，用点（·）和划（—）的序列表示字母和数字。最初用于电报通信，现在广泛用于业余无线电、航空航海信标、应急通信（SOS）等场景。' },
      { q: '摩斯密码怎么学？', a: '记忆每个字母对应的点划序列，如 A·-、B-···。建议用口诀辅助记忆。练习听音辨识——本工具支持声音播放，点和划的时长比 1:3，不同字母间隔 3 个点时长，不同单词间隔 7 个点时长。' },
      { q: 'SOS 为什么是 ···---···？', a: 'SOS 是国际通用求救信号。S 为 ···（三短），O 为 ---（三长），所以 SOS 为 ···---···。选择 SOS 并非因为它代表某个词，而是因为这个序列简洁、易辨识、易发送，在嘈杂环境中也容易识别。' },
      { q: '摩斯密码能加密吗？', a: '摩斯密码本质是编码而非加密，任何人都能解码。它主要用于通信传输而非保密。如需保密，应在摩斯编码前先用真正的加密算法（如 AES）加密内容。' },
    ],
    related: ['caesar', 'base64', 'hex', 'hash'],
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
  '分享加密': { icon: '🔗', color: '#4F46E5' },
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
