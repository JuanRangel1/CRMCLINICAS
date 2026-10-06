'use client';
import { useEffect, useState } from 'react';
import { api, dt } from '../../lib/api';

export default function AppointmentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState('');

  async function load() { try { setRows(await api('/appointments')); } catch (e: any) { setError(e.message); } }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('/appointments', { method: 'POST', body: JSON.stringify(form) });
      setForm({});
      load();
    } catch (e: any) { setError(e.message); }
  }

  async function setStatus(id: string, status: string) {
    await api(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Consultas</h1>
      <form onSubmit={submit} className="bg-white rounded-lg shadow p-4 mb-6 grid md:grid-cols-5 gap-3">
        <input type="datetime-local" className="border rounded p-2 text-sm" value={form.startAt ?? ''} onChange={(e) => setForm({ ...form, startAt: e.target.value })} required />
        <input type="datetime-local" className="border rounded p-2 text-sm" value={form.endAt ?? ''} onChange={(e) => setForm({ ...form, endAt: e.target.value })} required />
        <input placeholder="ID Paciente" className="border rounded p-2 text-sm" value={form.patientId ?? ''} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required />
        <input placeholder="ID Profissional" className="border rounded p-2 text-sm" value={form.professionalId ?? ''} onChange={(e) => setForm({ ...form, professionalId: e.target.value })} required />
        <button className="bg-slate-900 text-white rounded p-2 text-sm">Agendar</button>
      </form>
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">Início</th><th className="p-3 text-left">Paciente</th><th className="p-3 text-left">Profissional</th><th className="p-3 text-left">Sala</th><th className="p-3 text-left">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{dt(r.startAt)}</td>
                <td className="p-3">{r.patient?.name}</td>
                <td className="p-3">{r.professional?.name}</td>
                <td className="p-3">{r.room?.name ?? '-'}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3 text-right space-x-2">
                  <button className="text-green-700 text-xs" onClick={() => setStatus(r.id, 'CONFIRMED')}>Confirmar</button>
                  <button className="text-red-600 text-xs" onClick={() => setStatus(r.id, 'NO_SHOW')}>Falta</button>
                  <button className="text-slate-600 text-xs" onClick={() => setStatus(r.id, 'CANCELED')}>Cancelar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
