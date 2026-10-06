'use client';
import { useEffect, useState } from 'react';
import { api, fmt } from '../../lib/api';

export default function FinancialPage() {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>({ type: 'INCOME', status: 'PAID' });
  const [error, setError] = useState('');

  async function load() { try { setData(await api('/financial')); } catch (e: any) { setError(e.message); } }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/financial', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
      setForm({ type: 'INCOME', status: 'PAID' });
      load();
    } catch (e: any) { setError(e.message); }
  }

  if (!data) return <div className="text-slate-500">Carregando...</div>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Financeiro</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[['Receita', data.income], ['Despesas', data.expenses], ['Lucro', data.profit], ['Pendente', data.pending]].map(([l, v]) => (
          <div key={l as string} className="bg-white rounded-lg shadow p-4"><div className="text-xs uppercase text-slate-500">{l}</div><div className="text-xl font-bold">{fmt(v as number)}</div></div>
        ))}
      </div>
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 mb-6 grid md:grid-cols-5 gap-3">
        <select className="border rounded p-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="INCOME">Receita</option><option value="EXPENSE">Despesa</option>
        </select>
        <input placeholder="Categoria" className="border rounded p-2 text-sm" value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <input placeholder="Valor" type="number" step="0.01" className="border rounded p-2 text-sm" value={form.amount ?? ''} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <select className="border rounded p-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="PAID">Pago</option><option value="PENDING">Pendente</option><option value="OVERDUE">Vencido</option>
        </select>
        <button className="bg-slate-900 text-white rounded p-2 text-sm">Lançar</button>
      </form>
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">Tipo</th><th className="p-3 text-left">Categoria</th><th className="p-3 text-left">Valor</th><th className="p-3 text-left">Status</th></tr></thead>
          <tbody>
            {data.transactions.map((t: any) => (
              <tr key={t.id} className="border-t"><td className="p-3">{t.type === 'INCOME' ? 'Receita' : 'Despesa'}</td><td className="p-3">{t.category}</td><td className="p-3">{fmt(t.amount)}</td><td className="p-3">{t.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
