'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function MerchantPage() {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', storeName: '', email: 'priya@soundvision.in', password: 'nearmatch-demo' });
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [pin, setPin] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');
  const [edits, setEdits] = useState({});

  useEffect(() => {
    const saved = sessionStorage.getItem('nearmatchMerchant');
    if (saved) setSession(JSON.parse(saved));
  }, []);

  const headers = () => (session ? { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` } : { 'Content-Type': 'application/json' });

  const loadInventory = async (sess = session) => {
    if (!sess) return;
    const r = await fetch('/api/merchant/inventory', { headers: { Authorization: `Bearer ${sess.token}` } });
    if (r.status === 401) {
      setSession(null);
      sessionStorage.removeItem('nearmatchMerchant');
      return;
    }
    setInventory(await r.json());
  };

  const loadCatalog = async (sess = session) => {
    if (!sess) return;
    const r = await fetch('/api/merchant/catalog', { headers: { Authorization: `Bearer ${sess.token}` } });
    if (r.ok) setCatalog(await r.json());
  };

  useEffect(() => {
    if (session) {
      loadInventory(session);
      loadCatalog(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const login = async () => {
    setError('');
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password }) });
    const data = await r.json();
    if (!r.ok) return setError(data.error);
    setSession(data);
    sessionStorage.setItem('nearmatchMerchant', JSON.stringify(data));
  };

  const register = async () => {
    setError('');
    const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, storeName: form.storeName, email: form.email, password: form.password }) });
    const data = await r.json();
    if (!r.ok) return setError(data.error);
    setSession(data);
    sessionStorage.setItem('nearmatchMerchant', JSON.stringify(data));
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', headers: headers() });
    setSession(null);
    sessionStorage.removeItem('nearmatchMerchant');
  };

  const redeem = async () => {
    const r = await fetch('/api/redeem', { method: 'POST', headers: headers(), body: JSON.stringify({ pin }) });
    const data = await r.json();
    setRedeemMsg(data.message ? `✓ ${data.message} ${data.claim?.product || ''}` : `⚠ ${data.error}`);
  };

  const savePrice = async (productId) => {
    const edit = edits[productId] || {};
    const row = inventory.find((i) => i.productId === productId);
    const price = edit.price ?? row?.price;
    const stock = edit.stock ?? row?.stock;
    const r = await fetch('/api/merchant/price', { method: 'PUT', headers: headers(), body: JSON.stringify({ productId, storeId: session.merchant.storeId, price, stock }) });
    const data = await r.json();
    if (!r.ok) return setRedeemMsg(`⚠ ${data.error}`);
    setRedeemMsg(`✓ Saved ${row?.product}: ${money(price)}`);
    loadInventory();
  };

  const publish = async (productId, price) => {
    const r = await fetch('/api/merchant/catalog', { method: 'POST', headers: headers(), body: JSON.stringify({ productId, price, stock: 'In stock' }) });
    const data = await r.json();
    setRedeemMsg(r.ok ? `✓ ${data.message}` : `⚠ ${data.error}`);
    loadInventory();
    loadCatalog();
  };

  if (!session) {
    return (
      <main className="dashboard" style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>
        <div className="dash-nav"><Link className="logo" href="/"><span>n</span> NearMatch <small>for stores</small></Link><Link href="/">← Shopper view</Link></div>
        <section className="panel" style={{ marginTop: 24 }}>
          <div className="panel-title"><h3>{mode === 'login' ? 'Welcome back.' : 'Bring your store online.'}</h3></div>
          {mode === 'register' && (
            <>
              <label>Your name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Priya Shah" /></label>
              <label>Store name<input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} placeholder="Sound & Vision" /></label>
            </>
          )}
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@store.com" /></label>
          <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" /></label>
          {mode === 'login' ? (
            <button className="primary" onClick={login}>Sign in to dashboard →</button>
          ) : (
            <button className="primary" onClick={register}>Create store account →</button>
          )}
          <small className="demo-login">Demo: priya@soundvision.in · nearmatch-demo</small>
          {error && <div className="toast">⚠ {error}</div>}
          <p className="auth-switch">{mode === 'login' ? (<>New store? <button onClick={() => setMode('register')}>Create a merchant account</button></>) : (<>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></>)}</p>
        </section>
      </main>
    );
  }

  return (
    <main id="merchantView">
      <section className="dashboard">
        <div className="dash-nav">
          <a className="logo"><span>n</span> NearMatch <small>for stores</small></a>
          <div><button onClick={logout}>Sign out</button><Link href="/"><button>← Shopper view</button></Link></div>
        </div>
        <div className="dash-title">
          <div><span className="eyebrow">{session.merchant.storeName?.toUpperCase()}</span><h2>Good evening, {session.merchant.name?.split(' ')[0]}.</h2><p>Here’s what happened at your store today.</p></div>
          <button className="primary" onClick={() => document.querySelector('#inventoryPanel')?.scrollIntoView({ behavior: 'smooth' })}>+ Update prices</button>
        </div>
        <div className="merchant-grid">
          <section className="panel">
            <div className="panel-title"><h3>Verify a customer deal</h3><span>At checkout</span></div>
            <p>Enter the 4-digit NearMatch PIN shown by your customer.</p>
            <div className="pin-form">
              <input value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" maxLength={4} placeholder="0000" />
              <button onClick={redeem}>Verify deal</button>
            </div>
            {redeemMsg && <div className="toast">{redeemMsg}</div>}
          </section>
          <section className="panel">
            <div className="panel-title"><h3>Publish from catalog</h3><span>{catalog.filter((c) => !c.listed).length} unlisted</span></div>
            {catalog.filter((c) => !c.listed).slice(0, 5).map((c) => (
              <div className="demand" key={c.productId}><b>{c.product}</b><span>{c.brand} · {c.category}</span><button onClick={() => publish(c.productId, 999)}>List product →</button></div>
            ))}
            {!catalog.filter((c) => !c.listed).length && <p>Everything is listed. 🎉</p>}
          </section>
        </div>
        <section className="panel inventory-panel" id="inventoryPanel">
          <div className="panel-title"><div><h3>Your live counter prices</h3><span>Changes show to nearby shoppers immediately</span></div><button onClick={() => loadInventory()}>↻ Refresh</button></div>
          <div className="inventory-list">
            {inventory.map((item) => (
              <div className="inventory-item" key={item.productId}>
                <div className="inventory-name"><span>{item.image}</span><div><b>{item.product}</b><small>{item.brand}</small></div></div>
                <input type="number" min={1} value={edits[item.productId]?.price ?? item.price} onChange={(e) => setEdits({ ...edits, [item.productId]: { ...edits[item.productId], price: e.target.value } })} aria-label={`Price for ${item.product}`} />
                <select value={edits[item.productId]?.stock ?? item.stock} onChange={(e) => setEdits({ ...edits, [item.productId]: { ...edits[item.productId], stock: e.target.value } })}>
                  <option>In stock</option><option>Only 2 left</option><option>Out of stock</option>
                </select>
                <button onClick={() => savePrice(item.productId)}>Save changes</button>
              </div>
            ))}
            {!inventory.length && <p>Loading your products…</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
