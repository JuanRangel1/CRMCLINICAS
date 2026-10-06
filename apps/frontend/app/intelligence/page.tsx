'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function IntelligencePage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api('/intelligence').then(setData).catch(() => {}); }, []);
  if (!data) return <div className="text-slate-500">Carregando...</div>;
  const colors: any = { RED: 'bg-red-50 border-red-200 text-red-800', YELLOW: 'bg-yellow-50 border-yellow-200 text-yellow-800', GREEN: 'bg-green-50 border-green-200 text-green-800' };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inteligência da Clínica</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-sm text-slate-500">Clinic Health Score</div>
        <div className="text-5xl font-bold">{data.score}</div>
        <div className="text-slate-600">{data.health} · No-show {data.noShowRate}%</div>
      </div>
      <div className="space-y-3">
        {data.alerts.map((a: any, i: number) => (
          <div key={i} className={`border rounded-lg p-4 ${colors[a.level]}`}>{a.level === 'RED' ? '🔴' : a.level === 'YELLOW' ? '🟡' : '🟢'} {a.message}</div>
        ))}
        {data.alerts.length === 0 && <div className="text-slate-400">Nenhum alerta no momento.</div>}
      </div>
    </div>
  );
}
