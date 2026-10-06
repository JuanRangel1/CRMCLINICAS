'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections: { title?: string; items: { href: string; label: string }[] }[] = [
  { items: [{ href: '/', label: 'Dashboard' }] },
  { title: 'CRM', items: [
    { href: '/leads', label: 'Leads' },
    { href: '/patients', label: 'Pacientes' },
    { href: '/pipeline', label: 'Pipeline' },
    { href: '/followups', label: 'Follow-ups' },
  ] },
  { title: 'Agenda', items: [
    { href: '/appointments', label: 'Consultas' },
    { href: '/professionals', label: 'Profissionais' },
    { href: '/rooms', label: 'Salas' },
  ] },
  { title: 'Clínica', items: [
    { href: '/treatments', label: 'Tratamentos' },
    { href: '/procedures', label: 'Procedimentos' },
    { href: '/budgets', label: 'Orçamentos' },
    { href: '/satisfaction', label: 'Avaliações' },
  ] },
  { title: 'Financeiro', items: [
    { href: '/financial', label: 'Receitas/Despesas' },
    { href: '/commissions', label: 'Comissões' },
  ] },
  { items: [
    { href: '/reports', label: 'Relatórios' },
    { href: '/intelligence', label: 'Inteligência' },
    { href: '/settings', label: 'Configurações' },
  ] },
  { title: 'Super Admin', items: [
    { href: '/admin/clinics', label: 'Clínicas' },
    { href: '/admin/users', label: 'Usuários' },
    { href: '/admin/plans', label: 'Planos' },
    { href: '/admin/audit', label: 'Auditoria' },
  ] },
];

export default function Sidebar() {
  const path = usePathname();
  if (path === '/login') return null;
  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-200 min-h-screen p-4 hidden md:block">
      <div className="text-xl font-bold text-white mb-6">CRM Clínicas</div>
      {sections.map((s, i) => (
        <div key={i} className="mb-4">
          {s.title && <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">{s.title}</div>}
          {s.items.map((it) => (
            <Link key={it.href} href={it.href} className={`block rounded px-3 py-2 text-sm mb-0.5 ${path === it.href ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60'}`}>
              {it.label}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );
}
