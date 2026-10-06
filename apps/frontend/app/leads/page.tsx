'use client';
import CrudPage from '../../lib/CrudPage';

export default function LeadsPage() {
  return (
    <CrudPage
      title="Leads"
      endpoint="/leads"
      fields={[{ name: 'name', label: 'Nome' }, { name: 'email', label: 'E-mail' }, { name: 'phone', label: 'Telefone' }, { name: 'interest', label: 'Interesse' }]}
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'status', label: 'Status' },
        { key: 'score', label: 'Score' },
        { key: 'createdAt', label: 'Criado', format: (r) => new Date(r.createdAt).toLocaleDateString('pt-BR') },
      ]}
    />
  );
}
