'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin.clinica1@exemplo.com');
  const [password, setPassword] = useState('Senha@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Credenciais inválidas');
      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = data.user.role === 'SUPER_ADMIN' ? '/admin/clinics' : '/';
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold mb-6">Entrar</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full border rounded p-2" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full bg-slate-900 text-white rounded p-2 disabled:opacity-50" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-4">Super admin: admin@crmclinicas.com · Clínica 1: admin.clinica1@exemplo.com · Senha: Senha@123</p>
    </div>
  );
}
