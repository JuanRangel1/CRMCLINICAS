'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [clinic, setClinic] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [msg, setMsg] = useState('');
  useEffect(() => {
    api('/auth/me').then((u) => { setUser(u); if (u.clinicId) api(`/clinics/${u.clinicId}`).then(setClinic); });
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api(`/clinics/${user.clinicId}`, { method: 'PUT', body: JSON.stringify(form) });
    setMsg('Salvo!');
  }
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      {user && <p className="mb-4 text-slate-600">Logado como <b>{user.name}</b> ({user.role})</p>}
      {clinic && (
        <form onSubmit={save} className="bg-white rounded-lg shadow p-4 grid md:grid-cols-2 gap-3 max-w-2xl">
          {['name', 'email', 'phone', 'whatsapp', 'city', 'state', 'address'].map((f) => (
            <input key={f} placeholder={f} className="border rounded p-2 text-sm" defaultValue={clinic[f] ?? ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
          ))}
          <button className="bg-slate-900 text-white rounded p-2 text-sm">Salvar</button>
          {msg && <div className="text-green-700 text-sm">{msg}</div>}
        </form>
      )}
    </div>
  );
}
