'use client';
import { useEffect, useState } from 'react';
import { api, fmt } from '../../lib/api';

export default function CommissionsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/financial/commissions').then(setRows).catch(() => {}); }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Comissões</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">Profissional</th><th className="p-3 text-left">Valor</th><th className="p-3 text-left">%</th><th className="p-3 text-left">Data</th></tr></thead>
          <tbody>
            {rows.map((r) => <tr key={r.id} className="border-t"><td className="p-3">{r.professional?.name}</td><td className="p-3">{fmt(r.amount)}</td><td className="p-3">{r.percentage}%</td><td className="p-3">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
