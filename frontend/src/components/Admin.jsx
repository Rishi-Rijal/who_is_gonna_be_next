import React, { useState } from 'react';

const ADMIN_PASSWORD = 'admin123';

function Admin({ setIsAdmin, setData, data, votes, totalVotes, lang }) {
  const [password, setPassword]   = useState('');
  const [verified, setVerified]   = useState(false);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'manage' | 'add'

  const [form, setForm] = useState({
    name: '', party: '', accused: '', photo: '', symbol: ''
  });

  const t = (en, np) => lang === 'np' ? np : en;

  /* ── Auth ── */
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setVerified(true);
      setIsAdmin(true);
      setError('');
    } else {
      setError(t('Incorrect password. Try again.', 'गलत पासवर्ड। पुनः प्रयास गर्नुस्।'));
    }
  };

  /* ── Add ── */
  const handleAdd = () => {
    if (!form.name.trim() || !form.party.trim()) {
      alert(t('Name & Party are required.', 'नाम र पार्टी आवश्यक छ।'));
      return;
    }
    const newCandidate = {
      id: Date.now(),
      name:    { en: form.name,    np: form.name },
      party:   { en: form.party,   np: form.party },
      accused: { en: form.accused || 'No charges', np: form.accused || 'कुनै आरोप छैन' },
      photo:   form.photo || `https://i.pravatar.cc/400?img=${Math.floor(Math.random() * 70) + 1}`,
      symbol:  form.symbol || '🗳️',
    };
    setData(prev => [...prev, newCandidate]);
    setForm({ name: '', party: '', accused: '', photo: '', symbol: '' });
  };

  /* ── Delete ── */
  const handleDelete = (id) => {
    if (window.confirm(t('Delete this candidate?', 'यो उम्मेदवार हटाउने?'))) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  const tVal = (val) => {
    if (!val) return '';
    return typeof val === 'object' ? (val[lang] || val.en || '') : val;
  };

  const sortedByVotes = [...data].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  /* ── Login screen ── */
  if (!verified) {
    return (
      <div className="admin-shell">
        <div className="admin-login">
          <div className="admin-login-icon">🔐</div>
          <h2>{t('Admin Access', 'एडमिन पहुँच')}</h2>
          <p>{t('Enter the admin password to continue.', 'जारी राख्न एडमिन पासवर्ड प्रविष्ट गर्नुस्।')}</p>
          <div className="admin-login-row">
            <input
              type="password"
              placeholder={t('Password', 'पासवर्ड')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button className="btn-login" onClick={handleLogin}>
              {t('Login', 'लग इन')}
            </button>
          </div>
          {error && <p className="admin-error">{error}</p>}
        </div>
      </div>
    );
  }

  /* ── Tabs ── */
  const TABS = [
    { key: 'results', en: '📊 Results', np: '📊 नतिजा' },
    { key: 'manage',  en: '👥 Manage',  np: '👥 व्यवस्थापन' },
    { key: 'add',     en: '➕ Add',     np: '➕ थप्नुस्' },
  ];

  return (
    <div className="admin-shell">

      {/* Tab nav */}
      <div className="page-nav" style={{ paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'nav-active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {lang === 'np' ? tab.np : tab.en}
          </button>
        ))}
      </div>

      {/* ── Results tab ── */}
      {activeTab === 'results' && (
        <div className="admin-panel">
          <div className="panel-heading">
            {t('Live Results', 'लाइभ नतिजा')}
          </div>
          {totalVotes === 0 ? (
            <p className="results-empty">
              {t('No votes have been cast yet.', 'अहिलेसम्म कुनै मत खसेको छैन।')}
            </p>
          ) : (
            <div className="results-list">
              {sortedByVotes.map(c => {
                const v   = votes[c.id] || 0;
                const pct = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0;
                return (
                  <div className="result-row" key={c.id}>
                    <img
                      className="result-avatar"
                      src={c.photo || c.image}
                      alt={tVal(c.name)}
                      onError={(e) => { e.target.src = `https://i.pravatar.cc/100?img=${(c.id % 70) + 1}`; }}
                    />
                    <div className="result-meta">
                      <div className="result-name">{tVal(c.name)}</div>
                      <div className="result-party-small">{tVal(c.party)}</div>
                      <div className="result-bar-track">
                        <div className="result-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="result-count">{v}</div>
                      <div className="result-pct">{pct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Manage tab ── */}
      {activeTab === 'manage' && (
        <div className="admin-panel">
          <div className="panel-heading">
            {t('Manage Candidates', 'उम्मेदवार व्यवस्थापन')}
          </div>
          <div className="existing-list">
            {data.map(item => (
              <div className="existing-row" key={item.id}>
                <img
                  className="existing-avatar"
                  src={item.photo || item.image}
                  alt={tVal(item.name)}
                  onError={(e) => { e.target.src = `https://i.pravatar.cc/80?img=${(item.id % 70) + 1}`; }}
                />
                <div className="existing-info">
                  <div className="existing-name">{tVal(item.name)}</div>
                  <div className="existing-party-sm">{tVal(item.party)}</div>
                </div>
                <button className="btn-delete" onClick={() => handleDelete(item.id)}>
                  {t('Delete', 'हटाउनुस्')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add tab ── */}
      {activeTab === 'add' && (
        <div className="admin-panel">
          <div className="panel-heading">
            {t('Add Candidate', 'उम्मेदवार थप्नुस्')}
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label>{t('Full Name *', 'पूरा नाम *')}</label>
              <input
                placeholder={t('e.g. Pushpa Dahal', 'जस्तै: पुष्प दाहाल')}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>{t('Party *', 'पार्टी *')}</label>
              <input
                placeholder={t('e.g. CPN-MC', 'जस्तै: नेकपा माओवादी')}
                value={form.party}
                onChange={e => setForm({ ...form, party: e.target.value })}
              />
            </div>
            <div className="form-field field-full">
              <label>{t('Accusation', 'आरोप')}</label>
              <input
                placeholder={t('What are they accused of?', 'उनी माथि के आरोप छ?')}
                value={form.accused}
                onChange={e => setForm({ ...form, accused: e.target.value })}
              />
            </div>
            <div className="form-field field-full">
              <label>{t('Photo URL', 'फोटो URL')}</label>
              <input
                placeholder={t('https://... (leave blank for auto)', 'https://... (खाली छोड्नुस् स्वतः)')}
                value={form.photo}
                onChange={e => setForm({ ...form, photo: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>{t('Emoji Symbol', 'प्रतीक (Emoji)')}</label>
              <input
                placeholder="🗳️"
                value={form.symbol}
                onChange={e => setForm({ ...form, symbol: e.target.value })}
              />
            </div>
          </div>
          <button className="btn-add" onClick={handleAdd}>
            {t('+ Add Candidate', '+ उम्मेदवार थप्नुस्')}
          </button>
        </div>
      )}

    </div>
  );
}

export default Admin;