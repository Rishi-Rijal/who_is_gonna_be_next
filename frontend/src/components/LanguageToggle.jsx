import React from 'react';

function LanguageToggle({ lang, setLang }) {
  return (
    <div className="lang-wrap">
      <button
        className={lang === 'en' ? 'lang-active' : ''}
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <button
        className={lang === 'np' ? 'lang-active' : ''}
        onClick={() => setLang('np')}
      >
        नेपाली
      </button>
    </div>
  );
}

export default LanguageToggle;