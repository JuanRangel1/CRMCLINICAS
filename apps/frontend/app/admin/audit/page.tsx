'use client';
import { useEffect, useState } from 'react';
import { api, dt } from '../../../lib/api';

export default function AdminAuditPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/admin/audit-logs').then(setRows).catch(() => {}); }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Auditoria</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">Data</th><th className="p-3 text-left">Usuário</th><th className="p-3 text-left">Ação</th><th className="p-3 text-left">Entidade</th></tr></thead>
          <tbody>
            {rows.map((r) => <tr key={r.id} className="border-t"><td className="p-3">{dt(r.createdAt)}</td><td className="p-3">{r.user?.name ?? '-'}</td><td className="p-3">{r.action}</td><td className="p-3">{r.entity}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
