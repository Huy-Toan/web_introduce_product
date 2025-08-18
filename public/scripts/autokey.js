import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { promisify } from 'util';

// Tạo __dirname cho ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình mở rộng
const SRC_DIR = path.join(__dirname, '../src');
const API_DIR = path.join(__dirname, '../api');
const LOCALES_DIR = path.join(__dirname, '../public/locales');
const MAP_FILE = path.join(__dirname, 'autoi18n.map.json');
const BACKUP_DIR = path.join(__dirname, 'backups');
const VALIDATION_REPORT = path.join(__dirname, 'validation-report.json');

// Cấu hình đa ngôn ngữ
const LANGUAGES = {
  vi: { name: 'Vietnamese', pattern: /[À-Ỵà-ỹ]/g },
  en: { name: 'English', pattern: /[A-Za-z]/g },
  vn: { name: 'Vietnamese (VN)', pattern: /[À-Ỵà-ỹ]/g } // Alias cho vi
};

const SOURCE_LANG = 'vi';
const TARGET_LANGS = ['en'];

class AutoI18nManager {
  constructor() {
    this.babel = null;
    this.babelTypes = null;
    this.keyCounter = new Map();
    this.validationErrors = [];
    this.backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  // ========== BACKUP & ROLLBACK =========
  async createBackup() {
    console.log('🔄 Tạo backup locales...');

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const backupPath = path.join(BACKUP_DIR, `locales-backup-${this.backupTimestamp}`);

    // Backup toàn bộ thư mục locales
    await this.copyDirectory(LOCALES_DIR, backupPath);

    // Backup map file nếu có
    if (fs.existsSync(MAP_FILE)) {
      fs.copyFileSync(MAP_FILE, path.join(BACKUP_DIR, `map-backup-${this.backupTimestamp}.json`));
    }

    console.log(`✅ Backup đã tạo: ${backupPath}`);
    return backupPath;
  }

  async copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);

      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async rollback(backupTimestamp) {
    console.log(`🔙 Rollback về backup: ${backupTimestamp}`);

    const backupPath = path.join(BACKUP_DIR, `locales-backup-${backupTimestamp}`);
    const mapBackupPath = path.join(BACKUP_DIR, `map-backup-${backupTimestamp}.json`);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup không tồn tại: ${backupPath}`);
    }

    // Xóa locales hiện tại
    if (fs.existsSync(LOCALES_DIR)) {
      fs.rmSync(LOCALES_DIR, { recursive: true });
    }

    // Khôi phục từ backup
    await this.copyDirectory(backupPath, LOCALES_DIR);

    if (fs.existsSync(mapBackupPath)) {
      fs.copyFileSync(mapBackupPath, MAP_FILE);
    }

    console.log('✅ Rollback thành công!');
  }

  async listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('📁 Chưa có backup nào');
      return [];
    }

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(name => name.startsWith('locales-backup-'))
      .map(name => ({
        timestamp: name.replace('locales-backup-', ''),
        path: path.join(BACKUP_DIR, name),
        created: fs.statSync(path.join(BACKUP_DIR, name)).birthtime
      }))
      .sort((a, b) => b.created - a.created);

    console.log('📁 Danh sách backups:');
    backups.forEach((backup, index) => {
      console.log(`  ${index + 1}. ${backup.timestamp} (${backup.created.toLocaleString()})`);
    });

    return backups;
  }

  // ========== SCAN NÂNG CAO TỪ NHIỀU NGUỒN =========
  async scanMultipleSources() {
    console.log('🔍 Scan từ nhiều nguồn...');
    await this.createBackup();

    const sources = {
      jsx: await this.scanJSXFiles(),
      database: await this.scanDatabaseSchemas(),
      api: await this.scanAPIResponses(),
      existing: await this.scanExistingKeys()
    };

    const allKeys = this.mergeKeySources(sources);

    console.log('📊 Kết quả scan:');
    Object.entries(sources).forEach(([source, keys]) => {
      console.log(`  ${source}: ${Object.keys(keys).length} keys`);
    });

    return allKeys;
  }

  async scanJSXFiles() {
    console.log('🔍 Scan JSX/TSX files...');
    const keys = {};
    await this.initBabel();

    const files = this.getAllFiles(SRC_DIR, ['.js', '.jsx', '.ts', '.tsx']);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const namespace = this.chooseNamespace(file);

        // Parse file với Babel
        const ast = this.parse(content, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript']
        });

        // Traverse AST để tìm text cần dịch
        this.traverse(ast, {
          JSXText: (path) => {
            const text = path.node.value.trim();
            if (this.needsTranslation(text)) {
              const key = this.generateUniqueKey(namespace, text);
              keys[text] = {
                text,
                key,
                ns: namespace,
                source: 'jsx',
                file,
                type: 'JSXText'
              };
            }
          },

          StringLiteral: (path) => {
            // Chỉ scan string trong JSX attributes
            if (path.isJSXAttribute?.() ||
                (path.parent && path.parent.type === 'JSXAttribute')) {
              const text = path.node.value;
              if (this.needsTranslation(text)) {
                const key = this.generateUniqueKey(namespace, text);
                keys[text] = {
                  text,
                  key,
                  ns: namespace,
                  source: 'jsx',
                  file,
                  type: 'JSXAttribute'
                };
              }
            }
          },

          TemplateLiteral: (path) => {
            if (path.parent && path.parent.type === 'JSXAttribute' && path.node.expressions.length === 0) {
              const text = path.node.quasis[0].value.cooked?.trim();
              if (this.needsTranslation(text)) {
                const key = this.generateUniqueKey(namespace, text);
                keys[text] = {
                  text,
                  key,
                  ns: namespace,
                  source: 'jsx',
                  file,
                  type: 'JSXTemplate'
                };
              }
            }
          }
        });

      } catch (error) {
        console.warn(`⚠️ Lỗi scan file ${file}:`, error.message);
      }
    }

    return keys;
  }

  async scanDatabaseSchemas() {
    const keys = {};
    const sqlFiles = [
      path.join(__dirname, '../init.sql'),
      path.join(__dirname, '../migrations/*.sql')
    ];

    for (const sqlPattern of sqlFiles) {
      const files = sqlPattern.includes('*')
        ? this.globSync(sqlPattern)
        : [sqlPattern];

      for (const file of files) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          // Tìm các string trong SQL comments hoặc default values
          const matches = content.match(/'([^']*[À-Ỵà-ỹ][^']*)'/g) || [];
          matches.forEach(match => {
            const text = match.slice(1, -1);
            if (this.isVietnameseText(text) && text.length <= 120) {
              const ns = 'common'; // SQL content goes to common namespace
              const key = this.generateUniqueKey(ns, text);
              keys[text] = {
                text,
                key,
                ns,
                source: 'database',
                file
              };
            }
          });
        }
      }
    }
    return keys;
  }

  async scanAPIResponses() {
    const keys = {};
    const apiFiles = this.getAllFiles(API_DIR, ['.js']);

    for (const file of apiFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const ns = 'common'; // API messages go to common namespace

      // Tìm các response messages, error messages
      const patterns = [
        /res\.json\(\s*\{\s*[^}]*message\s*:\s*['"`]([^'"`]*[À-Ỵà-ỹ][^'"`]*)['"`]/g,
        /throw new Error\(['"`]([^'"`]*[À-Ỵà-ỹ][^'"`]*)['"`]\)/g,
        /['"`]([^'"`]*[À-Ỵà-ỹ][^'"`]*)['"`]\s*:\s*['"`]/g
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const text = match[1];
          if (this.isVietnameseText(text) && text.length <= 120) {
            const key = this.generateUniqueKey(ns, text);
            keys[text] = {
              text,
              key,
              ns,
              source: 'api',
              file
            };
          }
        }
      });
    }
    return keys;
  }

  async scanExistingKeys() {
    // Skip existing keys scan for enhanced mode since we're looking for NEW keys
    // The existing keys are already in the locales files
    console.log('ℹ️ Bỏ qua scan existing keys (chỉ tìm keys mới)');
    return {};
  }

  // ========== VALIDATION NÂNG CAO =========
  async validateTranslations() {
    console.log('🔍 Kiểm tra chất lượng bản dịch...');
    const report = {
      timestamp: new Date().toISOString(),
      errors: [],
      warnings: [],
      stats: {}
    };

    for (const targetLang of TARGET_LANGS) {
      const langErrors = await this.validateLanguage(SOURCE_LANG, targetLang);
      report.errors.push(...langErrors);
    }

    // Kiểm tra keys bị thiếu
    const missingKeys = await this.findMissingKeys();
    report.warnings.push(...missingKeys);

    // Kiểm tra ngôn ngữ bị lẫn
    const mixedLanguage = await this.findMixedLanguageContent();
    report.errors.push(...mixedLanguage);

    // Lưu báo cáo
    fs.writeFileSync(VALIDATION_REPORT, JSON.stringify(report, null, 2));

    console.log(`📋 Báo cáo validation: ${report.errors.length} lỗi, ${report.warnings.length} cảnh báo`);

    if (report.errors.length > 0) {
      console.log('❌ Một số lỗi nghiêm trọng:');
      report.errors.slice(0, 5).forEach(error => {
        console.log(`  - ${error.type}: ${error.message}`);
      });
    }

    return report;
  }

  async validateLanguage(sourceLang, targetLang) {
    const errors = [];
    const sourceDir = path.join(LOCALES_DIR, sourceLang);
    const targetDir = path.join(LOCALES_DIR, targetLang);

    if (!fs.existsSync(sourceDir) || !fs.existsSync(targetDir)) {
      return errors;
    }

    const sourceFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));

    for (const file of sourceFiles) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);

      if (!fs.existsSync(targetPath)) {
        errors.push({
          type: 'missing_file',
          message: `File ${file} thiếu trong ${targetLang}`,
          file: targetPath
        });
        continue;
      }

      const sourceContent = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      const targetContent = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

      this.flattenObject(sourceContent, '', (key, sourceValue) => {
        const targetValue = this.getNestedValue(targetContent, key);

        if (!targetValue) {
          errors.push({
            type: 'missing_key',
            message: `Key "${key}" thiếu bản dịch ${targetLang}`,
            file: targetPath,
            key
          });
        } else if (this.isLanguageMismatch(targetValue, targetLang)) {
          errors.push({
            type: 'language_mismatch',
            message: `Key "${key}" có ngôn ngữ sai: "${targetValue}"`,
            file: targetPath,
            key,
            value: targetValue
          });
        } else {
          const srcPlaceholders = this.extractPlaceholders(sourceValue);
          const tgtPlaceholders = this.extractPlaceholders(targetValue);
          const diff = srcPlaceholders.filter(p => !tgtPlaceholders.includes(p));
          if (diff.length) {
            errors.push({
              type: 'placeholder_mismatch',
              message: `Key "${key}" thiếu placeholder: ${diff.join(', ')}`,
              file: targetPath,
              key,
              value: targetValue
            });
          }
        }
      });
    }

    return errors;
  }

  async findMissingKeys() {
    const warnings = [];
    const allKeys = new Set();

    // Thu thập tất cả keys từ source language
    const sourceDir = path.join(LOCALES_DIR, SOURCE_LANG);
    if (fs.existsSync(sourceDir)) {
      const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const content = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
        this.flattenObject(content, '', (key) => allKeys.add(key));
      }
    }

    // Kiểm tra từng ngôn ngữ đích
    for (const targetLang of TARGET_LANGS) {
      const targetDir = path.join(LOCALES_DIR, targetLang);
      if (!fs.existsSync(targetDir)) continue;

      const targetKeys = new Set();
      const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const content = JSON.parse(fs.readFileSync(path.join(targetDir, file), 'utf8'));
        this.flattenObject(content, '', (key) => targetKeys.add(key));
      }

      // Tìm keys bị thiếu
      for (const key of allKeys) {
        if (!targetKeys.has(key)) {
          warnings.push({
            type: 'missing_translation',
            message: `Key "${key}" chưa có bản dịch ${targetLang}`,
            key,
            language: targetLang
          });
        }
      }
    }

    return warnings;
  }

  async findMixedLanguageContent() {
    const errors = [];

    for (const [lang, config] of Object.entries(LANGUAGES)) {
      const langDir = path.join(LOCALES_DIR, lang);
      if (!fs.existsSync(langDir)) continue;

      const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const filePath = path.join(langDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        this.flattenObject(content, '', (key, value) => {
          if (typeof value === 'string') {
            // Kiểm tra nếu là tiếng Việt nhưng có quá nhiều tiếng Anh
            if (lang === 'vi' || lang === 'vn') {
              const vietnameseChars = (value.match(LANGUAGES.vi.pattern) || []).length;
              const englishChars = (value.match(/[A-Za-z]/g) || []).length;
              if (englishChars > vietnameseChars && vietnameseChars > 0) {
                errors.push({
                  type: 'mixed_language',
                  message: `Nội dung ${lang} chứa quá nhiều tiếng Anh: "${value}"`,
                  file: filePath,
                  key,
                  value
                });
              }
            }
            // Kiểm tra nếu là tiếng Anh nhưng có ký tự Việt
            if (lang === 'en') {
              if (LANGUAGES.vi.pattern.test(value)) {
                errors.push({
                  type: 'mixed_language',
                  message: `Nội dung tiếng Anh chứa ký tự Việt: "${value}"`,
                  file: filePath,
                  key,
                  value
                });
              }
            }
          }
        });
      }
    }

    return errors;
  }

  // Khởi tạo Babel (lazy loading)
  async initBabel() {
    if (!this.parse) {
      // Import modules với named imports để tránh vấn đề ESM
      const { parse } = await import('@babel/parser');
      const { default: traverse } = await import('@babel/traverse');
      const { default: generate } = await import('@babel/generator');
      const t = await import('@babel/types');

      // Sử dụng parse từ @babel/parser thay vì @babel/core
      this.parse = parse;
      this.traverse = traverse;
      this.generate = generate;
      this.babelTypes = t.default || t;

      // Debug: kiểm tra các function đã được gán đúng chưa
      console.log('Functions loaded:', {
        parse: typeof this.parse,
        traverse: typeof this.traverse,
        generate: typeof this.generate,
        babelTypes: typeof this.babelTypes
      });

      // Nếu traverse vẫn là object, thử truy cập thuộc tính
      if (typeof this.traverse === 'object' && this.traverse !== null) {
        // Có thể traverse function nằm trong default của default
        if (this.traverse.default && typeof this.traverse.default === 'function') {
          this.traverse = this.traverse.default;
        }
      }

      // Nếu generate vẫn là object, thử truy cập thuộc tính
      if (typeof this.generate === 'object' && this.generate !== null) {
        if (this.generate.default && typeof this.generate.default === 'function') {
          this.generate = this.generate.default;
        }
      }
    }
  }

  // Kiểm tra chuỗi có phải tiếng Việt không
  isVietnamese(text) {
    if (!text || typeof text !== 'string') return false;
    if (text.trim().length === 0 || text.length > 120) return false;

    // Kiểm tra có ký tự tiếng Việt có dấu
    return /[À-Ỵà-ỹ]/.test(text);
  }

  // Alias cho compatibility
  isVietnameseText(text) {
    return this.isVietnamese(text);
  }

  // Enhanced: Kiểm tra chuỗi tiếng Anh cần dịch (hardcoded UI text)
  isEnglishUIText(text) {
    if (!text || typeof text !== 'string') return false;
    if (text.trim().length === 0 || text.length > 120) return false;

    // Bỏ qua các chuỗi technical/code
    if (/^[A-Za-z0-9._/-]+$/.test(text)) return false;
    if (/^https?:\/\//.test(text)) return false;
    if (/\.(jpg|jpeg|png|gif|svg|css|js|json)$/i.test(text)) return false;
    if (/^(application|image|text|audio|video)\//.test(text)) return false;

    // Các pattern tiếng Anh UI cần dịch
    const englishUIPatterns = [
      /^(Our|Loading|No |Browse|View|Sort|Search|Filter)/,
      /^(Add|Edit|Delete|Save|Cancel|Update|Create)/,
      /(Categories|Available|Books|News|About|Contact)/,
      /(Overview|Dashboard|Settings|Admin|Users)/,
      /\b(at the moment|wide range|available now)\b/,
      /^[A-Z][a-z\s]+[\.\!]?$/ // Sentences starting with capital letter
    ];

    return englishUIPatterns.some(pattern => pattern.test(text));
  }

  // Combined check for both Vietnamese and English UI text
  needsTranslation(text) {
    return this.isVietnamese(text) || this.isEnglishUIText(text);
  }

  // ========== HELPER METHODS ==========
  getAllFiles(dir, extensions) {
    if (!fs.existsSync(dir)) return [];

    const files = [];

    function scanDir(currentDir) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Bỏ qua một số thư mục
          if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
            scanDir(fullPath);
          }
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }

    scanDir(dir);
    return files;
  }

  // Thêm method globSync bị thiếu
  globSync(pattern) {
    // Simple glob implementation for *.sql patterns
    const basePath = pattern.replace(/\*\.[^/]*$/, ''); // Remove *.extension
    const extension = pattern.match(/\*\.([^/]*)$/)?.[1] || '';
    const dir = path.dirname(pattern);

    if (!fs.existsSync(dir)) return [];

    try {
      return fs.readdirSync(dir)
        .filter(file => extension ? file.endsWith(`.${extension}`) : true)
        .map(file => path.join(dir, file));
    } catch (error) {
      console.warn(`⚠️ Lỗi đọc thư mục ${dir}:`, error.message);
      return [];
    }
  }

  // ========== MERGE & FLATTEN HELPERS ==========
  mergeKeySources(sources) {
    const merged = {};
    for (const [source, keys] of Object.entries(sources)) {
      for (const [key, data] of Object.entries(keys)) {
        if (!merged[key]) {
          merged[key] = data;
        } else {
          // Ưu tiên nguồn existing, sau đó jsx, rồi api, cuối cùng database
          const priority = { existing: 4, jsx: 3, api: 2, database: 1 };
          if (priority[data.source] > priority[merged[key].source]) {
            merged[key] = data;
          }
        }
      }
    }
    return merged;
  }

  flattenObject(obj, prefix = '', callback) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.flattenObject(value, fullKey, callback);
      } else {
        callback(fullKey, value);
      }
    }
  }

  getNestedValue(obj, keyPath) {
    // Ensure keyPath is a string before splitting
    if (Array.isArray(keyPath)) {
      return keyPath.reduce((current, key) => current?.[key], obj);
    }

    if (typeof keyPath !== 'string') {
      console.warn(`⚠️ keyPath phải là string hoặc array, nhận được: ${typeof keyPath}`);
      return undefined;
    }

    return keyPath.split('.').reduce((current, key) => current?.[key], obj);
  }

  isLanguageMismatch(text, expectedLang) {
    if (!text || typeof text !== 'string') return false;

    const patterns = LANGUAGES[expectedLang]?.pattern;
    if (!patterns) return false;

    if (expectedLang === 'vi' || expectedLang === 'vn') {
      return !LANGUAGES.vi.pattern.test(text) && /[A-Za-z]{3,}/.test(text);
    } else if (expectedLang === 'en') {
      return LANGUAGES.vi.pattern.test(text);
    }

    return false;
  }

  extractPlaceholders(text) {
    if (!text || typeof text !== 'string') return [];
    const matches = text.match(/\{\{\s*[^\}]+\s*\}\}|%\w/g);
    return matches ? matches.sort() : [];
  }

  // Chọn namespace dựa trên đường dẫn file
  chooseNamespace(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath)).toLowerCase();
    const fullPath = filePath.toLowerCase();

    if (fileName.includes('navigation') || fullPath.includes('navigation')) return 'nav';
    if (fileName.includes('product') || fullPath.includes('product')) return 'product';
    if (fileName.includes('about') || fullPath.includes('about')) return 'about';
    if (fileName.includes('news') || fullPath.includes('news')) return 'news';
    if (fileName.includes('contact') || fullPath.includes('contact')) return 'contact';
    if (fileName.includes('home') || fullPath.includes('home')) return 'home';
    if (fileName.includes('banner') || fullPath.includes('banner')) return 'banner';

    return 'common';
  }

  // Chuyển đổi text tiếng Việt thành slug
  slugify(viText) {
    return viText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/[đĐ]/g, 'd') // Chuyển đ thành d
      .replace(/[^a-z0-9\s]/g, '') // Chỉ giữ chữ, số, space
      .trim()
      .replace(/\s+/g, '_') // Thay space bằng underscore
      .substring(0, 40); // Giới hạn 40 ký tự
  }

  // Tạo key duy nhất
  generateUniqueKey(namespace, viText) {
    const baseSlug = this.slugify(viText);
    const baseKey = `auto.${baseSlug}`;

    let finalKey = baseKey;
    let counter = 2;

    // Kiểm tra trùng lặp trong session hiện tại
    const countKey = `${namespace}.${baseKey}`;
    while (this.keyCounter.has(countKey + (counter > 2 ? `_${counter-1}` : ''))) {
      finalKey = `${baseKey}_${counter}`;
      counter++;
    }

    this.keyCounter.set(`${namespace}.${finalKey}`, true);
    return finalKey;
  }

  // Generate key helper
  generateKey(text, namespace) {
    const slug = this.slugify(text);
    const baseKey = slug.substring(0, 40);

    let finalKey = baseKey;
    let counter = 2;
    while (this.keyCounter.has(`${namespace}.auto.${finalKey}`)) {
      finalKey = `${baseKey}_${counter}`;
      counter++;
    }

    this.keyCounter.set(`${namespace}.auto.${finalKey}`, true);
    return finalKey;
  }

  // Đặt giá trị nested trong object
  setNested(obj, path, value) {
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

  setNestedValue(obj, keyPath, value) {
    const lastKey = keyPath.pop();
    const target = keyPath.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  // Đọc file JSON locale
  readLocaleFile(namespace) {
    const filePath = path.join(LOCALES_DIR, SOURCE_LANG, `${namespace}.json`);
    if (!fs.existsSync(filePath)) {
      return {};
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.warn(`⚠️  Lỗi đọc file ${filePath}:`, error.message);
      return {};
    }
  }

  // Ghi file JSON locale
  writeLocaleFile(namespace, data) {
    const dir = path.join(LOCALES_DIR, SOURCE_LANG);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${namespace}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  // ========== ENHANCED COMMANDS ==========
  async enhancedScan() {
    console.log('🔍 Enhanced scan từ nhiều nguồn...');

    // Tạo backup trước khi scan
    await this.createBackup();

    // Scan từ các nguồn khác nhau
    const allKeys = await this.scanMultipleSources();

    // Process và lưu các key mới
    await this.processNewKeys(allKeys);

    // Validate translation quality
    await this.validateTranslations();

    console.log('✅ Enhanced scan hoàn tất!');
    return allKeys;
  }

  async processNewKeys(keys) {
    console.log(`🔄 Xử lý ${Object.keys(keys).length} keys...`);

    const newKeysAdded = {};

    for (const [keyIdentifier, keyInfo] of Object.entries(keys)) {
      // Validate keyInfo structure - sửa logic validation
      if (!keyInfo || typeof keyInfo !== 'object') {
        console.warn(`⚠️ Bỏ qua key không hợp lệ (không phải object): ${keyIdentifier}`, keyInfo);
        continue;
      }

      // Xử lý các loại keyInfo khác nhau
      let text, ns, key, source;

      if (keyInfo.text && keyInfo.source) {
        // Format từ scan methods
        text = keyInfo.text;
        source = keyInfo.source;

        // Xác định namespace
        if (keyInfo.ns) {
          ns = keyInfo.ns;
        } else if (keyInfo.namespace) {
          ns = keyInfo.namespace;
        } else if (keyInfo.file) {
          ns = this.chooseNamespace(keyInfo.file);
        } else {
          ns = 'common';
        }

        // Xác định key
        if (keyInfo.key) {
          key = keyInfo.key;
        } else {
          // Generate key từ text
          key = this.generateUniqueKey(ns, text);
        }
      } else {
        // Skip invalid entries
        console.warn(`⚠️ Bỏ qua key không có text hoặc source: ${keyIdentifier}`, keyInfo);
        continue;
      }

      // Ensure key is a string
      if (typeof key !== 'string') {
        console.warn(`⚠️ Key phải là string, nhận được ${typeof key}: ${key}`);
        continue;
      }

      // Validate text
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        console.warn(`⚠️ Text không hợp lệ: ${text}`);
        continue;
      }

      const viFile = path.join(LOCALES_DIR, SOURCE_LANG, `${ns}.json`);

      // Đảm bảo thư mục tồn tại
      const viDir = path.dirname(viFile);
      if (!fs.existsSync(viDir)) {
        fs.mkdirSync(viDir, { recursive: true });
      }

      // Đọc hoặc tạo file JSON
      let viContent = {};
      if (fs.existsSync(viFile)) {
        try {
          viContent = JSON.parse(fs.readFileSync(viFile, 'utf-8'));
        } catch (error) {
          console.warn(`⚠️ Lỗi đọc file ${viFile}: ${error.message}`);
          viContent = {};
        }
      }

      // Thêm key mới nếu chưa tồn tại
      try {
        const keyPath = key.split('.');
        const existingValue = this.getNestedValue(viContent, keyPath);

        if (!existingValue) {
          // Create a copy of keyPath for setNestedValue since it modifies the array
          this.setNestedValue(viContent, [...keyPath], text);

          if (!newKeysAdded[ns]) newKeysAdded[ns] = 0;
          newKeysAdded[ns]++;

          // Lưu file
          fs.writeFileSync(viFile, JSON.stringify(viContent, null, 2), 'utf-8');

          console.log(`  + "${text}" → ${ns}.${key} (${source})`);
        } else {
          // Key đã tồn tại, bỏ qua
          // console.log(`  = "${text}" → ${ns}.${key} (đã tồn tại)`);
        }
      } catch (error) {
        console.warn(`⚠️ Lỗi xử lý key "${key}" cho text "${text}": ${error.message}`);
      }
    }

    // Gọi translate.js để dịch các key mới
    if (Object.keys(newKeysAdded).length > 0) {
      console.log('🌐 Đang dịch các key mới...');
      try {
        await this.translateNewKeys();
      } catch (error) {
        console.warn(`⚠️ Lỗi dịch keys: ${error.message}`);
      }
    }

    console.log('📊 Keys mới đã thêm:');
    Object.entries(newKeysAdded).forEach(([ns, count]) => {
      console.log(`  ${ns}: ${count} keys`);
    });

    if (Object.keys(newKeysAdded).length === 0) {
      console.log('  (Không có key mới nào được thêm)');
    }
  }

  async translateNewKeys() {
    return new Promise((resolve, reject) => {
      const translateScript = path.join(__dirname, 'translate.js');
      const child = spawn('node', [translateScript, 'translate'], {
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Translate script failed with code ${code}`));
        }
      });
    });
  }

  // ========== STANDARD SCAN & APPLY METHODS ==========

  // Quét tất cả file JS/JSX/TS/TSX trong src
  scanFiles() {
    const files = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];

    const walkDir = (dir) => {
      if (dir.includes('node_modules') || dir.includes('dist') || dir.includes('build')) {
        return;
      }

      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (extensions.includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      }
    };

    walkDir(SRC_DIR);
    return files;
  }

  // Quét một file để tìm chuỗi tiếng Việt
  async scanFile(filePath) {
    await this.initBabel();

    const code = fs.readFileSync(filePath, 'utf8');
    const viStrings = new Set();

    try {
      // Sử dụng parse từ @babel/parser thay vì parseSync từ @babel/core
      const ast = this.parse(code, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread'
        ]
      });

      this.traverse(ast, {
        // JSX Text nodes
        JSXText: (path) => {
          const text = path.node.value.trim();
          if (this.needsTranslation(text)) {
            viStrings.add(text);
          }
        },

        // String Literals (avoid import/export keys)
        StringLiteral: (path) => {
          // Skip if part of import/export
          if (this.babelTypes.isImportDeclaration(path.parent) || this.babelTypes.isExportDeclaration(path.parent)) return;
          // Skip object property keys
          if (this.babelTypes.isObjectProperty(path.parent) && path.parent.key === path.node) return;
          // Skip className, id, data-* attributes
          if (this.babelTypes.isJSXAttribute(path.parent) && ['className', 'id'].includes(path.parent.name?.name)) return;
          if (this.babelTypes.isJSXAttribute(path.parent) && path.parent.name?.name?.startsWith('data-')) return;

          const text = path.node.value.trim();
          if (this.needsTranslation(text)) {
            viStrings.add(text);
          }
        },

        // Template Literals (static only)
        TemplateLiteral: (path) => {
          // Only process static template literals (no expressions)
          if (path.node.expressions.length === 0 && path.node.quasis.length === 1) {
            const text = path.node.quasis[0].value.cooked?.trim();
            if (this.needsTranslation(text)) {
              viStrings.add(text);
            }
          }
        }

        // Removed JSXAttribute scanning to avoid errors during apply
      });
    } catch (error) {
      console.warn(`⚠️  Lỗi parse file ${filePath}:`, error.message);
      return [];
    }

    return Array.from(viStrings);
  }

  // Chạy script dịch
  async runTranslateScript() {
    return new Promise((resolve, reject) => {
      console.log('🔄 Đang chạy script dịch...');

      const child = spawn('node', ['scripts/translate.js', 'translate'], {
        stdio: 'inherit',
        cwd: path.dirname(__dirname)
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Script dịch hoàn thành');
          resolve();
        } else {
          reject(new Error(`Script dịch thất bại với code: ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  // Chế độ scan: quét và tạo key
  async scan() {
    console.log('🔍 Bắt đầu quét file để tìm chuỗi cần dịch...\n');

    const files = this.scanFiles();
    const mapping = {};
    const stats = { totalStrings: 0, totalKeys: 0, fileCount: 0 };

    for (const filePath of files) {
      const foundStrings = await this.scanFile(filePath);
      if (foundStrings.length === 0) continue;

      stats.fileCount++;
      stats.totalStrings += foundStrings.length;

      const namespace = this.chooseNamespace(filePath);
      const localeData = this.readLocaleFile(namespace);
      const fileMapping = {};

      console.log(`📝 ${path.relative(process.cwd(), filePath)} (${namespace}):`)

      for (const foundText of foundStrings) {
        const key = this.generateUniqueKey(namespace, foundText);

        // Xác định ngôn ngữ source và target value
        let sourceValue, needsTranslationToVi = false;

        if (this.isVietnamese(foundText)) {
          // Chuỗi tiếng Việt -> lưu trực tiếp
          sourceValue = foundText;
          console.log(`  + "${foundText}" → ${key} (VI)`);
        } else if (this.isEnglishUIText(foundText)) {
          // Chuỗi tiếng Anh -> cần dịch sang tiếng Việt
          sourceValue = foundText; // Tạm thời lưu tiếng Anh, sẽ dịch sau
          needsTranslationToVi = true;
          console.log(`  + "${foundText}" → ${key} (EN→VI cần dịch)`);
        }

        // Thêm vào locale file
        this.setNested(localeData, key, sourceValue);

        // Lưu mapping với flag cần dịch
        fileMapping[foundText] = {
          ns: namespace,
          key,
          needsTranslationToVi
        };
        stats.totalKeys++;
      }

      // Ghi file locale
      this.writeLocaleFile(namespace, localeData);

      // Lưu mapping cho file này
      mapping[filePath] = fileMapping;
    }

    // Lưu mapping file
    fs.writeFileSync(MAP_FILE, JSON.stringify(mapping, null, 2));

    // Chạy script dịch từ EN->VI trước, sau đó VI->EN
    if (stats.totalKeys > 0) {
      try {
        await this.translateEnglishToVietnamese(mapping);
        await this.runTranslateScript(); // Dịch từ VI sang EN như bình thường
      } catch (error) {
        console.error('❌ Lỗi chạy script dịch:', error.message);
      }
    }

    // Báo cáo
    console.log('\n📊 Báo cáo quét:');
    console.log(`  📁 Files đã quét: ${stats.fileCount}`);
    console.log(`  📝 Chuỗi tìm thấy: ${stats.totalStrings}`);
    console.log(`  🔑 Keys đã tạo: ${stats.totalKeys}`);
    console.log(`  💾 Mapping lưu tại: ${path.relative(process.cwd(), MAP_FILE)}`);
  }

  // Áp dụng thay đổi vào code
  async apply() {
    console.log('🔧 Bắt đầu áp dụng thay đổi vào code...');

    await this.initBabel();

    if (!fs.existsSync(MAP_FILE)) {
      console.error('❌ Không tìm thấy file mapping. Chạy scan trước!');
      console.log(`📍 Tìm kiếm file: ${MAP_FILE}`);
      return;
    }

    console.log(`📍 Đọc mapping từ: ${MAP_FILE}`);
    const mapping = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    const stats = { filesModified: 0, hooksAdded: 0 };

    const totalFiles = Object.keys(mapping).length;
    console.log(`📊 Tổng số files cần xử lý: ${totalFiles}`);

    for (const [filePath, fileMapping] of Object.entries(mapping)) {
      console.log(`\n📝 Xử lý file: ${path.relative(process.cwd(), filePath)}`);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File không tồn tại: ${filePath}`);
        continue;
      }

      const totalStrings = Object.keys(fileMapping).length;
      console.log(`   📋 Số chuỗi cần thay: ${totalStrings}`);

      // Debug: show strings to transform
      Object.keys(fileMapping).forEach((text, index) => {
        console.log(`   ${index + 1}. "${text}" → ${fileMapping[text].key}`);
      });

      const result = await this.transformFile(filePath, fileMapping);

      if (result.modified) {
        fs.writeFileSync(filePath, result.code);
        stats.filesModified++;

        console.log(`✅ ${path.relative(process.cwd(), filePath)} - MODIFIED`);
        if (result.hookAdded) {
          console.log(`  📦 Đã thêm useTranslation hook`);
          stats.hooksAdded++;
        }
      } else {
        console.log(`⚪ ${path.relative(process.cwd(), filePath)} - NO CHANGES`);
      }
    }

    console.log('\n📊 Báo cáo áp dụng:');
    console.log(`  📁 Files đã sửa: ${stats.filesModified}`);
    console.log(`  📦 Hooks đã thêm: ${stats.hooksAdded}`);

    if (stats.filesModified === 0) {
      console.log('\n💡 Lý do có thể không có thay đổi:');
      console.log('  - Chuỗi đã được transform rồi');
      console.log('  - Chuỗi nằm trong context không an toàn để transform');
      console.log('  - File đã có useTranslation hook');
    }
  }

  // Transform một file
  async transformFile(filePath, fileMapping) {
    const code = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let hookAdded = false;

    // Lấy namespace chủ đạo của file này
    const namespaces = [...new Set(Object.values(fileMapping).map(m => m.ns))];
    const primaryNs = namespaces[0]; // Dùng namespace đầu tiên

    try {
      const ast = this.parse(code, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'objectRestSpread'
        ]
      });

      let hasUseTranslationImport = false;
      let hasTranslationHook = false;
      let lastImportPath = null;

      // Helper: kiểm tra xem node có nằm trong JSX context không
      const isInJSXContext = (path) => {
        let current = path;
        while (current && current.parent) {
          const parentType = current.parent.type;

          // JSXText context - luôn cần JSXExpressionContainer
          if (parentType === 'JSXElement' && current.key === 'children') {
            return true;
          }
          if (parentType === 'JSXFragment' && current.key === 'children') {
            return true;
          }

          // JSXAttribute value - luôn cần JSXExpressionContainer
          if (parentType === 'JSXAttribute' && current.key === 'value') {
            return true;
          }

          current = current.parentPath;
        }
        return false;
      };

      // Helper: kiểm tra context phức tạp hơn để tránh lỗi
      const canSafelyTransform = (path) => {
        const parent = path.parent;
        const parentType = parent?.type;

        // Kiểm tra xem có phải trong JSX context không
        const inJSX = isInJSXContext(path);

        // Skip các context có thể gây lỗi
        if (parentType === 'LogicalExpression' ||
            parentType === 'ConditionalExpression' ||
            parentType === 'BinaryExpression') {
          // Với LogicalExpression trong JSX, chúng ta cần kiểm tra kỹ hơn
          if (parentType === 'LogicalExpression' && inJSX) {
            // Nếu string literal này là right operand của || expression trong JSX
            // thì có thể transform an toàn
            if (parent.operator === '||' && parent.right === path.node) {
              return true;
            }
            // Nếu là left operand, cũng có thể transform nhưng cẩn thận hơn
            if (parent.operator === '||' && parent.left === path.node) {
              return true;
            }
          }
          // Các context khác trong JSX cũng có thể transform
          return inJSX;
        }

        // Skip object keys
        if (parentType === 'ObjectProperty' && parent.key === path.node) {
          return false;
        }

        return true;
      };

      // Helper: tạo safe replacement - IMPROVED LOGIC
      const createSafeReplacement = (key, path) => {
        const tCall = this.babelTypes.callExpression(
          this.babelTypes.identifier('t'),
          [this.babelTypes.stringLiteral(key)]
        );

        const inJSX = isInJSXContext(path);
        const parent = path.parent;
        const parentType = parent?.type;

        // Xử lý đặc biệt cho LogicalExpression trong JSX
        if (parentType === 'LogicalExpression' && inJSX) {
          // Với LogicalExpression, chúng ta không wrap trong JSXExpressionContainer
          // vì parent LogicalExpression đã sẽ được wrap
          return tCall;
        }

        // Chỉ wrap trong JSXExpressionContainer khi thực sự cần và an toàn
        if (inJSX) {
          return this.babelTypes.jsxExpressionContainer(tCall);
        } else {
          return tCall;
        }
      };

      // Helper: kiểm tra xem giá trị có phải utility class/URL/MIME/SVG không
      const shouldSkipValue = (text) => {
        if (!text || text.length > 120) return true;

        // Bỏ qua Tailwind/utility classes
        const tokens = text.split(/\s+/);
        if (tokens.length > 1) {
          const utilityTokens = tokens.filter(token =>
            /^(bg-|text-|flex|grid|gap-|p-|m-|w-|h-|md:|lg:|xl:|hover:|focus:|border-|rounded-|shadow-|opacity-|transform|transition)/.test(token)
          );
          if (utilityTokens.length === tokens.length) return true;
        }

        // Bỏ qua URL/path
        if (/^(https?:\/\/|\.\/|\.\.|\/[a-zA-Z])/.test(text)) return true;

        // Bỏ qua MIME types
        if (/^(application|image|text|audio|video)\//.test(text)) return true;

        // Bỏ qua SVG paths
        if (/^[Mm]\s*[\d.-]+/.test(text)) return true;

        // Bỏ qua các string technical thuần
        if (/^[a-zA-Z0-9_.-]+$/.test(text) && !this.needsTranslation(text)) return true;

        return false;
      };

      // Kiểm tra import và hook hiện tại
      this.traverse(ast, {
        ImportDeclaration: (path) => {
          lastImportPath = path;
          if (path.node.source.value === 'react-i18next') {
            const useTranslationImport = path.node.specifiers.find(
              spec => spec.imported && spec.imported.name === 'useTranslation'
            );
            if (useTranslationImport) {
              hasUseTranslationImport = true;
            }
          }
        },

        VariableDeclarator: (path) => {
          if (path.node.id.type === 'ObjectPattern' &&
              path.node.init &&
              path.node.init.type === 'CallExpression' &&
              path.node.init.callee.name === 'useTranslation') {
            hasTranslationHook = true;
          }
        }
      });

      // Transform chuỗi - SAFER APPROACH
      this.traverse(ast, {
        JSXText: (path) => {
          const text = path.node.value.trim();
          if (fileMapping[text] && !shouldSkipValue(text)) {
            const { key } = fileMapping[text];

            try {
              const replacement = createSafeReplacement(key, path);
              path.replaceWith(replacement);
              modified = true;
              console.log(`✅ JSXText: "${text}" -> ${key}`);
            } catch (error) {
              console.warn(`⚠️ Skip JSXText transform for: "${text}" - ${error.message}`);
            }
          }
        },

        StringLiteral: (path) => {
          // Skip if part of import/export
          if (this.babelTypes.isImportDeclaration(path.parent) ||
              this.babelTypes.isExportDeclaration(path.parent)) return;

          // Skip object property keys
          if (this.babelTypes.isObjectProperty(path.parent) &&
              path.parent.key === path.node) return;

          // Skip utility attributes
          if (this.babelTypes.isJSXAttribute(path.parent)) {
            const attrName = path.parent.name?.name;
            if (['className', 'id', 'key', 'role', 'href', 'to', 'src', 'alt'].includes(attrName)) return;
            if (attrName?.startsWith('data-')) return;
          }

          const text = path.node.value.trim();

          if (fileMapping[text] && !shouldSkipValue(text) && canSafelyTransform(path)) {
            const { key } = fileMapping[text];

            try {
              const replacement = createSafeReplacement(key, path);
              path.replaceWith(replacement);
              modified = true;
              console.log(`✅ StringLiteral: "${text}" -> ${key}`);
            } catch (error) {
              console.warn(`⚠️ Skip StringLiteral transform for: "${text}" - ${error.message}`);
            }
          }
        },

        TemplateLiteral: (path) => {
          if (path.node.expressions.length === 0 && path.node.quasis.length === 1) {
            const text = path.node.quasis[0].value.cooked?.trim();
            if (fileMapping[text] && !shouldSkipValue(text) && canSafelyTransform(path)) {
              const { key } = fileMapping[text];

              try {
                const replacement = createSafeReplacement(key, path);
                path.replaceWith(replacement);
                modified = true;
                console.log(`✅ TemplateLiteral: "${text}" -> ${key}`);
              } catch (error) {
                console.warn(`⚠️ Skip TemplateLiteral transform for: "${text}" - ${error.message}`);
              }
            }
          }
        }
      });

      // Thêm import nếu thiếu
      if (modified && !hasUseTranslationImport && lastImportPath) {
        try {
          const importDeclaration = this.babelTypes.importDeclaration(
            [this.babelTypes.importSpecifier(
              this.babelTypes.identifier('useTranslation'),
              this.babelTypes.identifier('useTranslation')
            )],
            this.babelTypes.stringLiteral('react-i18next')
          );
          lastImportPath.insertAfter(importDeclaration);
          console.log('✅ Added useTranslation import');
        } catch (error) {
          console.warn('⚠️ Skip adding import');
        }
      }

      // Thêm hook nếu thiếu
      if (modified && !hasTranslationHook) {
        try {
          this.traverse(ast, {
            FunctionDeclaration: (path) => {
              if (path.node.id && path.node.id.name &&
                  path.node.id.name[0].toUpperCase() === path.node.id.name[0]) {
                this.addTranslationHook(path, primaryNs);
                hookAdded = true;
                console.log(`✅ Added hook to function: ${path.node.id.name}`);
                return false; // Stop traversal
              }
            },

            ArrowFunctionExpression: (path) => {
              if (path.parent.type === 'VariableDeclarator' &&
                  path.parent.id.name &&
                  path.parent.id.name[0].toUpperCase() === path.parent.id.name[0]) {
                this.addTranslationHook(path, primaryNs);
                hookAdded = true;
                console.log(`✅ Added hook to component: ${path.parent.id.name}`);
                return false; // Stop traversal
              }
            }
          });
        } catch (error) {
          console.warn('⚠️ Skip adding hook:', error.message);
        }
      }

      const result = this.generate(ast, {}, code);
      return {
        code: result.code,
        modified,
        hookAdded
      };

    } catch (error) {
      console.error(`❌ Lỗi transform file ${filePath}:`, error.message);
      return { code, modified: false, hookAdded: false };
    }
  }

  // Thêm translation hook vào component
  addTranslationHook(path, namespace) {
    // Tạo hook statement bằng cách thủ công thay vì dùng template
    const hookStatement = this.babelTypes.variableDeclaration('const', [
      this.babelTypes.variableDeclarator(
        this.babelTypes.objectPattern([
          this.babelTypes.objectProperty(
            this.babelTypes.identifier('t'),
            this.babelTypes.identifier('t')
          )
        ]),
        this.babelTypes.callExpression(
          this.babelTypes.identifier('useTranslation'),
          [this.babelTypes.stringLiteral(namespace)]
        )
      )
    ]);

    if (path.node.body && path.node.body.type === 'BlockStatement') {
      // Function component
      path.node.body.body.unshift(hookStatement);
    } else if (path.parent.type === 'VariableDeclarator') {
      // Arrow function component - thêm vào block statement
      if (path.node.body.type !== 'BlockStatement') {
        // Convert expression to block statement
        const returnStatement = this.babelTypes.returnStatement(path.node.body);
        path.node.body = this.babelTypes.blockStatement([hookStatement, returnStatement]);
      } else {
        path.node.body.body.unshift(hookStatement);
      }
    }
  }

  // Dịch chuỗi tiếng Anh sang tiếng Việt
  async translateEnglishToVietnamese(mapping) {
    console.log('🔄 Bắt đầu dịch chuỗi tiếng Anh sang tiếng Việt...\n');

    for (const [filePath, fileMapping] of Object.entries(mapping)) {
      for (const [originalText, mappingData] of Object.entries(fileMapping)) {
        if (mappingData.needsTranslationToVi) {
          const namespace = mappingData.ns;
          const key = mappingData.key;

          console.log(`🌐 Dịch "${originalText}" sang tiếng Việt...`);

          try {
            const translatedText = await this.translateText(originalText, 'en', 'vi');
            console.log(`✅ "${originalText}" → "${translatedText}"`);

            // Cập nhật file JSON tiếng Việt
            const localeData = this.readLocaleFile(namespace);
            this.setNested(localeData, key, translatedText);
            this.writeLocaleFile(namespace, localeData);

          } catch (error) {
            console.warn(`⚠️ Không thể dịch "${originalText}": ${error.message}`);
            // Giữ nguyên text tiếng Anh nếu dịch thất bại
          }
        }
      }
    }

    console.log('✅ Hoàn thành dịch tiếng Anh sang tiếng Việt\n');
  }
}

// ========== CLI INTERFACE ==========
const args = process.argv.slice(2);
const command = args[0];
const subCommand = args[1];

async function main() {
  const manager = new AutoI18nManager();

  try {
    switch (command) {
      case 'scan':
        if (subCommand === 'enhanced') {
          await manager.enhancedScan();
        } else {
          await manager.scan();
        }
        break;

      case 'apply':
        await manager.apply();
        break;

      case 'validate':
        await manager.validateTranslations();
        break;

      case 'fix-quality':
        await manager.fixTranslationQuality();
        break;

      case 'backup':
        await manager.createBackup();
        break;

      case 'restore':
        const timestamp = args[1];
        if (!timestamp) {
          console.error('❌ Cần cung cấp timestamp backup');
          console.log('Sử dụng: node scripts/autokey.js restore <timestamp>');
          process.exit(1);
        }
        await manager.rollback(timestamp);
        break;

      case 'list-backups':
        await manager.listBackups();
        break;

      default:
        console.log(`
🚀 Enhanced Auto I18n Tool

Các lệnh cơ bản:
  scan                 - Quét và tạo key (chế độ thông thường)
  scan enhanced        - Quét nâng cao từ nhiều nguồn (JSX, API, DB)
  apply               - Áp dụng thay đổi vào code
  
Quản lý chất lượng:
  validate            - Kiểm tra chất lượng bản dịch
  fix-quality         - Sửa chữa bản dịch có vấn đề
  
Backup & Rollback:
  backup              - Tạo backup locales hiện tại
  restore <timestamp> - Khôi phục từ backup
  list-backups        - Liệt kê các backup có sẵn

Ví dụ:
  node scripts/autokey.js scan enhanced
  node scripts/autokey.js validate
  node scripts/autokey.js restore 2025-01-13T10-30-00-000Z
  node scripts/autokey.js fix-quality

Tính năng mới:
  ✅ Scan từ nhiều nguồn (JSX, API routes, Database schemas)
  ✅ Validation bản dịch tự động
  ✅ Backup & Rollback an toàn
  ✅ Sửa chữa bản dịch có vấn đề
  ✅ Mở rộng đa ngôn ngữ dễ dàng
`);
        break;
    }
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();