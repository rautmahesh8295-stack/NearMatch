const assert = require('node:assert/strict');
const base = process.env.NEARMATCH_URL || 'http://localhost:3000';
const request = async (path, options) => { const response = await fetch(base + path, options); const data = await response.json(); assert.ok(response.ok, `${path} returned ${response.status}: ${JSON.stringify(data)}`); return data; };

(async () => {
  const products = await request('/api/products');
  assert.ok(products.length >= 4, 'catalog should contain at least four products');
  const login = await request('/api/auth/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email:'priya@soundvision.in',password:'nearmatch-demo'})});
  assert.ok(login.token, 'merchant login should return a session token');
  const headers = {Authorization:`Bearer ${login.token}`};
  const inventory = await request('/api/merchant/inventory', {headers});
  assert.ok(inventory.length >= 1, 'demo merchant should have inventory');
  const claim = await request('/api/claim', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:'sony-xb100',storeId:'s1'})});
  assert.match(claim.pin, /^\d{4}$/, 'claim should return a four digit PIN');
  const redeemed = await request('/api/redeem', {method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({pin:claim.pin})});
  assert.equal(redeemed.claim.status, 'Redeemed');
  console.log('NearMatch smoke test passed: catalog, login, inventory, claim, redemption');
})().catch(error => { console.error(`Smoke test failed: ${error.message}`); process.exitCode = 1; });
