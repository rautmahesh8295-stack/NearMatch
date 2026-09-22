'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const money = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function ShopperPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState('⌖ Use my location');
  const [showFilters, setShowFilters] = useState(false);
  const [radius, setRadius] = useState(5);
  const [sort, setSort] = useState('price');
  const [stockOnly, setStockOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(
    async (q = '') => {
      try {
        let endpoint = `/api/products?q=${encodeURIComponent(q)}`;
        if (location) endpoint += `&lat=${location.lat}&lng=${location.lng}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        setProducts(await res.json());
        setError('');
      } catch (e) {
        setError(`${e.message}. Refresh the page and try again.`);
      }
    },
    [location]
  );

  useEffect(() => {
    fetchProducts(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    fetchProducts('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = () => fetchProducts(query);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setModal({ title: 'Location unavailable', body: 'Your browser does not support location access.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLabel('⌖ Using your location');
      },
      () => {
        setLocationLabel('⌖ Location unavailable');
        setModal({ title: 'Location access needed', body: 'Allow location access in your browser to sort stores by real distance.' });
      }
    );
  };

  const visible = products
    .map((p) => ({
      ...p,
      stores: p.stores.filter((s) => s.distance <= radius && (!stockOnly || s.stock !== 'Out of stock') && (!openOnly || s.openNow !== false)),
    }))
    .filter((p) => p.stores.length)
    .sort((a, b) => {
      const ap = Math.min(...a.stores.map((s) => s.price));
      const bp = Math.min(...b.stores.map((s) => s.price));
      const ad = Math.min(...a.stores.map((s) => s.distance));
      const bd = Math.min(...b.stores.map((s) => s.distance));
      return sort === 'distance' ? ad - bd : ap - bp;
    });

  const openOffers = (id) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setModal({
      title: p.name,
      eyebrow: `${p.category?.toUpperCase()} · ONLINE ${money(p.online)}`,
      offers: [...p.stores].sort((a, b) => a.price - b.price),
      product: p,
    });
  };

  const claim = async (productId, storeId) => {
    const r = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, storeId }),
    });
    const c = await r.json();
    if (c.pin) {
      const deals = JSON.parse(localStorage.getItem('nearmatchDeals') || '[]');
      deals.unshift(c);
      localStorage.setItem('nearmatchDeals', JSON.stringify(deals.slice(0, 20)));
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('NearMatch price locked', { body: `${c.product} · PIN ${c.pin}` });
      }
      if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    }
    setModal({ deal: c });
  };

  const copyPin = async (pin) => {
    try {
      await navigator.clipboard.writeText(pin);
    } catch {}
  };

  const shareDeal = async (pin) => {
    const text = `My NearMatch deal PIN is ${pin}.`;
    if (navigator.share) await navigator.share({ title: 'NearMatch deal', text });
    else copyPin(text);
  };

  return (
    <>
      <header>
        <a className="logo" href="#"><span>n</span> NearMatch</a>
        <nav><a href="#how">How it works</a><a href="#merchants">For stores</a></nav>
        <button className="location" onClick={useMyLocation}>{locationLabel}</button>
        <Link className="deals-button" href="/deals" style={{ textDecoration: 'none' }}>My deals</Link>
        <Link className="merchant" href="/merchant" style={{ textDecoration: 'none' }}>Merchant login →</Link>
        <Link className="deals-button" href="/admin" style={{ textDecoration: 'none' }}>Owner</Link>
      </header>

      <main id="shopper">
        <section className="hero">
          <div className="eyebrow">● LIVE PRICES FROM NEARBY STORES</div>
          <h1>Find it nearby.<br /><i>Pay less.</i></h1>
          <p>Compare real counter prices and stock at local stores before you step out.</p>
          <div className="search">
            <span>⌕</span>
            <input
              id="search"
              placeholder="Search products, brands, or categories"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <button onClick={search}>Search</button>
          </div>
          <div className="quick">Popular:{' '}
            <button onClick={() => { setQuery('Samsung'); fetchProducts('Samsung'); }}>Samsung phones</button>
            <button onClick={() => { setQuery('AirPods'); fetchProducts('AirPods'); }}>AirPods</button>
            <button onClick={() => { setQuery('speakers'); fetchProducts('speakers'); }}>Bluetooth speakers</button>
          </div>
        </section>

        <section className="trust">
          <div>✦ <b>Verified counter rates</b><small>Updated by stores</small></div>
          <div>◉ <b>Live stock visibility</b><small>Know before you go</small></div>
          <div>⌁ <b>Price lock for 1 hour</b><small>No surprises at checkout</small></div>
        </section>

        <section className="results" id="results">
          <div className="results-head">
            <div><span className="eyebrow">NEAR YOU</span><h2>Popular around Koramangala</h2></div>
            <button className="filter" onClick={() => setShowFilters((v) => !v)}>☷ Filters</button>
          </div>
          {showFilters && (
            <div className="filter-panel">
              <label>Within{' '}
                <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
                  <option value={5}>5 km</option>
                  <option value={3}>3 km</option>
                  <option value={1}>1 km</option>
                </select>
              </label>
              <label>Sort by{' '}
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="price">Lowest price</option>
                  <option value="distance">Nearest store</option>
                </select>
              </label>
              <label className="check"><input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} /> In stock only</label>
              <label className="check"><input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} /> Open now</label>
            </div>
          )}
          <div id="products" className="products">
            {error && <div className="empty-results"><b>Could not load products</b><p>{error}</p></div>}
            {!error && !visible.length && <div className="empty-results"><b>No nearby matches yet</b><p>Try widening your radius or turning off “In stock only.”</p></div>}
            {visible.map((p) => {
              const best = [...p.stores].sort((a, b) => a.price - b.price)[0];
              return (
                <article className="product" key={p.id}>
                  <div className="product-icon">{p.image}</div>
                  <div style={{ width: '100%' }}>
                    <p>{p.brand} · {p.category}</p>
                    <h3>{p.name}</h3>
                    <p>From {best.name} · {best.distance} km away</p>
                    <div className="price-row">
                      <div><small>BEST LOCAL PRICE</small><br /><b>{money(best.price)}</b> <small>Save {money(p.online - best.price)}</small></div>
                      <button onClick={() => openOffers(p.id)}>Compare {p.stores.length} stores →</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="how" className="how">
          <div><span className="eyebrow">HOW NEARMATCH WORKS</span><h2>Less hunting.<br />More buying.</h2></div>
          <div className="steps">
            <article><em>01</em><h3>Search nearby</h3><p>Find the exact product at shops around you, with real counter prices.</p></article>
            <article><em>02</em><h3>Lock the rate</h3><p>Claim your price and get a one-hour digital pass.</p></article>
            <article><em>03</em><h3>Walk in &amp; save</h3><p>Show your 4-digit PIN at checkout. That’s it.</p></article>
          </div>
        </section>

        <section id="merchants" className="merchant-banner">
          <div>
            <span className="eyebrow">FOR LOCAL STORES</span>
            <h2>Your next customer<br />is already nearby.</h2>
            <p>List free. Update prices in seconds. Pay only when a locked deal is redeemed.</p>
            <Link href="/merchant"><button>See merchant dashboard →</button></Link>
          </div>
          <div className="phone">
            <div className="phone-top">‹ <b>NearMatch for Stores</b> ☰</div>
            <p>Good morning, <b>Sound &amp; Vision</b> 👋</p>
            <div className="mini-card"><small>PRICE UPDATE REMINDER</small><b>Sony SRS-XB100</b><strong>₹3,199</strong><button>Update price</button></div>
            <small>Updated 2 mins ago · via WhatsApp</small>
          </div>
        </section>
      </main>

      <footer style={{
          borderTop: '1px solid var(--line)', background: '#fbfbf8',
          padding: '30px max(8vw, 40px)', display: 'flex', flexWrap: 'wrap', gap: 20,
          alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)',
        }}>
          <a className="logo" href="#" style={{ fontSize: 18 }}><span style={{ width: 24, height: 24, fontSize: 19 }}>n</span> NearMatch</a>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link href="/deals" style={{ textDecoration: 'none', fontWeight: 600 }}>My deals</Link>
            <Link href="/merchant" style={{ textDecoration: 'none', fontWeight: 600 }}>For stores</Link>
            <Link href="/admin" style={{ textDecoration: 'none', fontWeight: 600 }}>Owner</Link>
          </div>
          <small>Verified counter rates. Live stock. Price locked for 1 hour.</small>
        </footer>

        {modal && (
        <div className="modal" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setModal(null)}>×</button>
            {modal.deal && (
              <div className="deal">
                <div className="eyebrow">YOUR PRICE IS LOCKED</div>
                <h2>Show this PIN at checkout</h2>
                <div className="pin">{modal.deal.pin || '—'}</div>
                <p>{modal.deal.error || (<><b>{modal.deal.store}</b><br />{modal.deal.product}<br /><strong>{modal.deal.price != null && money(modal.deal.price)}</strong></>)}</p>
                {modal.deal.pin && (
                  <>
                    <div className="valid">✓ Valid for 1 hour · Bring this screen to the store</div>
                    <button className="copy-pin" onClick={() => copyPin(modal.deal.pin)}>Copy PIN</button>{' '}
                    <button className="share-deal" onClick={() => shareDeal(modal.deal.pin)}>Share deal</button>
                  </>
                )}
              </div>
            )}
            {modal.offers && (
              <>
                <p className="eyebrow">{modal.eyebrow}</p>
                <h2>{modal.title}</h2>
                <div className="offer">
                  {modal.offers.map((s) => (
                    <div className="store-row" key={s.storeId || s.id}>
                      <div><b>{s.name}</b><br /><small>★ {s.rating} · {s.area} · {s.distance} km · {s.walk}</small><br /><small style={{ color: '#39754c' }}>● {s.stock}</small><br /><a className="directions" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' ' + s.area)}`} target="_blank" rel="noopener">Directions ↗</a></div>
                      <div style={{ textAlign: 'right' }}><strong>{money(s.price)}</strong><br /><small>Save {money(modal.product.online - s.price)}</small><br /><button className="claim" onClick={() => claim(modal.product.id, s.storeId || s.id)}>Claim price</button></div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {modal.title && !modal.offers && !modal.deal && (
              <><h2>{modal.title}</h2><p>{modal.body}</p></>
            )}
          </div>
        </div>
      )}
    </>
  );
}
