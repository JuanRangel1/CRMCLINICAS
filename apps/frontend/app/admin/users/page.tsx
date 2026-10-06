'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminUsersPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/users').then(setRows).catch(() => {}); }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuários</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100"><tr><th className="p-3 text-left">Nome</th><th className="p-3 text-left">E-mail</th><th className="p-3 text-left">Papel</th><th className="p-3 text-left">Clínica</th></tr></thead>
          <tbody>
            {rows.map((r) => <tr key={r.id} className="border-t"><td className="p-3">{r.name}</td><td className="p-3">{r.email}</td><td className="p-3">{r.role?.name}</td><td className="p-3">{r.clinic?.name ?? '-'}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
