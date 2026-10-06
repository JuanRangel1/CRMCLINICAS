'use client';
import CrudPage from '../../lib/CrudPage';

export default function FollowUpsPage() {
  return (
    <CrudPage
      title="Follow-ups"
      endpoint="/followups"
      fields={[{ name: 'title', label: 'Título' }, { name: 'dueDate', label: 'Vencimento', type: 'datetime-local' }, { name: 'patientId', label: 'ID Paciente' }]}
      columns={[
        { key: 'title', label: 'Título' },
        { key: 'dueDate', label: 'Vencimento', format: (r) => new Date(r.dueDate).toLocaleDateString('pt-BR') },
        { key: 'done', label: 'Concluído', format: (r) => (r.done ? 'Sim' : 'Não') },
      ]}
    />
  );
}
