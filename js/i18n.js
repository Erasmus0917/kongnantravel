// 語言切換核心模組（支援繁體中文、簡體中文、英文）
let currentLang = 'en';
let translations = {};

// 語言設定
const langConfig = {
    'zh-TW': {
        file: 'locales/zh-TW.js',
        varName: 'zhTW',
        label: '中文',
        flag: '🇹🇼'
    },
    'zh-CN': {
        file: 'locales/zh-CN.js',
        varName: 'zhCN',
        label: '简体',
        flag: '🇨🇳'
    },
    'en': {
        file: 'locales/en.js',
        varName: 'en',
        label: 'English',
        flag: '🇬🇧'
    }
};

// ✅ 新增：從 URL 路徑偵測語系
function detectLanguageFromURL() {
    const path = window.location.pathname;
    // 如果路徑是 /zh/ 或 /zh/index.html，使用繁體中文
    if (path.includes('/zh/')) {
        return 'zh-TW';
    }
    // 預設英文
    return 'en';
}

// 載入語系檔案（使用動態 script 方式）
function loadLanguage(lang) {
    return new Promise((resolve, reject) => {
        const config = langConfig[lang];
        if (!config) {
            reject(new Error('不支援的語言'));
            return;
        }

        // 移除已存在的同類型 script
        const existingScript = document.querySelector(`script[data-lang="${lang}"]`);
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = config.file;
        script.dataset.lang = lang;
        script.onload = () => {
            translations = window[config.varName];
            resolve(translations);
        };
        script.onerror = () => {
            console.error(`載入語系 ${lang} 失敗`);
            reject(new Error(`載入語系 ${lang} 失敗`));
        };
        document.head.appendChild(script);
    });
}

// ✅ 修改：根據當前語系決定是否套用翻譯
function updatePageLanguage() {
    if (currentLang === 'en') {
        restoreDefaultLanguage();
    } else {
        applyTranslations();
    }
    updateLanguageButtonText();
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh';
}

// 套用翻譯
function applyTranslations() {
    if (!translations) return;

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key] !== undefined) {
            element.textContent = translations[key];
        }
    });

    // 更新頁面標題
    if (translations['page_title']) {
        document.title = translations['page_title'];
    }
}

// 更新下拉選單顯示文字
function updateLanguageButtonText() {
    const currentLangText = document.getElementById('current-lang-text');
    const mobileCurrentLangText = document.getElementById('mobile-current-lang-text');
    const label = langConfig[currentLang]?.label || 'English';
    if (currentLangText) currentLangText.textContent = label;
    if (mobileCurrentLangText) mobileCurrentLangText.textContent = label;
}

// 恢復預設語言（英文）
function restoreDefaultLanguage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        if (element.hasAttribute('data-original')) {
            element.textContent = element.getAttribute('data-original');
        }
    });
    document.title = 'KONG NAN INTERNATIONAL TRAVEL COMPANY LIMITED - Luxury Alphard Custom Charter Service';
}

// 關閉所有下拉選單
function closeDropdowns() {
    const dropdownMenu = document.getElementById('lang-dropdown-menu');
    const mobileDropdownMenu = document.getElementById('mobile-lang-dropdown-menu');
    if (dropdownMenu) dropdownMenu.classList.add('hidden');
    if (mobileDropdownMenu) mobileDropdownMenu.classList.add('hidden');
}

// ✅ 修改：切換語言時同時改變 URL
async function setLanguage(lang) {
    if (lang === currentLang) return;

    // 如果是切換到英文，導向根目錄
    if (lang === 'en') {
        window.location.href = 'https://www.kongnantravel.com/';
        return;
    }
    
    // 切換到繁體中文，導向 /zh/
    if (lang === 'zh-TW') {
        window.location.href = 'https://www.kongnantravel.com/zh/';
        return;
    }
    
    // 簡體中文暫不獨立頁面，仍用 JS 切換
    if (lang === 'zh-CN') {
        const loader = document.getElementById('lang-loader');
        if (loader) loader.style.display = 'inline-block';
        
        try {
            if (!translations || currentLang !== lang) {
                await loadLanguage(lang);
            }
            currentLang = lang;
            applyTranslations();
            updateLanguageButtonText();
            localStorage.setItem('preferred_language', currentLang);
        } catch (error) {
            console.error('切換語言失敗:', error);
        } finally {
            if (loader) loader.style.display = 'none';
            closeDropdowns();
        }
    }
}

// 儲存原始內容（初始化時備份所有 data-i18n 元素的原始文字）
function storeOriginalContent() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        if (!element.hasAttribute('data-original')) {
            element.setAttribute('data-original', element.textContent);
        }
    });
}

// 綁定事件
function bindEvents() {
    // 桌面版下拉選單
    const dropdownBtn = document.getElementById('lang-dropdown-btn');
    const dropdownMenu = document.getElementById('lang-dropdown-menu');
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });
    }

    // 手機版下拉選單
    const mobileDropdownBtn = document.getElementById('mobile-lang-dropdown-btn');
    const mobileDropdownMenu = document.getElementById('mobile-lang-dropdown-menu');
    if (mobileDropdownBtn && mobileDropdownMenu) {
        mobileDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileDropdownMenu.classList.toggle('hidden');
        });
    }

    // 語言選項
    document.querySelectorAll('.lang-option, .mobile-lang-option').forEach(option => {
        option.addEventListener('click', async (e) => {
            e.stopPropagation();
            const lang = option.getAttribute('data-lang');
            await setLanguage(lang);
        });
    });

    // 點擊外部關閉
    document.addEventListener('click', (e) => {
        if (dropdownBtn && !dropdownBtn.contains(e.target) && dropdownMenu && !dropdownMenu.classList.contains('hidden')) {
            dropdownMenu.classList.add('hidden');
        }
        if (mobileDropdownBtn && !mobileDropdownBtn.contains(e.target) && mobileDropdownMenu && !mobileDropdownMenu.classList.contains('hidden')) {
            mobileDropdownMenu.classList.add('hidden');
        }
    });

    // 手機選單按鈕
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    }
}

// ✅ 修改：初始化時根據 URL 設定語系
async function init() {
    storeOriginalContent();
    bindEvents();

    // 根據 URL 路徑決定語系
    const urlLang = detectLanguageFromURL();
    
    if (urlLang === 'zh-TW') {
        currentLang = 'zh-TW';
        await loadLanguage('zh-TW');
        applyTranslations();
    } else {
        currentLang = 'en';
        // 英文版不需要載入翻譯
    }
    
    updateLanguageButtonText();
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh';
}

// 啟動
init();