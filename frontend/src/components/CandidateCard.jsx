import React from 'react';

function CandidateCard({ person, lang, onVote, votes }) {
  const totalVotes = 10; // total votes for percentage calculation
  const percentage = Math.round((votes / totalVotes) * 100);

  return (
    <div className="card">
      {/* Image */}
      <div className="card-image">
        <img
          src={person.photo}
          alt={person.name}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/160'; }} 
          // fallback if image fails to load
        />
      </div>

      {/* Card Content */}
      <div className="card-content">
        <h2 className="name">{person.name}</h2>

        <p className="party">
          <strong>{lang === 'en' ? 'Party' : 'दल'}:</strong> {person.party}
        </p>

        <p className="accused">
          <strong>{lang === 'en' ? 'Accused of' : 'आरोप'}:</strong> {person.accused}
        </p>

        {/* Progress bar */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <p className="percentage">{percentage}%</p>

        {/* Vote Button */}
        <button className="vote-btn" onClick={() => onVote(person.id)}>
          {lang === 'en' ? 'Vote' : 'भोट'}
        </button>
      </div>
    </div>
  );
}

export default CandidateCard;