'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [form, setForm] = useState({ email: 'owner@nearmatch.app', password: 'owner-demo' });
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('nearmatchAdmin');
    if (saved) {
      setToken(saved);
      loadStats(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async (t) => {
    const s = await fetch('/api/admin/summary', { headers: { Authorization: `Bearer ${t}` } });
    if (s.status === 401) {
      setToken(null);
      sessionStorage.removeItem('nearmatchAdmin');
      return;
    }
    setStats(await s.json());
  };

  const login = async () => {
    setError('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await r.json();
    if (!r.ok) return setError(data.error);
    setToken(data.token);
    sessionStorage.setItem('nearmatchAdmin', data.token);
    await loadStats(data.token);
  };

  const logout = () => {
    setToken(null);
    setStats(null);
    sessionStorage.removeItem('nearmatchAdmin');
  };

  return (
    <main id="adminView">
      <section className="dashboard">
        <div className="dash-nav">
          <a className="logo"><span>n</span> NearMatch <small>owner</small></a>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/">← Shopper view</Link>
            {token && <button onClick={logout} style={{ background: 'none', color: '#b3261e', fontWeight: 700 }}>Sign out</button>}
          </div>
        </div>
        {!token ? (
          <section className="panel" style={{ maxWidth: 480 }}>
            <span className="eyebrow">NEARMATCH OWNER</span><h2>Your earnings.</h2>
            <p>Private platform performance dashboard.</p>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
            <button className="primary" onClick={login}>Open owner dashboard →</button>
            <small className="demo-login">Demo: owner@nearmatch.app · owner-demo</small>
            {error && <div className="toast">⚠ {error}</div>}
          </section>
        ) : (
          <>
            <div className="dash-title"><div><span className="eyebrow">PRIVATE OWNER DASHBOARD</span><h2>Your NearMatch earnings.</h2><p>Platform fees from verified local footfall.</p></div><button className="filter" onClick={() => loadStats(token)}>↻ Refresh</button></div>
            {stats ? (
              <>
                <div className="stats">
                  <div><small>Total earnings</small><b>₹{stats.totalEarnings?.toLocaleString('en-IN')}</b><span>₹{stats.platformFee} per verified deal</span></div>
                  <div><small>Redeemed deals</small><b>{stats.redeemedDeals}</b><span>Completed footfall</span></div>
                  <div><small>Active claims</small><b>{stats.activeClaims}</b><span>Waiting for redemption</span></div>
                  <div><small>Merchant partners</small><b>{stats.merchants?.length}</b><span>Generating demand</span></div>
                </div>
                <section className="panel inventory-panel">
                  <div className="panel-title"><h3>Earnings by merchant</h3><span>₹{stats.platformFee} per redeemed deal</span></div>
                  <div className="inventory-list">
                    {stats.merchants?.length ? stats.merchants.map((m, i) => (
                      <div className="saved-deal" key={i}><b>{m.merchant}</b><span>{m.deals} redeemed deals</span><strong>₹{m.earnings}</strong></div>
                    )) : <p style={{ color: 'var(--muted)' }}>No redeemed deals yet. Your first verified PIN will appear here.</p>}
                  </div>
                </section>
              </>
            ) : <p style={{ color: 'var(--muted)' }}>Loading…</p>}
          </>
        )}
      </section>
    </main>
  );
}