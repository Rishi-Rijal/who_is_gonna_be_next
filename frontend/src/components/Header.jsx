import React from 'react';

function Header({ lang }) {
  return (
    <header className="site-header">
      <div className="header-kicker">
        <span className="header-kicker-dot" />
        {lang === 'en' ? 'Nepal · Public Verdict' : 'नेपाल · जनमत'}
      </div>

      <h1 className="header-title">
        {lang === 'en' ? (
          <>WHO GETS<br /><span className="accent">ARRESTED</span> NEXT?</>
        ) : (
          <>अर्को कसलाई<br /><span className="accent">पक्राउ</span> गर्ने?</>
        )}
      </h1>

      <p className="header-sub">
        {lang === 'en'
          ? 'Cast your vote on which politician deserves justice next.'
          : 'कुन नेतालाई न्याय मिल्नु पर्छ? आफ्नो मत दिनुस्।'}
      </p>

      <div className="header-rule" />
    </header>
  );
}

export default Header;