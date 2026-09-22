import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="notfound">
      <div>
        <div className="big">n</div>
        <h1>That page walked out of stock.</h1>
        <p>The page you are looking for doesn’t exist or has moved. Compare live prices instead.</p>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button className="primary">← Back to shopping</button>
        </Link>
      </div>
    </main>
  );
}