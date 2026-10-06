'use client';
import { useEffect, useState } from 'react';
import { api, fmt } from '../../lib/api';

export default function ReportsPage() {
  const [funnel, setFunnel] = useState<any[]>([]);
  const [profs, setProfs] = useState<any[]>([]);
  const [fin, setFin] = useState<any>(null);
  useEffect(() => {
    api('/reports/funnel').then(setFunnel).catch(() => {});
    api('/reports/professionals').then(setProfs).catch(() => {});
    api('/reports/financial').then(setFin).catch(() => {});
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
      <h2 className="font-semibold mb-2">Funil comercial</h2>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <table className="w-full text-sm">
          <thead><tr><th className="text-left p-2">Estágio</th><th className="text-left p-2">Oportunidades</th><th className="text-left p-2">Valor</th></tr></thead>
          <tbody>{funnel.map((f) => <tr key={f.stage} className="border-t"><td className="p-2">{f.stage}</td><td className="p-2">{f.count}</td><td className="p-2">{fmt(f.value)}</td></tr>)}</tbody>
        </table>
      </div>
      <h2 className="font-semibold mb-2">Profissionais</h2>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <table className="w-full text-sm">
          <thead><tr><th className="text-left p-2">Nome</th><th className="text-left p-2">Agendamentos</th><th className="text-left p-2">Concluídos</th><th className="text-left p-2">Comissões</th></tr></thead>
          <tbody>{profs.map((p) => <tr key={p.name} className="border-t"><td className="p-2">{p.name}</td><td className="p-2">{p.appointments}</td><td className="p-2">{p.completed}</td><td className="p-2">{fmt(p.commissions)}</td></tr>)}</tbody>
        </table>
      </div>
      {fin && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-2">Financeiro</h2>
          <p>Receita: {fmt(fin.income)} · Despesas: {fmt(fin.expenses)} · Lucro: {fmt(fin.profit)}</p>
        </div>
      )}
    </div>
  );
}
