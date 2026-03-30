import React, { useState } from 'react';
import Header from './components/Header';
import CandidateCard from './components/CandidateCard';
import LanguageToggle from './components/LanguageToggle';
import Admin from './components/Admin';
import dataInitial from './data/dummyData';
import './styles/App.css';

function App() {
  const [lang, setLang] = useState('en');
  const [votes, setVotes] = useState({});
  const [voted, setVoted] = useState(null);   // id of candidate I voted for
  const [page, setPage] = useState('home');
  const [data, setData] = useState(dataInitial);
  const [isAdmin, setIsAdmin] = useState(false);

  /* ── Derived ── */
  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  const sortedIds = [...data]
    .sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0))
    .map(c => c.id);
  const getRank = (id) => sortedIds.indexOf(id) + 1;

  /* ── Handlers ── */
  const handleVote = (id) => {
    if (voted) return;
    setVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setVoted(id);
  };

  /* ── Stats ── */
  const STATS = [
    { num: totalVotes, en: 'Total Votes', np: 'कुल मत' },
    { num: data.length, en: 'Candidates', np: 'उम्मेदवार' },
    { num: voted ? '✓' : '—', en: 'Your Vote', np: 'तपाईंको मत' },
  ];

  const NAV = [
    { key: 'home', en: 'Candidates', np: 'उम्मेदवार' },
    { key: 'admin', en: 'Admin', np: 'एडमिन' },
  ];

  return (
    <div className="app-shell">

      {/* Language toggle sits inside header via position:absolute */}
      <LanguageToggle lang={lang} setLang={setLang} />

      <Header lang={lang} />

      {/* Stats bar */}
      <div style={{ padding: '0 28px' }}>
        <div className="stats-bar">
          {STATS.map((s, i) => (
            <div className="stat-cell" key={i}>
              <div className="stat-number">{s.num}</div>
              <div className="stat-label">{lang === 'np' ? s.np : s.en}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Page nav */}
      <div className="page-nav">
        {NAV.map(n => (
          <button
            key={n.key}
            className={page === n.key ? 'nav-active' : ''}
            onClick={() => setPage(n.key)}
          >
            {lang === 'np' ? n.np : n.en}
          </button>
        ))}
      </div>

      {/* ── Home page ── */}
      {page === 'home' && (
        <div className="candidates-grid">
          {data.map(person => (
            <CandidateCard
              key={person.id}
              person={person}
              lang={lang}
              onVote={handleVote}
              votes={votes[person.id] || 0}
              totalVotes={totalVotes}
              rank={getRank(person.id)}
              hasVoted={!!voted}
              isMyVote={voted === person.id}
            />
          ))}
        </div>
      )}

      {/* ── Admin page ── */}
      {page === 'admin' && (
        <Admin
          setIsAdmin={setIsAdmin}
          setData={setData}
          data={data}
          votes={votes}
          totalVotes={totalVotes}
          lang={lang}
        />
      )}
    </div>
  );
}

export default App;