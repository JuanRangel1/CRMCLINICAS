'use client';
import { useEffect, useState } from 'react';
import { api, fmt } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api('/dashboard').then(setData).catch(() => {}); }, []);
  if (!data) return <div className="p-8 text-slate-500">Carregando...</div>;
  const cards = [
    ['Pacientes', data.patients],
    ['Leads', data.leads],
    ['Agendamentos', data.appointments],
    ['Consultas', data.consultations],
    ['Conversão', `${data.conversion}%`],
    ['Faturamento', fmt(data.revenue)],
    ['Ticket médio', fmt(data.avgTicket)],
    ['No-show', `${data.noShowRate}%`],
  ];
  const noShowData = [
    { name: 'Compareceram', value: Math.max(0, data.appointments - (data.noShowRate * data.appointments) / 100) },
    { name: 'Faltas', value: (data.noShowRate * data.appointments) / 100 },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(([l, v]) => (
          <div key={l as string} className="bg-white rounded-lg shadow p-4">
            <div className="text-xs uppercase text-slate-500">{l}</div>
            <div className="text-2xl font-bold mt-1">{v}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">No-show</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={noShowData} dataKey="value" nameKey="name" label>
                {noShowData.map((_, i) => <Cell key={i} fill={i === 0 ? '#0f172a' : '#ef4444'} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-4">Funil comercial</h2>
          <Funnel />
        </div>
      </div>
    </div>
  );
}

function Funnel() {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => { api('/reports/funnel').then(setData).catch(() => {}); }, []);
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#0f172a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
