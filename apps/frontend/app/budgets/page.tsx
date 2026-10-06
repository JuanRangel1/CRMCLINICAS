'use client';
import { useEffect, useState } from 'react';
import { api, fmt, dt } from '../../lib/api';

export default function BudgetsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ status: 'DRAFT', items: [] });
  const [error, setError] = useState('');

  async function load() { try { setRows(await api('/budgets')); } catch (e: any) { setError(e.message); } }
  useEffect(() => { load(); }, []);

  const [item, setItem] = useState<any>({ description: '', quantity: 1, unitPrice: 0 });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/budgets', { method: 'POST', body: JSON.stringify({ ...form, items: [...(form.items ?? []), item], discount: Number(form.discount ?? 0) }) });
      setForm({ status: 'DRAFT', items: [] });
      setItem({ description: '', quantity: 1, unitPrice: 0 });
      load();
    } catch (e: any) { setError(e.message); }
  }

  async function setStatus(id: string, status: string) {
    await api(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orçamentos</h1>
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 mb-6 grid md:grid-cols-5 gap-3">
        <input placeholder="ID Paciente" className="border rounded p-2 text-sm" value={form.patientId ?? ''} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required />
        <input placeholder="Descrição do item" className="border rounded p-2 text-sm" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} required />
        <input placeholder="Valor" type="number" className="border rounded p-2 text-sm" value={item.unitPrice} onChange={(e) => setItem({ ...item, unitPrice: Number(e.target.value) })} required />
        <input placeholder="Desconto" type="number" className="border rounded p-2 text-sm" value={form.discount ?? ''} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
        <button className="bg-slate-900 text-white rounded p-2 text-sm">Criar</button>
      </form>
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">Paciente</th><th className="p-3 text-left">Itens</th><th className="p-3 text-left">Total</th><th className="p-3 text-left">Validade</th><th className="p-3 text-left">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.patient?.name}</td>
                <td className="p-3">{r.items?.map((i: any) => i.description).join(', ')}</td>
                <td className="p-3">{fmt(r.total)}</td>
                <td className="p-3">{dt(r.validUntil)}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3 text-right space-x-2">
                  <button className="text-green-700 text-xs" onClick={() => setStatus(r.id, 'APPROVED')}>Aprovar</button>
                  <button className="text-red-600 text-xs" onClick={() => setStatus(r.id, 'REJECTED')}>Recusar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
