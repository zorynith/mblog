/**
 * Learn more about Honeypot protection:
 * @see https://github.com/sergiodxa/remix-utils?tab=readme-ov-file#form-honeypot
 */
import { generateRandomString, encryptAES, decryptAES } from './crypto';
import { SpamError } from 'remix-utils/honeypot/server';

interface HoneypotConfig {
  encryptionSeed: string;
  inputName?: string;
  validFromName?: string;
}

export class Honeypot {
  private readonly inputName: string;
  private readonly validFromName: string;
  private readonly encryptionSeed: string;

  constructor(config: HoneypotConfig) {
    this.inputName = config.inputName ?? 'hs';
    this.validFromName = config.validFromName ?? 'vf';
    this.encryptionSeed = config.encryptionSeed;
  }

  async generate() {
    const now = new Date().getTime();
    const randomValue = await generateRandomString();
    const encryptedValue = await encryptAES(
      `${now}:${randomValue}`,
      this.encryptionSeed
    );

    return {
      inputName: this.inputName,
      validFromName: this.validFromName,
      value: encryptedValue,
    };
  }

  async check(formData: FormData) {
    const honeypotValue = formData.get(this.inputName);
    const validFromValue = formData.get(this.validFromName);

    // 检查是否填写了蜜罐字段
    if (honeypotValue) {
      throw new SpamError('Honeypot field should be empty');
    }

    if (!validFromValue || typeof validFromValue !== 'string') {
      throw new SpamError('Missing or invalid validFrom value');
    }

    try {
      const decrypted = await decryptAES(validFromValue, this.encryptionSeed);
      const [timestamp] = decrypted.split(':');
      const validFrom = parseInt(timestamp, 10);

      // 检查表单提交时间是否合理（不能快于生成时间）
      if (new Date().getTime() < validFrom) {
        throw new SpamError('Form submitted too quickly');
      }
    } catch (error) {
      throw new SpamError('Invalid encryption data');
    }
  }
}

// 创建单例实例
export const honeypot = new Honeypot({
  encryptionSeed: "AUTOMATICALLY_GENERATED_ON_TEMPLATE_INITIALIZATION"
});

// 导出便捷的检查函数
export async function checkHoneypot(formData: FormData) {
  try {
    await honeypot.check(formData);
  } catch (err: unknown) {
    if (err instanceof SpamError) {
      throw new Response('Form not submitted properly', { status: 400 });
    }
    throw err;
  }
}
