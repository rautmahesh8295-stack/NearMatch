// Shared catalog seed — migrated from the original vanilla server.js inventory.
export const PLATFORM_FEE = Number(process.env.PLATFORM_FEE || 25);

export const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'owner@nearmatch.app',
  password: process.env.ADMIN_PASSWORD || 'owner-demo',
};

export const STORE_COORDINATES = {
  s1: [12.9358, 77.6245],
  s2: [12.9349, 77.6101],
  s3: [12.9279, 77.6266],
  s4: [12.9365, 77.6142],
  s5: [12.9382, 77.6231],
  s6: [12.9324, 77.6179],
};

export function distanceKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return +(r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export const INVENTORY = [
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
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:5790,stock:'In stock',rating:4.8,walk:'5 min'},
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:5990,stock:'Only 2 left',rating:4.8,walk:'5 min'} ]},
  { id:'samsung-tv', brand:'Samsung', name:'Crystal 4K 55 inch Smart TV', category:'Televisions', image:'📺', online:54999, stores:[
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:49990,stock:'In stock',rating:4.5,walk:'11 min'},
    {id:'s6',name:'Sangeetha Mobiles',area:'Sony World Junction',distance:1.1,price:50990,stock:'In stock',rating:4.4,walk:'14 min'} ]},
];
