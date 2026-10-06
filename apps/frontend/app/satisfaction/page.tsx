'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function SatisfactionPage() {
  const [summary, setSummary] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ rating: 5 });
  useEffect(() => { api('/satisfaction/summary').then(setSummary); api('/satisfaction').then(setRows); }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api('/satisfaction', { method: 'POST', body: JSON.stringify({ ...form, rating: Number(form.rating) }) });
    setForm({ rating: 5 });
    setRows(await api('/satisfaction'));
    setSummary(await api('/satisfaction/summary'));
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Avaliações</h1>
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4"><div className="text-xs uppercase text-slate-500">Média</div><div className="text-2xl font-bold">{summary.average} ⭐</div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="text-xs uppercase text-slate-500">NPS</div><div className="text-2xl font-bold">{summary.nps}</div></div>
          <div className="bg-white rounded-lg shadow p-4"><div className="text-xs uppercase text-slate-500">Total</div><div className="text-2xl font-bold">{summary.total}</div></div>
        </div>
      )}
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 mb-6 grid md:grid-cols-4 gap-3">
        <input placeholder="ID Paciente" className="border rounded p-2 text-sm" value={form.patientId ?? ''} onChange={(e) => setForm({ ...form, patientId: e.target.value })} />
        <input placeholder="Comentário" className="border rounded p-2 text-sm" value={form.comment ?? ''} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
        <input type="number" min="1" max="5" placeholder="Nota 1-5" className="border rounded p-2 text-sm" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
        <button className="bg-slate-900 text-white rounded p-2 text-sm">Avaliar</button>
      </form>
      <div className="bg-white rounded-lg shadow p-4">
        {rows.map((r) => <div key={r.id} className="border-b py-2 text-sm">{r.patient?.name} · {r.rating} ⭐ · {r.comment}</div>)}
      </div>
    </div>
  );
}
