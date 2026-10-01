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

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=640&q=80`;

export const INVENTORY = [
  { id:'sony-xb100', brand:'Sony', name:'SRS-XB100 Portable Bluetooth Speaker', category:'Audio', image:IMG('photo-1589003077984-894e133dabab'), online:3790, stores:[
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:3199,stock:'In stock',rating:4.8,walk:'5 min'},
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:3299,stock:'Only 2 left',rating:4.5,walk:'11 min'},
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:3399,stock:'In stock',rating:4.6,walk:'18 min'} ]},
  { id:'airpods-4', brand:'Apple', name:'AirPods 4 with Active Noise Cancellation', category:'Audio', image:IMG('photo-1511025998370-7d59f82e9c8f'), online:17900, stores:[
    {id:'s4',name:'iConnect Store',area:'Koramangala',distance:0.6,price:16990,stock:'In stock',rating:4.9,walk:'8 min'},
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:17490,stock:'In stock',rating:4.5,walk:'11 min'} ]},
  { id:'samsung-a56', brand:'Samsung', name:'Galaxy A56 5G · 8GB + 128GB', category:'Mobiles', image:IMG('photo-1551764046-eadb20826deb'), online:41999, stores:[
    {id:'s5',name:'Mobile Square',area:'Koramangala 4th Block',distance:0.3,price:39999,stock:'In stock',rating:4.7,walk:'4 min'},
    {id:'s6',name:'Sangeetha Mobiles',area:'Sony World Junction',distance:1.1,price:40499,stock:'In stock',rating:4.4,walk:'14 min'} ]},
  { id:'bo-atlas', brand:'boAt', name:'Airdopes Atlas ANC Earbuds', category:'Audio', image:IMG('photo-1572569979132-b4f10c9ec185'), online:4999, stores:[
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:3799,stock:'In stock',rating:4.8,walk:'5 min'},
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:3999,stock:'In stock',rating:4.6,walk:'18 min'} ]},
  { id:'jbl-flip6', brand:'JBL', name:'Flip 6 Portable Bluetooth Speaker', category:'Audio', image:IMG('photo-1608043152269-423dbba4e7e1'), online:11999, stores:[
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:9999,stock:'In stock',rating:4.8,walk:'5 min'},
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:10499,stock:'Only 2 left',rating:4.5,walk:'11 min'} ]},
  { id:'philips-airfryer', brand:'Philips', name:'Essential Airfryer 4.1L', category:'Home appliances', image:IMG('photo-1745846664210-756817e1b19c'), online:8999, stores:[
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:7499,stock:'In stock',rating:4.5,walk:'11 min'},
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:7799,stock:'In stock',rating:4.6,walk:'18 min'} ]},
  { id:'bosch-drill', brand:'Bosch', name:'EasyDrill 18V-40 Cordless Drill', category:'Power tools', image:IMG('photo-1592054286113-649ba108e968'), online:6990, stores:[
    {id:'s3',name:'Digital World',area:'Madiwala',distance:1.4,price:5790,stock:'In stock',rating:4.8,walk:'5 min'},
    {id:'s1',name:'Sound & Vision',area:'Koramangala 5th Block',distance:0.4,price:5990,stock:'Only 2 left',rating:4.8,walk:'5 min'} ]},
  { id:'samsung-tv', brand:'Samsung', name:'Crystal 4K 55 inch Smart TV', category:'Televisions', image:IMG('photo-1560169897-fc0cdbdfa4d5'), online:54999, stores:[
    {id:'s2',name:'Croma Express',area:'Forum Mall',distance:0.9,price:49990,stock:'In stock',rating:4.5,walk:'11 min'},
    {id:'s6',name:'Sangeetha Mobiles',area:'Sony World Junction',distance:1.1,price:50990,stock:'In stock',rating:4.4,walk:'14 min'} ]},
];
