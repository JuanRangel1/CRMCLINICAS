'use client';
import { useEffect, useState } from 'react';
import { api } from './api';

export default function CrudPage({ title, endpoint, fields, columns }: { title: string; endpoint: string; fields: { name: string; label: string; type?: string; placeholder?: string }[]; columns: { key: string; label: string; format?: (row: any) => any }[] }) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try { setRows(await api(endpoint)); } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api(endpoint, { method: 'POST', body: JSON.stringify(form) });
      setForm({});
      load();
    } catch (e: any) { setError(e.message); }
  }

  async function remove(id: string) {
    if (!confirm('Excluir?')) return;
    try { await api(`${endpoint}/${id}`, { method: 'DELETE' }); } catch (e: any) { setError(e.message); }
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 mb-6 grid md:grid-cols-4 gap-3">
        {fields.map((f) => (
          <input key={f.name} type={f.type ?? 'text'} placeholder={f.placeholder ?? f.label} className="border rounded p-2 text-sm"
            value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })} />
        ))}
        <button className="bg-slate-900 text-white rounded p-2 text-sm">Adicionar</button>
      </form>
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      {loading ? <div className="text-slate-500">Carregando...</div> : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>{columns.map((c) => <th key={c.key} className="text-left p-3">{c.label}</th>)}<th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  {columns.map((c) => <td key={c.key} className="p-3">{c.format ? c.format(r) : r[c.key]}</td>)}
                  <td className="p-3 text-right"><button onClick={() => remove(r.id)} className="text-red-600 text-xs">Excluir</button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="p-6 text-center text-slate-400" colSpan={columns.length + 1}>Nenhum registro</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
