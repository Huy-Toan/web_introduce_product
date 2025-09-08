import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as delayTimeout } from 'timers/promises';

// Tạo __dirname cho ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình
const LOCALES_DIR = path.join(__dirname, '../public/locales');
const SOURCE_LANG = 'vi'; // Ngôn ngữ gốc - đổi từ 'vn' thành 'vi'
const TARGET_LANGS = ['en']; // Các ngôn ngữ cần dịch
const NAMESPACES = ['nav', 'common', 'banner', 'home', 'about', 'product', 'news', 'contact']; // Các namespace

// Cho phép cấu hình nhiều instance LibreTranslate (bao gồm local)
const LIBRE_URLS = (process.env.LIBRETRANSLATE_URLS ||
  'https://libretranslate.de,https://translate.argosopentech.com')
  .split(',').map(u => u.trim()).filter(Boolean);

// Tùy chọn nhiều API key nếu cần tạo nhiều account miễn phí
const LIBRE_KEYS = (process.env.LIBRETRANSLATE_API_KEYS || '')
  .split(',').map(k => k.trim()).filter(Boolean);

class TranslationManager {
  constructor() {
    // Sử dụng fetch thay vì GoogleTranslator để tránh dependency issues
    this.cache = new Map(); // cache kết quả dịch
    this.dbCache = new Map(); // cache dữ liệu DB
    this.libreIndex = 0;
  }

  getCacheKey(text, sourceLang, targetLang) {
    return `${sourceLang}:${targetLang}:${text}`;
  }

