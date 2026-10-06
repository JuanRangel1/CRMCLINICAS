'use client';
import { useEffect, useState } from 'react';
import { api, fmt } from '../../lib/api';

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<any>(null);
  const [error, setError] = useState('');

  async function load() { try { setPipeline(await api('/pipeline')); } catch (e: any) { setError(e.message); } }
  useEffect(() => { load(); }, []);

  async function move(oppId: string, stageId: string) {
    await api(`/pipeline/opportunities/${oppId}`, { method: 'PUT', body: JSON.stringify({ stageId }) });
    load();
  }

  if (error) return <div className="text-red-600">{error}</div>;
  if (!pipeline) return <div className="text-slate-500">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pipeline Comercial</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipeline.stages.map((s: any) => (
          <div key={s.id} className="bg-slate-100 rounded-lg p-3 min-w-[240px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => move(e.dataTransfer.getData('opp'), s.id)}>
            <div className="font-semibold text-sm mb-1">{s.name}</div>
            <div className="text-xs text-slate-500 mb-3">{s.opportunities.length} · {fmt(s.opportunities.reduce((a: number, o: any) => a + o.value, 0))}</div>
            {s.opportunities.map((o: any) => (
              <div key={o.id} draggable onDragStart={(e) => e.dataTransfer.setData('opp', o.id)} className="bg-white rounded shadow p-3 mb-2 text-sm cursor-move">
                <div className="font-medium">{o.title}</div>
                <div className="text-slate-500">{fmt(o.value)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
