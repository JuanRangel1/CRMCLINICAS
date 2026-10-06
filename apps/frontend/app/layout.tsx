import './globals.css';
import Sidebar from '../components/Sidebar';

export const metadata = { title: 'CRM Clínicas', description: 'CRM SaaS para clínicas' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
