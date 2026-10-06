'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminClinicsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  useEffect(() => { api('/clinics').then(setRows).catch(() => {}); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api('/clinics', { method: 'POST', body: JSON.stringify(form) });
    setForm({});
    setRows(await api('/clinics'));
  }
  async function toggle(id: string, status: string) {
    await api(`/clinics/${id}/suspend`, { method: 'POST', body: JSON.stringify({ status }) });
    setRows(await api('/clinics'));
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Clínicas</h1>
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 mb-6 grid md:grid-cols-4 gap-3">
        <input placeholder="Nome" className="border rounded p-2 text-sm" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="E-mail" className="border rounded p-2 text-sm" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Telefone" className="border rounded p-2 text-sm" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button className="bg-slate-900 text-white rounded p-2 text-sm">Criar clínica</button>
      </form>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">Nome</th><th className="p-3 text-left">E-mail</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Plano</th><th className="p-3 text-left">Usuários</th><th className="p-3"></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">{r.plan?.name ?? '-'}</td>
                <td className="p-3">{r._count?.users}</td>
                <td className="p-3 text-right space-x-2">
                  {r.status === 'ACTIVE' ? (
                    <button className="text-red-600 text-xs" onClick={() => toggle(r.id, 'SUSPENDED')}>Suspender</button>
                  ) : (
                    <button className="text-green-700 text-xs" onClick={() => toggle(r.id, 'ACTIVE')}>Reativar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
