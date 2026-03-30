import React from 'react';

function CandidateCard({ person, lang, onVote, votes, totalVotes, rank, hasVoted, isMyVote }) {
  const t = (val) => {
    if (!val) return '';
    return typeof val === 'object' ? (val[lang] || val.en || '') : val;
  };

  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

  return (
    <div className={`c-card${isMyVote ? ' c-card--voted' : ''}`}>

      {/* Rank badge — only show once someone has voted */}
      {totalVotes > 0 && (
        <div className={`c-rank${rank === 1 ? ' c-rank--first' : ''}`}>
          {rank === 1 ? '🏆 Leading' : `#${rank}`}
        </div>
      )}

      {/* Photo */}
      <div className="c-photo">
        <img
          src={person.photo || person.image}
          alt={t(person.name)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://i.pravatar.cc/400?img=${(person.id % 70) + 1}`;
          }}
        />
        <div className="c-symbol">{person.symbol || '🗳️'}</div>
      </div>

      {/* Body */}
      <div className="c-body">
        <div className="c-name">{t(person.name)}</div>
        <span className="c-party-tag">{t(person.party)}</span>

        <div className="c-accused">
          {t(person.accused)}
        </div>

        {/* Progress */}
        <div className="c-prog-row">
          <span>{lang === 'en' ? 'Vote share' : 'मत हिस्सा'}</span>
          <span className="c-prog-pct">{pct}%</span>
        </div>
        <div className="c-prog-track">
          <div className="c-prog-fill" style={{ width: `${pct}%` }} />
        </div>

        {/* Vote button */}
        <button
          className={`c-vote-btn${isMyVote ? ' c-vote-btn--voted' : ''}`}
          onClick={() => !hasVoted && onVote(person.id)}
          disabled={hasVoted && !isMyVote}
        >
          {isMyVote
            ? (lang === 'en' ? '✓ Voted' : '✓ मत दियो')
            : (lang === 'en' ? 'Cast Vote' : 'मत दिनुस्')}
        </button>
      </div>
    </div>
  );
}

export default CandidateCard;