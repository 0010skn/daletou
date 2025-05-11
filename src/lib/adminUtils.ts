/**
 * 纯JavaScript实现的MD5哈希函数
 * 这是一个不依赖Node.js crypto模块的MD5实现，可以在Edge Runtime中使用
 * @param input 要哈希的字符串
 * @returns MD5哈希值
 */
export function md5(input: string): string {
  // MD5算法所需的常量
  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
    0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
    0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x2441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
    0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
    0xd4ef3085, 0x4881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
    0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  const r = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
    16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21,
  ];

  // 初始化四个32位寄存器
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  // 准备输入
  const strToBytes = (str: string): number[] => {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) & 0xff);
    }
    return bytes;
  };

  const bytes = strToBytes(input);
  const originalBitsLength = bytes.length * 8;

  // 附加填充位
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }

  // 附加原始长度
  for (let i = 0; i < 8; i++) {
    bytes.push((originalBitsLength >>> (i * 8)) & 0xff);
  }

  // 处理消息块
  for (let i = 0; i < bytes.length; i += 64) {
    const block = bytes.slice(i, i + 64);

    // 划分为16个32位字
    const M = [];
    for (let j = 0; j < 64; j += 4) {
      M.push(
        block[j] |
          (block[j + 1] << 8) |
          (block[j + 2] << 16) |
          (block[j + 3] << 24)
      );
    }

    // 初始化哈希值
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    // 主循环
    for (let j = 0; j < 64; j++) {
      let f, g;

      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      b = b + leftRotate(a + f + k[j] + M[g], r[j]);
      a = temp;
    }

    // 将结果添加到哈希中
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  // 将结果转换为16进制字符串
  return toHexString(a0) + toHexString(b0) + toHexString(c0) + toHexString(d0);

  // 辅助函数
  function leftRotate(x: number, c: number): number {
    return ((x << c) | (x >>> (32 - c))) >>> 0;
  }

  function toHexString(num: number): string {
    let hex = "";
    for (let i = 0; i < 4; i++) {
      const byte = (num >>> (i * 8)) & 0xff;
      hex += (byte < 16 ? "0" : "") + byte.toString(16);
    }
    return hex;
  }
}

/**
 * 使用MD5加密ADMIN_KEY生成管理面板路由
 * @returns MD5加密后的管理员密钥路径
 */
export function getAdminPanelPath(): string {
  try {
    const adminKey = process.env.ADMIN_KEY || "your_secure_admin_key_here";
    // 确保即使输入为undefined或null也能正常工作
    const safeKey = String(adminKey || "");
    const result = md5(safeKey);
    // 确保返回的是字符串
    return String(result);
  } catch (error) {
    // 出现任何错误时返回一个固定值
    console.error("获取管理面板路径时出错:", error);
    return "admin";
  }
}

/**
 * 验证管理员密钥
 * @param inputKey 输入的管理员密钥
 * @returns 验证结果
 */
export function verifyAdminKey(inputKey: string): boolean {
  const adminKey = process.env.ADMIN_KEY || "your_secure_admin_key_here";
  return inputKey === adminKey;
}

/**
 * 生成新的量子密钥
 * @returns 新生成的8位量子密钥
 */
export function generateNewQuantumKey(): string {
  const timestamp = Date.now();
  const randomNum = Math.random().toString();
  const date = new Date().toISOString();

  const data = `${date}-${timestamp}-${randomNum}`;
  return md5(data).substring(0, 8);
}
