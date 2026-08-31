import './globals.css';

export const metadata = {
  title: 'Three-Way Match Engine',
  description: 'Automated invoice, PO, and GRN reconciliation dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}