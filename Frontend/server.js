const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const publicDir = path.join(__dirname, 'public');
const envCandidates = [path.join(__dirname, '.env'), path.join(__dirname, '.env', '.env')];
const envFile = envCandidates.find(file => fs.existsSync(file) && fs.statSync(file).isFile());
if (envFile) fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(line => { const match=line.match(/^([A-Z0-9_]+)=(.*)$/); if (match && !process.env[match[1]]) process.env[match[1]]=match[2].trim(); });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseRequest = async (resource, options={}) => { if (!supabaseUrl || !supabaseAnonKey) return null; const headers={apikey:supabaseAnonKey,Authorization:`Bearer ${options.token || supabaseAnonKey}`,'Content-Type':'application/json',Prefer:options.prefer || 'return=representation'}; const response = await fetch(`${supabaseUrl}/rest/v1/${resource}`, {method:options.method || 'GET',headers,body:options.body ? JSON.stringify(options.body) : undefined}); if (!response.ok) throw new Error(`Supabase returned ${response.status}`); return response.status===204 ? [] : response.json(); };
const supabaseAuth = async (path, payload) => { if (!supabaseUrl || !supabaseAnonKey) return null; const response=await fetch(`${supabaseUrl}/auth/v1/${path}`,{method:'POST',headers:{apikey:supabaseAnonKey,'Content-Type':'application/json'},body:JSON.stringify(payload)}); const data=await response.json(); return response.ok ? data : null; };
const supabaseCatalog = async () => {
  const remote = await supabaseRequest('products?select=sku,brand,name,category,image,online_price,listings(store_id,price,stock,updated_at)&order=brand,name');
  if (!remote?.length) return null;
  const mapped=remote.map(item => { const local = inventory.find(product => product.brand === item.brand && product.name === item.name); const remoteStores=(item.listings||[]).map(listing=>({id:listing.store_id,name:'NearMatch store',area:'Nearby',distance:0.5,price:listing.price,stock:listing.stock,rating:5,walk:'6 min',updatedAt:listing.updated_at})); return {id:local?.id || item.sku, brand:item.brand, name:item.name, category:item.category, image:item.image || '🛍️', online:item.online_price, stores:remoteStores.length ? remoteStores : (local?.stores || [])}; }); const names=new Set(mapped.map(item=>item.name)); return [...mapped,...inventory.filter(item=>!names.has(item.name))];
};
const inventory = [
  { id:'sony-xb100', brand:'Sony', name:'SRS-XB100 Portable Bluetooth Speaker', category:'Audio', image:'🔊', online:3790, stores:[
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:3199,stock:'In stock',rating:4.8,walk:'5 min'},
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:3299,stock:'Only 2 left',rating:4.5,walk:'11 min'},
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:3399,stock:'In stock',rating:4.6,walk:'18 min'} ]},
  { id:'airpods-4', brand:'Apple', name:'AirPods 4 with Active Noise Cancellation', category:'Audio', image:'🎧', online:17900, stores:[
    {id:'s4',name:'iConnect Store',area:'Koramangala',distance:0.6,price:16990,stock:'In stock',rating:4.9,walk:'8 min'},
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:17490,stock:'In stock',rating:4.5,walk:'11 min'} ]},
  { id:'samsung-a56', brand:'Samsung', name:'Galaxy A56 5G · 8GB + 128GB', category:'Mobiles', image:'📱', online:41999, stores:[
    {id:'s5',name:'Mobile Square',area:'Koramangala 4th Block',distance:0.3,price:39999,stock:'In stock',rating:4.7,walk:'4 min'},
    {id:'s6',name:'Sangeetha Mobiles',area:'Sony World Junction',distance:1.1,price:40499,stock:'In stock',rating:4.4,walk:'14 min'} ]},
  { id:'bo-atlas', brand:'boAt', name:'Airdopes Atlas ANC Earbuds', category:'Audio', image:'🎵', online:4999, stores:[
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:3799,stock:'In stock',rating:4.8,walk:'5 min'},
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:3999,stock:'In stock',rating:4.6,walk:'18 min'} ]},
  { id:'jbl-flip6', brand:'JBL', name:'Flip 6 Portable Bluetooth Speaker', category:'Audio', image:'🔈', online:11999, stores:[
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:9999,stock:'In stock',rating:4.8,walk:'5 min'},
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:10499,stock:'Only 2 left',rating:4.5,walk:'11 min'} ]},
  { id:'philips-airfryer', brand:'Philips', name:'Essential Airfryer 4.1L', category:'Home appliances', image:'🍟', online:8999, stores:[
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:7499,stock:'In stock',rating:4.5,walk:'11 min'},
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:7799,stock:'In stock',rating:4.6,walk:'18 min'} ]},
  { id:'bosch-drill', brand:'Bosch', name:'EasyDrill 18V-40 Cordless Drill', category:'Power tools', image:'🔧', online:6990, stores:[
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:5790,stock:'In stock',rating:4.6,walk:'18 min'},
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:5990,stock:'Only 2 left',rating:4.8,walk:'5 min'} ]},
  { id:'samsung-tv', brand:'Samsung', name:'Crystal 4K 55 inch Smart TV', category:'Televisions', image:'📺', online:54999, stores:[
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:49990,stock:'In stock',rating:4.5,walk:'11 min'},
    {id:'s6',name:'Sangeetha Mobiles',area:'Sony World Junction',distance:1.1,price:50990,stock:'In stock',rating:4.4,walk:'14 min'} ]}
];
const storeCoordinates = {s1:[12.9358,77.6245],s2:[12.9349,77.6101],s3:[12.9279,77.6266],s4:[12.9365,77.6142],s5:[12.9382,77.6231],s6:[12.9324,77.6179]};
const distanceKm = (lat1, lon1, lat2, lon2) => { const r=6371, rad=Math.PI/180, dLat=(lat2-lat1)*rad, dLon=(lon2-lon1)*rad; const a=Math.sin(dLat/2)**2+Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin(dLon/2)**2; return +(r*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1); };
const dataDir = path.join(__dirname, 'data');
const updatesFile = path.join(dataDir, 'price-updates.json');
const claimsFile = path.join(dataDir, 'claims.json');
const usersFile = path.join(dataDir, 'users.json');
const listingsFile = path.join(dataDir, 'merchant-listings.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const readData = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const writeData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));
let priceUpdates = readData(updatesFile, {});
let claims = readData(claimsFile, []);
let users = readData(usersFile, []);
let merchantListings = readData(listingsFile, {});
if (!users.length) {
  users = [{id:'merchant-priya', name:'Priya Shah', email:'priya@soundvision.in', storeId:'s1', storeName:'Sound & Vision', passwordHash:crypto.scryptSync('nearmatch-demo', 'nearmatch', 64).toString('hex')}];
  writeData(usersFile, users);
}
const sessions = new Map();
const platformFee = 25;
const requestLog = new Map();
const rateAllowed = req => { const key=req.socket.remoteAddress || 'local'; const now=Date.now(); const entries=(requestLog.get(key)||[]).filter(time=>now-time<60000); if(entries.length>=180)return false; entries.push(now);requestLog.set(key,entries);return true; };
const hashPassword = password => { const salt = crypto.randomBytes(16).toString('hex'); return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`; };
const passwordMatches = (password, stored) => {
  const [salt, digest] = stored.includes(':') ? stored.split(':') : ['nearmatch', stored];
  const candidate = crypto.scryptSync(String(password || ''), salt, 64).toString('hex');
  return candidate.length === digest.length && crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(digest));
};
const authenticatedUser = req => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) return null;
  return users.find(user => user.id === session.userId) || session.merchant || null;
};
const authenticatedAdmin = req => { const token=(req.headers.authorization||'').replace('Bearer ',''); const session=sessions.get(token); return session?.role==='admin'&&session.expiresAt>Date.now(); };
const market = () => inventory.map(product => { const extra = Object.entries(merchantListings).flatMap(([storeId, listings]) => listings.filter(listing => listing.productId === product.id).map(listing => ({id:storeId,name:listing.storeName,area:listing.area,distance:listing.distance,price:listing.price,stock:listing.stock,rating:listing.rating,walk:listing.walk,updatedAt:listing.updatedAt}))); return {...product, stores:[...product.stores, ...extra].map(store => {
  const update = priceUpdates[`${product.id}:${store.id}`];
  const current = update ? {...store, price:update.price, stock:update.stock, updatedAt:update.updatedAt} : store; const hour = new Date().getHours(); return {...current, hours:'9:00 AM–9:00 PM', openNow:hour >= 9 && hour < 21};
})}; });
const json = (res, body, status=200) => { res.writeHead(status, {'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'}); res.end(JSON.stringify(body)); };
const body = req => new Promise(resolve => { let data=''; req.on('data', c=>data+=c); req.on('end', ()=>resolve(data ? JSON.parse(data) : {})); });

http.createServer(async (req,res) => {
  if (!rateAllowed(req)) return json(res,{error:'Too many requests. Please try again shortly.'},429);
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/products') {
    const rawQuery=(url.searchParams.get('q')||'').toLowerCase().trim(); const queryTerms=rawQuery.split(/\s+/).filter(Boolean).map(term=>term.endsWith('s')?term.slice(0,-1):term); const lat=Number(url.searchParams.get('lat')),lng=Number(url.searchParams.get('lng')); const hasLocation=Number.isFinite(lat)&&Number.isFinite(lng); const demoAreaDistance=hasLocation?distanceKm(lat,lng,12.935,77.624):0; const useLocation=hasLocation&&demoAreaDistance<20; const matches=p=>!queryTerms.length||queryTerms.every(term=>`${p.brand} ${p.name} ${p.category}`.toLowerCase().includes(term));
    try { const remote = await supabaseCatalog(); const source = remote || market(); const located=source.map(p=>({...p,stores:p.stores.map(s=>{const point=storeCoordinates[s.id];return useLocation&&point?{...s,distance:distanceKm(lat,lng,point[0],point[1])}:s})})); return json(res, located.filter(matches)); } catch { return json(res, market().filter(matches)); }
  }
  if (url.pathname === '/api/supabase-status') {
    if (!supabaseUrl || !supabaseAnonKey) return json(res, {connected:false, message:'Supabase credentials are not configured.'}, 503);
    try { const products = await supabaseRequest('products?select=id&limit=1'); return json(res, {connected:true, productsTable:true, seeded:products.length > 0}); }
    catch (error) { return json(res, {connected:false, message:error.message}, 502); }
  }
  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    const {email, password} = await body(req);
    const remote = await supabaseAuth('token?grant_type=password', {email, password});
    if (remote?.access_token && remote.user?.id) {
      let stores = await supabaseRequest(`stores?owner_id=eq.${remote.user.id}&select=id,name,area`, {token:remote.access_token});
      if (!stores.length) stores = await supabaseRequest('stores', {method:'POST', token:remote.access_token, body:{owner_id:remote.user.id,name:'My Store',area:'Local area'}});
      const store = stores[0]; const merchant={id:remote.user.id,name:remote.user.user_metadata?.name || email.split('@')[0],email,storeId:store.id,storeName:store.name};
      const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, {userId:remote.user.id, merchant, supabaseToken:remote.access_token, expiresAt:Date.now()+1000*60*60*12});
      return json(res, {token, merchant});
    }
    const user = users.find(entry => entry.email.toLowerCase() === String(email || '').toLowerCase());
    if (!user || !passwordMatches(password, user.passwordHash)) return json(res, {error:'Email or password is incorrect.'}, 401);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {userId:user.id, expiresAt:Date.now() + 1000 * 60 * 60 * 12});
    return json(res, {token, merchant:{name:user.name, storeId:user.storeId, storeName:user.storeName}});
  }
  if (url.pathname === '/api/auth/register' && req.method === 'POST') {
    const {name, email, password, storeName} = await body(req);
    if (!name || !storeName || !email || !String(email).includes('@') || String(password || '').length < 8) return json(res, {error:'Enter your name, store name, valid email, and a password of at least 8 characters.'}, 400);
    if (users.some(entry => entry.email.toLowerCase() === String(email).toLowerCase())) return json(res, {error:'An account with this email already exists.'}, 409);
    const user = {id:`merchant-${crypto.randomUUID()}`, name:String(name).trim(), email:String(email).trim().toLowerCase(), storeId:`store-${crypto.randomUUID()}`, storeName:String(storeName).trim(), passwordHash:hashPassword(String(password))};
    users.push(user); writeData(usersFile, users);
    const token = crypto.randomBytes(32).toString('hex'); sessions.set(token, {userId:user.id, expiresAt:Date.now() + 1000 * 60 * 60 * 12});
    return json(res, {token, merchant:{name:user.name, storeId:user.storeId, storeName:user.storeName}}, 201);
  }
  if (url.pathname === '/api/auth/logout' && req.method === 'POST') {
    sessions.delete((req.headers.authorization || '').replace('Bearer ', ''));
    return json(res, {message:'Signed out.'});
  }
  if (url.pathname === '/api/admin/login' && req.method === 'POST') {
    const {email,password}=await body(req); if(email!=='owner@nearmatch.app'||password!=='owner-demo') return json(res,{error:'Admin email or password is incorrect.'},401);
    const token=crypto.randomBytes(32).toString('hex'); sessions.set(token,{role:'admin',expiresAt:Date.now()+1000*60*60*12}); return json(res,{token,owner:{email}});
  }
  if (url.pathname === '/api/admin/summary') {
    if(!authenticatedAdmin(req)) return json(res,{error:'Admin sign-in required.'},401);
    const redeemed=claims.filter(claim=>claim.status==='Redeemed'); const active=claims.filter(claim=>claim.status==='Active'&&claim.expiresAt>Date.now()); const byMerchant={}; redeemed.forEach(claim=>{byMerchant[claim.store]=(byMerchant[claim.store]||0)+1});
    return json(res,{platformFee,redeemedDeals:redeemed.length,activeClaims:active.length,totalEarnings:redeemed.length*platformFee,merchants:Object.entries(byMerchant).map(([merchant,deals])=>({merchant,deals,earnings:deals*platformFee}))});
  }
  if (url.pathname === '/api/claim' && req.method === 'POST') {
    const data=await body(req); const product=market().find(p=>p.id===data.productId); const store=product?.stores.find(s=>s.id===data.storeId);
    if (!store) return json(res,{error:'Offer not found'},404);
    if (supabaseUrl && supabaseAnonKey && store.id !== 's1' && !store.id.startsWith('s')) {
      try { const remoteProduct=(await supabaseRequest(`products?brand=eq.${encodeURIComponent(product.brand)}&name=eq.${encodeURIComponent(product.name)}&select=id`, {}))[0]; if (remoteProduct) { const pin=String(Math.floor(1000+Math.random()*9000)); const expiresAt=new Date(Date.now()+3600000).toISOString(); await supabaseRequest('claims',{method:'POST',body:{pin,store_id:store.id,product_id:remoteProduct.id,locked_price:store.price,expires_at:expiresAt}}); return json(res,{id:pin,pin,productId:product.id,product:product.name,store:store.name,price:store.price,expiresAt,status:'Active',source:'supabase'},201); } } catch (error) { return json(res,{error:`Could not create hosted deal: ${error.message}`},502); }
    }
    const claim={id:crypto.randomUUID(), pin:String(Math.floor(1000+Math.random()*9000)), productId:product.id, storeId:store.id, product:product.name, store:store.name, price:store.price, expiresAt:Date.now()+3600000, status:'Active'};
    claims.push(claim); writeData(claimsFile, claims); return json(res,claim,201);
  }
  if (url.pathname === '/api/redeem' && req.method === 'POST') {
    const user = authenticatedUser(req);
    if (!user) return json(res, {error:'Please sign in to verify a customer deal.'}, 401);
    const {pin}=await body(req); const claim=claims.find(c=>c.pin===pin && c.status==='Active');
    if (user.supabaseToken) { try { const remote=(await supabaseRequest(`claims?pin=eq.${encodeURIComponent(pin)}&select=*`,{token:user.supabaseToken}))[0]; if (!remote) return json(res,{error:'No active hosted deal found for that PIN.'},404); await supabaseRequest(`claims?id=eq.${remote.id}`,{method:'PATCH',token:user.supabaseToken,body:{status:'Redeemed',redeemed_at:new Date().toISOString()}}); return json(res,{message:'Deal verified. Footfall recorded.',claim:{pin,price:remote.locked_price,status:'Redeemed'}}); } catch (error) { return json(res,{error:`Could not verify hosted deal: ${error.message}`},502); } }
    if (!claim) return json(res,{error:'No active deal found for that PIN.'},404);
    if (claim.storeId !== user.storeId) return json(res,{error:'This deal belongs to another store.'},403);
    if (claim.expiresAt<Date.now()) {claim.status='Expired'; return json(res,{error:'This deal has expired.'},410)}
    claim.status='Redeemed'; writeData(claimsFile, claims); return json(res,{message:'Deal verified. Footfall recorded.',claim});
  }
  if (url.pathname === '/api/merchant/inventory') {
    const user = authenticatedUser(req);
    if (!user) return json(res, {error:'Please sign in to access this store.'}, 401);
    const storeId = user.storeId;
    const items = market().flatMap(product => product.stores.filter(store => store.id === storeId).map(store => ({
      productId:product.id, product:product.name, brand:product.brand, image:product.image, ...store
    })));
    if (!items.length) return json(res, inventory.map(product => ({productId:product.id, product:product.name, brand:product.brand, image:product.image, price:product.online, stock:'Out of stock', id:storeId, storeId})));
    return json(res, items);
  }
  if (url.pathname === '/api/merchant/catalog' && req.method === 'GET') {
    const user = authenticatedUser(req);
    if (!user) return json(res, {error:'Please sign in to access the catalog.'}, 401);
    const listed = new Set((merchantListings[user.storeId] || []).map(item => item.productId));
    return json(res, inventory.map(product => ({productId:product.id, product:product.name, brand:product.brand, image:product.image, category:product.category, listed:listed.has(product.id)})));
  }
  if (url.pathname === '/api/merchant/catalog' && req.method === 'POST') {
    const user = authenticatedUser(req);
    if (!user) return json(res, {error:'Please sign in to publish a listing.'}, 401);
    const data = await body(req); const product = inventory.find(p => p.id === data.productId); const price = Number(data.price);
    if (!product || !Number.isInteger(price) || price < 1) return json(res, {error:'Choose a product and enter a valid price.'}, 400);
    const stock = ['In stock', 'Only 2 left', 'Out of stock'].includes(data.stock) ? data.stock : 'In stock';
    merchantListings[user.storeId] = merchantListings[user.storeId] || [];
    if (merchantListings[user.storeId].some(item => item.productId === product.id)) return json(res, {error:'This product is already listed.'}, 409);
    merchantListings[user.storeId].push({productId:product.id,storeName:user.storeName,area:'Local store',distance:0.5,price,stock,rating:5,walk:'6 min',updatedAt:new Date().toISOString()});
    writeData(listingsFile, merchantListings); return json(res, {message:'Product published to nearby shoppers.'}, 201);
  }
  if (url.pathname === '/api/merchant/price' && req.method === 'PUT') {
    const user = authenticatedUser(req);
    if (!user) return json(res, {error:'Please sign in to update prices.'}, 401);
    const data = await body(req); const product = inventory.find(p => p.id === data.productId);
    const store = product?.stores.find(s => s.id === data.storeId);
    if (data.storeId !== user.storeId) return json(res, {error:'You can only update your own store.'}, 403);
    const price = Number(data.price);
    if (!product || !Number.isInteger(price) || price < 1) return json(res, {error:'Enter a valid whole-number price.'}, 400);
    const stock = ['In stock', 'Only 2 left', 'Out of stock'].includes(data.stock) ? data.stock : store.stock;
    if (user.supabaseToken) {
      try {
        const remoteProducts = await supabaseRequest(`products?brand=eq.${encodeURIComponent(product.brand)}&name=eq.${encodeURIComponent(product.name)}&select=id`, {token:user.supabaseToken});
        if (remoteProducts?.[0]) { await supabaseRequest('listings?on_conflict=store_id,product_id', {method:'POST', token:user.supabaseToken, prefer:'resolution=merge-duplicates,return=representation', body:{store_id:user.storeId,product_id:remoteProducts[0].id,price,stock,updated_at:new Date().toISOString()}}); return json(res, {price, stock, message:'Price saved to Supabase for nearby shoppers.'}); }
      } catch (error) { return json(res, {error:`Supabase could not save this listing: ${error.message}`}, 502); }
    }
    const dynamic = (merchantListings[user.storeId] || []).find(item => item.productId === product.id);
    if (!store && !dynamic) { merchantListings[user.storeId] = merchantListings[user.storeId] || []; merchantListings[user.storeId].push({productId:product.id,storeName:user.storeName,area:'Local store',distance:0.5,price,stock,rating:5,walk:'6 min',updatedAt:new Date().toISOString()}); writeData(listingsFile, merchantListings); return json(res, {price, stock, message:'Product published to nearby shoppers.'}); }
    if (dynamic) { dynamic.price = price; dynamic.stock = stock; dynamic.updatedAt = new Date().toISOString(); writeData(listingsFile, merchantListings); return json(res, {price, stock, message:'Price updated for nearby shoppers.'}); }
    priceUpdates[`${product.id}:${store.id}`] = {price, stock, updatedAt:new Date().toISOString()};
    writeData(updatesFile, priceUpdates);
    return json(res, {...store, price, stock, updatedAt:priceUpdates[`${product.id}:${store.id}`].updatedAt});
  }
  let file=url.pathname==='/' ? 'index.html' : url.pathname.slice(1);
  file=path.normalize(path.join(publicDir,file));
  if (!file.startsWith(publicDir)) {res.writeHead(403);return res.end();}
  fs.readFile(file,(err,data)=>{ if(err){res.writeHead(404);return res.end('Not found')} const type=file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.webmanifest')?'application/manifest+json':'text/html'; if(type==='text/html') data=Buffer.from(data.toString().replace('</head>','<style>[hidden]{display:none!important}.filter-panel{display:flex;gap:10px;align-items:center;background:#fff;border:1px solid #dde3dd;border-radius:10px;padding:12px;margin:-8px 0 18px;font-size:12px}.filter-panel label{display:flex;align-items:center;gap:7px;color:#52625a}.filter-panel select{border:1px solid #dde3dd;border-radius:6px;padding:6px;background:#fff}.filter-panel .check{margin-left:auto}.empty-results{background:#fff;border:1px solid #dde3dd;border-radius:14px;padding:30px;text-align:center}.empty-results p{color:#67746e;font-size:13px}.deals-button{background:transparent;color:#176b4d;font-weight:700;font-size:12px}.saved-deal{border-top:1px solid #dde3dd;padding:13px 0;display:grid;grid-template-columns:1fr auto;gap:4px}.saved-deal span{font-size:11px;color:#67746e}.saved-deal strong{grid-column:2;grid-row:1/3;color:#176b4d;letter-spacing:2px}</style></head>')); res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'});res.end(data); });
}).listen(process.env.PORT||3000,()=>console.log('NearMatch running at http://localhost:3000'));
