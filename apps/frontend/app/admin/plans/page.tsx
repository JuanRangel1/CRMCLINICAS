'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminPlansPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/admin/plans').then(setRows).catch(() => {}); }, []);
  async function update(id: string, field: string, value: number) {
    await api(`/admin/plans/${id}`, { method: 'PUT', body: JSON.stringify({ [field]: value }) });
    setRows(await api('/admin/plans'));
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Planos</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">Plano</th><th className="p-3 text-left">Usuários</th><th className="p-3 text-left">Profissionais</th><th className="p-3 text-left">Pacientes</th><th className="p-3 text-left">Leads</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-semibold">{r.name}</td>
                {(['maxUsers', 'maxProfessionals', 'maxPatients', 'maxLeads'] as const).map((f) => (
                  <td key={f} className="p-3"><input type="number" className="border rounded p-1 w-24" defaultValue={r[f]} onBlur={(e) => update(r.id, f, Number(e.target.value))} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
