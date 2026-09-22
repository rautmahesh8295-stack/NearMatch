-- Run after schema.sql to add the starter shopper catalog.
insert into public.products (sku, brand, name, category, image, online_price) values
('SONY-XB100', 'Sony', 'SRS-XB100 Portable Bluetooth Speaker', 'Audio', '🔊', 3790),
('APPLE-AIRPODS-4-ANC', 'Apple', 'AirPods 4 with Active Noise Cancellation', 'Audio', '🎧', 17900),
('SAMSUNG-A56-128', 'Samsung', 'Galaxy A56 5G · 8GB + 128GB', 'Mobiles', '📱', 41999),
('BOAT-ATLAS-ANC', 'boAt', 'Airdopes Atlas ANC Earbuds', 'Audio', '🎵', 4999)
on conflict (sku) do update set online_price = excluded.online_price;
