import * as CryptoJS from 'crypto-js';

export class CryptoUtil {
  // 前端传过来的密钥和IV，必须与前端保持一致
  private static readonly KEY = CryptoJS.enc.Utf8.parse('sdghj7df7h23jhy9yh94');
  private static readonly IV = CryptoJS.enc.Utf8.parse('gysd7sdg87g2487crhhu');

  /**
   * AES 加密
   * @param text 需要加密的文本
   * @returns 加密后的文本
   */
  static encrypt(text: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(text, this.KEY, {
        iv: this.IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.toString();
    } catch (error) {
      throw new Error(`加密失败: ${error.message}`);
    }
  }

  /**
   * AES 解密
   * @param encrypted 加密后的文本
   * @returns 解密后的文本
   */
  static decrypt(encrypted: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.KEY, {
        iv: this.IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`解密失败: ${error.message}`);
    }
  }
}