  async fetchWithRetry(url, options = {}, retries = 2, timeout = 8000) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
      } catch (err) {
        clearTimeout(id);
        if (attempt === retries) throw err;
      }
    }
  }

  isEnglishText(text) {
    return /[A-Za-z]/.test(text) && !/[À-Ỵà-ỹ]/.test(text);
  }

  // Đọc file JSON
  readLocaleFile(lang, namespace) {
    const filePath = path.join(LOCALES_DIR, lang, `${namespace}.json`);
    if (!fs.existsSync(filePath)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // Ghi file JSON
  writeLocaleFile(lang, namespace, data) {
    const dir = path.join(LOCALES_DIR, lang);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${namespace}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  // Dịch text bằng nhiều API fallback với LibreTranslate
  async translateText(text, targetLang, sourceLang = SOURCE_LANG) {
    const cleanText = text.trim();
    if (!cleanText) return text;

    const cacheKey = this.getCacheKey(cleanText, sourceLang, targetLang);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Thử API đầu tiên: MyMemory
    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${sourceLang}|${targetLang}`;
      const response = await this.fetchWithRetry(myMemoryUrl);
      const data = await response.json();

      if (data && data.responseData && data.responseData.translatedText &&
          !data.responseData.translatedText.includes('INVALID SOURCE LANGUAGE') &&
          !data.responseData.translatedText.includes('MYMEMORY WARNING') &&
          !data.responseData.translatedText.includes('QUOTA EXCEEDED')) {
        console.log(`    ✅ MyMemory API: "${data.responseData.translatedText}"`);
        this.cache.set(cacheKey, data.responseData.translatedText);
        return data.responseData.translatedText;
      }
    } catch (error) {
      console.log(`    ❌ MyMemory API failed: ${error.message}`);
    }

    // Thử nhiều instance LibreTranslate với retry/timeout
    for (let i = 0; i < LIBRE_URLS.length; i++) {
      const url = `${LIBRE_URLS[this.libreIndex % LIBRE_URLS.length]}/translate`;
      const apiKey = LIBRE_KEYS.length ? LIBRE_KEYS[this.libreIndex % LIBRE_KEYS.length] : undefined;
      this.libreIndex++;
      try {
        const response = await this.fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: cleanText,
            source: sourceLang,
            target: targetLang,
            format: 'text',
            api_key: apiKey
          })
        });
        const data = await response.json();
        if (data && data.translatedText && data.translatedText.trim()) {
          console.log(`    ✅ LibreTranslate API: "${data.translatedText}"`);
          this.cache.set(cacheKey, data.translatedText);
          return data.translatedText;
        }
      } catch (error) {
        console.log(`    ❌ LibreTranslate API failed: ${error.message}`);
      }
    }

    // Fallback cuối: dịch manual cho một số từ phổ biến
    const manualTranslations = {
      'vi': {
        'en': {
          'Thư viện': 'Library',
          'Sách': 'Book',
          'Sách mới': 'New Books',
          'Sách văn học': 'Literature Books',
          'Sách khoa học': 'Science Books',
          'Sách thiếu nhi': 'Children\'s Books',
          'Tác giả': 'Author',
          'Thể loại': 'Category',
          'Tìm kiếm': 'Search',
          'Đang tải...': 'Loading...',
          'Không có kết quả': 'No results',
          'Lưu': 'Save',
          'Hủy': 'Cancel',
          'Sửa': 'Edit',
          'Xóa': 'Delete',
          'Thêm': 'Add',
          'Mô tả': 'Description',
          'Giá': 'Price',
          'Tin tức': 'News',
          'Liên hệ': 'Contact',
          'Về chúng tôi': 'About Us'
        }
      }
    };

    const manualResult = manualTranslations[SOURCE_LANG]?.[targetLang]?.[cleanText];
    if (manualResult) {
      console.log(`    ✅ Manual Translation: "${manualResult}"`);
      return manualResult;
    }

    // Nếu tất cả API đều fail, giữ nguyên text gốc và đánh dấu
    console.log(`    ⚠️ All APIs failed, keeping original: "${cleanText}"`);
    return `[NEEDS_TRANSLATION] ${cleanText}`;
  }

  // Dịch dữ liệu DB (được dùng cho on-write và on-read)
  async translateDb(text, targetLang) {
    if (!text) return text;

    const isEnglish = this.isEnglishText(text);
    let sourceText = text;

    // Nếu chuỗi đầu vào là tiếng Anh, chuyển về tiếng Việt làm nguồn chuẩn
    if (isEnglish) {
      sourceText = await this.translateText(text, SOURCE_LANG, 'en');
    }

    const cacheKey = this.getCacheKey(sourceText, SOURCE_LANG, targetLang);
    if (this.dbCache.has(cacheKey)) {
      return this.dbCache.get(cacheKey);
    }

    let translated;
    if (targetLang === SOURCE_LANG) {
      translated = sourceText;
    } else if (isEnglish && targetLang === 'en') {
      // Văn bản gốc đã là tiếng Anh
      translated = text;
    } else {
      translated = await this.translateText(sourceText, targetLang);
    }

    this.dbCache.set(cacheKey, translated);
    return translated;
  }

  // Dịch dữ liệu DB trước khi ghi (on-write) và warm cache
  async translateDbOnWrite(text, targetLang = 'en') {
    const translated = await this.translateDb(text, targetLang);
    return translated;
  }

  // Lấy bản dịch khi đọc dữ liệu (on-read)
  async translateDbOnRead(text, targetLang = 'en') {
    // Gọi translateDb trực tiếp để đảm bảo cache được xử lý thống nhất,
    // tránh trường hợp đầu vào là tiếng Anh khiến khóa cache không khớp.
    return this.translateDb(text, targetLang);
  }

  // Tìm key mới cần dịch
  findMissingKeys(sourceData, targetData) {
    const missingKeys = {};

    const findMissing = (sourceObj, targetObj, prefix = '') => {
      Object.keys(sourceObj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null) {
          if (!targetObj[key] || typeof targetObj[key] !== 'object') {
            targetObj[key] = {};
          }
          findMissing(sourceObj[key], targetObj[key], fullKey);
        } else {
          if (!targetObj[key]) {
            missingKeys[fullKey] = sourceObj[key];
          }
        }
      });
    };

    findMissing(sourceData, targetData);
    return missingKeys;
  }

  // Dịch tất cả key mới
  async translateMissingKeys() {
    console.log('🚀 Bắt đầu dịch các key mới...\n');

    for (const namespace of NAMESPACES) {
      console.log(`📁 Xử lý namespace: ${namespace}`);

      // Đọc file gốc
      const sourceData = this.readLocaleFile(SOURCE_LANG, namespace);
      if (Object.keys(sourceData).length === 0) {
        console.log(`⚠️  File ${SOURCE_LANG}/${namespace}.json trống hoặc không tồn tại\n`);
        continue;
      }

      for (const targetLang of TARGET_LANGS) {
        console.log(`  🌐 Dịch sang ${targetLang}...`);

        // Đọc file đích
        let targetData = this.readLocaleFile(targetLang, namespace);

        // Tìm key mới
        const missingKeys = this.findMissingKeys(sourceData, targetData);
        const missingCount = Object.keys(missingKeys).length;

        if (missingCount === 0) {
          console.log(`  ✅ Không có key mới cần dịch\n`);
          continue;
        }

        console.log(`  🔄 Tìm thấy ${missingCount} key mới, bắt đầu dịch...`);

        // Dịch từng key
        for (const [keyPath, text] of Object.entries(missingKeys)) {
          console.log(`    - Dịch: "${text}"`);
          let sourceText = text;

          // Nếu text gốc là tiếng Anh, dịch sang tiếng Việt trước
          if (this.isEnglishText(text)) {
            try {
              const viText = await this.translateText(text, SOURCE_LANG, 'en');
              this.setNestedValue(sourceData, keyPath, viText);
              this.writeLocaleFile(SOURCE_LANG, namespace, sourceData);
              sourceText = viText;

              if (targetLang === 'en') {
                // Giữ nguyên tiếng Anh gốc
                this.setNestedValue(targetData, keyPath, text);
                await delayTimeout(300);
                continue;
              }
            } catch (err) {
              console.warn(`    ⚠️ Không dịch được EN→VI: ${err.message}`);
            }
          }

          const translatedText = await this.translateText(sourceText, targetLang);

          // Cập nhật vào targetData
          this.setNestedValue(targetData, keyPath, translatedText);

          // Delay để tránh spam API
          await delayTimeout(500);
        }

        // Ghi file
        this.writeLocaleFile(targetLang, namespace, targetData);
        console.log(`  ✅ Đã dịch xong ${missingCount} key cho ${targetLang}\n`);
      }
    }

    console.log('🎉 Hoàn thành dịch tất cả!');
  }

  // Set giá trị cho nested object
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  // Thêm key mới vào file gốc
  addKey(namespace, key, value) {
    const sourceData = this.readLocaleFile(SOURCE_LANG, namespace);
    this.setNestedValue(sourceData, key, value);
    this.writeLocaleFile(SOURCE_LANG, namespace, sourceData);
    console.log(`✅ Đã thêm key "${key}": "${value}" vào ${SOURCE_LANG}/${namespace}.json`);
  }
}

// Khởi tạo manager dùng chung cho CLI và import từ module khác
const manager = new TranslationManager();

// Các hàm hỗ trợ dịch DB cho phần khác của ứng dụng
export const translateDbOnWrite = (text, targetLang) =>
  manager.translateDbOnWrite(text, targetLang);

export const translateDbOnRead = (text, targetLang) =>
  manager.translateDbOnRead(text, targetLang);

// CLI Commands
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'translate':
      await manager.translateMissingKeys();
      break;

    case 'add':
      if (args.length < 4) {
        console.log('Sử dụng: npm run translate:add <namespace> <key> <value>');
        console.log('Ví dụ: npm run translate:add nav welcome "Chào mừng bạn"');
        return;
      }
      const [, namespace, key, value] = args;
      manager.addKey(namespace, key, value);
      break;

    default:
      console.log('Các lệnh có sẵn:');
      console.log('  npm run translate:auto  - Dịch tất cả key mới');
      console.log('  npm run translate:add <namespace> <key> <value>  - Thêm key mới');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}