'use client';
import CrudPage from '../../lib/CrudPage';

export default function ProfessionalsPage() {
  return (
    <CrudPage
      title="Profissionais"
      endpoint="/professionals"
      fields={[{ name: 'name', label: 'Nome' }, { name: 'email', label: 'E-mail' }, { name: 'council', label: 'Conselho' }, { name: 'registryNumber', label: 'Registro' }]}
      columns={[{ key: 'name', label: 'Nome' }, { key: 'council', label: 'Conselho' }, { key: 'registryNumber', label: 'Registro' }, { key: 'status', label: 'Status' }]}
    />
  );
}
