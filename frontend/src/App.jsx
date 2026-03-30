import React, { useState } from 'react';
import Header from './components/Header';
import CandidateCard from './components/CandidateCard'; // ← ADD THIS
import LanguageToggle from './components/LanguageToggle';
import Admin from './components/Admin';
import dataInitial from './data/dummyData';
import './styles/App.css';

function App() {
  const [lang, setLang] = useState('en');
  const [votes, setVotes] = useState({});
  const [page, setPage] = useState('home');
  const [data, setData] = useState(dataInitial);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleVote = (id) => {
    setVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  return (
    <div className="app-container">
      <LanguageToggle lang={lang} setLang={setLang} />
      <Header lang={lang} />

      <div className="page-toggle">
        <button onClick={() => setPage('home')}>{lang === 'en' ? 'Home' : 'मुख्य पृष्ठ'}</button>
        <button onClick={() => setPage('admin')}>{lang === 'en' ? 'Admin' : 'व्यवस्थापक'}</button>
      </div>

      {page === 'home' &&
        <div className="candidates-container">
          {data.map(person => (
            <CandidateCard
              key={person.id}
              person={person}
              lang={lang}
              onVote={handleVote}
              votes={votes[person.id] || 0}
            />
          ))}
        </div>
      }

      {page === 'admin' &&
        <Admin setIsAdmin={setIsAdmin} setData={setData} data={data} />
      }
    </div>
  );
}

export default App;