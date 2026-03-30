import React from 'react'

function LanguageToggle({ lang, setLang }) {
  return (
    <div style={{ textAlign: 'center', margin: '10px' }}>
      <button onClick={() => setLang('en')} disabled={lang==='en'}>English</button>
      <button onClick={() => setLang('np')} disabled={lang==='np'}>नेपाली</button>
    </div>
  )
}

export default LanguageToggle