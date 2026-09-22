import './globals.css';

export const metadata = {
  title: 'NearMatch | Find it nearby. Pay less.',
  description: 'Compare real counter prices and stock at local stores before you step out.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
