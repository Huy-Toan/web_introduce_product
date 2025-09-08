import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../public/locales');
const SRC_DIR = path.join(__dirname, '../src');
const SOURCE_LANG = 'vi';
const TARGET_LANGS = ['en'];
const NAMESPACES = ['nav', 'common', 'banner', 'home', 'about', 'product', 'news', 'contact'];

class I18nSynchronizer {
  constructor() {
    this.usedKeys = new Set();
    this.unusedKeys = new Set();
    this.missingTranslations = new Map();
  }

  // Đọc file JSON
  readLocaleFile(lang, namespace) {
    const filePath = path.join(LOCALES_DIR, lang, `${namespace}.json`);
    if (!fs.existsSync(filePath)) {
      return {};
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.warn(`⚠️ Lỗi đọc file ${filePath}:`, error.message);
      return {};
    }
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

  // Quét tất cả file source để tìm keys đang được sử dụng
  scanUsedKeys() {
    console.log('🔍 Đang quét các key đang được sử dụng trong code...');

    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDir(fullPath);
        } else if (['.js', '.jsx', '.ts', '.tsx'].some(ext => item.endsWith(ext))) {
          this.scanFileForKeys(fullPath);
        }
      }
    };

    scanDir(SRC_DIR);
    console.log(`📊 Tìm thấy ${this.usedKeys.size} key đang được sử dụng`);
  }

  // Quét một file để tìm các key t()
  scanFileForKeys(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Tìm các pattern t("key") và t('key')
      const patterns = [
        /t\(\s*["']([^"']+)["']\s*\)/g,
        /t\(\s*`([^`]+)`\s*\)/g
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          this.usedKeys.add(match[1]);
        }
      });
    } catch (error) {
      console.warn(`⚠️ Lỗi đọc file ${filePath}:`, error.message);
    }
  }

  // Flatten nested object để dễ so sánh
  flattenObject(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    return result;
  }

  // Tìm keys chưa được sử dụng
  findUnusedKeys() {
    console.log('📋 Đang tìm keys chưa được sử dụng...');

    for (const namespace of NAMESPACES) {
      const sourceData = this.readLocaleFile(SOURCE_LANG, namespace);
      const flatData = this.flattenObject(sourceData);

      for (const key of Object.keys(flatData)) {
        const fullKey = `${key}`;
        if (!this.usedKeys.has(fullKey)) {
          this.unusedKeys.add(`${namespace}:${fullKey}`);
        }
      }
    }

    console.log(`📊 Tìm thấy ${this.unusedKeys.size} key chưa được sử dụng`);
  }

  // Tìm bản dịch bị thiếu hoặc sai
  findMissingTranslations() {
    console.log('🔍 Đang kiểm tra bản dịch bị thiếu...');

    for (const namespace of NAMESPACES) {
      const sourceData = this.readLocaleFile(SOURCE_LANG, namespace);
      const sourceFlat = this.flattenObject(sourceData);

      for (const targetLang of TARGET_LANGS) {
        const targetData = this.readLocaleFile(targetLang, namespace);
        const targetFlat = this.flattenObject(targetData);

        const missingInTarget = [];
        const badTranslations = [];

        for (const [key, sourceValue] of Object.entries(sourceFlat)) {
          const targetValue = targetFlat[key];

          if (!targetValue) {
            missingInTarget.push({ key, sourceValue });
          } else if (this.isBadTranslation(targetValue)) {
            badTranslations.push({ key, sourceValue, targetValue });
          }
        }

        if (missingInTarget.length > 0 || badTranslations.length > 0) {
          this.missingTranslations.set(`${namespace}-${targetLang}`, {
            missing: missingInTarget,
            bad: badTranslations
          });
        }
      }
    }
  }

  // Kiểm tra bản dịch có bị lỗi không
  isBadTranslation(text) {
    const badPatterns = [
      'MYMEMORY WARNING',
      'QUOTA EXCEEDED',
      'INVALID SOURCE LANGUAGE',
      '[NEEDS_TRANSLATION]',
      'GALLERY', // Specific bad translation
      'bond', // Specific bad translation
      'Manga' // Wrong context
    ];

    return badPatterns.some(pattern => text.includes(pattern));
  }

  // Tạo báo cáo chi tiết
  generateReport() {
    console.log('\n📊 === BÁO CÁO ĐỒNG BỘ I18N ===');

    console.log('\n🔑 KEYS CHƯA ĐƯỢC SỬ DỤNG:');
    if (this.unusedKeys.size === 0) {
      console.log('  ✅ Tất cả keys đều được sử dụng');
    } else {
      const unusedArray = Array.from(this.unusedKeys).slice(0, 20); // Show first 20
      unusedArray.forEach(key => {
        const [namespace, actualKey] = key.split(':');
        const sourceData = this.readLocaleFile(SOURCE_LANG, namespace);
        const value = this.getNestedValue(sourceData, actualKey);
        console.log(`  - ${key}: "${value}"`);
      });
      if (this.unusedKeys.size > 20) {
        console.log(`  ... và ${this.unusedKeys.size - 20} keys khác`);
      }
    }

    console.log('\n🌐 BÁN DỊCH BỊ THIẾU/SAI:');
    if (this.missingTranslations.size === 0) {
      console.log('  ✅ Tất cả bản dịch đều hoàn chỉnh');
    } else {
      for (const [key, data] of this.missingTranslations) {
        const [namespace, lang] = key.split('-');
        console.log(`\n  📁 ${namespace} (${lang}):`);

        if (data.missing.length > 0) {
          console.log(`    ❌ Thiếu ${data.missing.length} bản dịch:`);
          data.missing.slice(0, 5).forEach(item => {
            console.log(`      - ${item.key}: "${item.sourceValue}"`);
          });
        }

        if (data.bad.length > 0) {
          console.log(`    ⚠️ Bản dịch sai ${data.bad.length} key:`);
          data.bad.slice(0, 5).forEach(item => {
            console.log(`      - ${item.key}: "${item.targetValue}" (từ "${item.sourceValue}")`);
          });
        }
      }
    }
  }

  // Get nested value từ object
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Set nested value trong object
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Tự động sửa một số bản dịch sai phổ biến
  fixCommonBadTranslations() {
    console.log('\n🔧 Đang sửa các bản dịch sai phổ biến...');

    const commonFixes = {
      'GALLERY': 'Library',
      'bond': 'Book',
      'New Manga': 'New Books',
      'Manga Name': 'Book Title',
      'All Manga Genres': 'All Categories',
      'Add New Manga': 'Add New Book',
      'Edit lists': 'Edit Book',
      'Book ID': 'Add Book'
    };

    let fixCount = 0;

    for (const namespace of NAMESPACES) {
      for (const targetLang of TARGET_LANGS) {
        const targetData = this.readLocaleFile(targetLang, namespace);
        let modified = false;

        const fixInObject = (obj) => {
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
              fixInObject(value);
            } else if (typeof value === 'string') {
              for (const [badText, goodText] of Object.entries(commonFixes)) {
                if (value.includes(badText)) {
                  obj[key] = value.replace(badText, goodText);
                  console.log(`    ✅ Sửa "${badText}" → "${goodText}" trong ${namespace}.${key}`);
                  modified = true;
                  fixCount++;
                }
              }
            }
          }
        };

        fixInObject(targetData);

        if (modified) {
          this.writeLocaleFile(targetLang, namespace, targetData);
        }
      }
    }

    console.log(`✅ Đã sửa ${fixCount} bản dịch sai`);
  }

  // Chạy đồng bộ hoàn chỉnh
  async runFullSync() {
    console.log('🚀 Bắt đầu đồng bộ hóa I18n toàn diện...\n');

    // Bước 1: Quét keys đang được sử dụng
    this.scanUsedKeys();

    // Bước 2: Tìm keys chưa sử dụng
    this.findUnusedKeys();

    // Bước 3: Tìm bản dịch thiếu/sai
    this.findMissingTranslations();

    // Bước 4: Sửa bản dịch sai phổ biến
    this.fixCommonBadTranslations();

    // Bước 5: Tạo báo cáo
    this.generateReport();

    // Bước 6: Lưu báo cáo
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        usedKeys: this.usedKeys.size,
        unusedKeys: this.unusedKeys.size,
        missingTranslations: this.missingTranslations.size
      },
      unusedKeys: Array.from(this.unusedKeys),
      missingTranslations: Object.fromEntries(this.missingTranslations)
    };

    fs.writeFileSync(
      path.join(__dirname, 'sync-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n💾 Báo cáo đã lưu tại scripts/sync-report.json');
    console.log('🎉 Hoàn thành đồng bộ hóa!');
  }
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  const synchronizer = new I18nSynchronizer();

  switch (command) {
    case 'sync':
      await synchronizer.runFullSync();
      break;
    case 'scan':
      synchronizer.scanUsedKeys();
      break;
    case 'fix':
      synchronizer.fixCommonBadTranslations();
      break;
    default:
      console.log(`
🔧 I18n Synchronization Tool

Commands:
  sync    - Chạy đồng bộ hoàn chỉnh
  scan    - Chỉ quét keys đang sử dụng  
  fix     - Chỉ sửa bản dịch sai phổ biến

Usage:
  node scripts/sync-i18n.js sync
`);
  }
}

main().catch(console.error);