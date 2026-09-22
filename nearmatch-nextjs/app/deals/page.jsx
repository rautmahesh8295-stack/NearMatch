'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    setDeals(JSON.parse(localStorage.getItem('nearmatchDeals') || '[]'));
  }, []);

  const copyPin = async (pin) => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(pin);
      setTimeout(() => setCopied(''), 1600);
    } catch {}
  };

  return (
    <main className="deals-page">
      <section className="dashboard" style={{ maxWidth: 760 }}>
        <div className="dash-nav">
          <a className="logo" href="/"><span>n</span> NearMatch <small>your deals</small></a>
          <Link href="/">← Back to shopping</Link>
        </div>
        <div className="dash-title">
          <div><span className="eyebrow">PRICE LOCKED DEALS</span><h2>Your claimed prices.</h2><p>Show the 4-digit PIN at the store checkout within 1 hour of claiming.</p></div>
        </div>

        {!deals.length ? (
          <section className="panel">
            <p>No claimed prices yet.</p>
            <p>Find a product on <Link href="/" style={{ color: 'var(--green)', fontWeight: 700 }}>the shopper page</Link>, compare nearby stores, and tap <b>Claim price</b> — your PIN will appear here.</p>
          </section>
        ) : (
          deals.map((d, i) => (
            <div className="saved-deal" key={i}>
              <div>
                <b>{d.product}</b><br />
                <span>{d.store} · {d.area || ''} · {money(d.price)}{d.status ? ` · ${d.status}` : ''}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: 20, letterSpacing: 4 }}>{d.pin}</strong><br />
                <button
                  onClick={() => copyPin(d.pin)}
                  style={{ background: 'var(--green)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, marginTop: 6 }}
                >
                  {copied === d.pin ? 'Copied ✓' : 'Copy PIN'}
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}