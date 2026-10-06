'use client';
import CrudPage from '../../lib/CrudPage';

export default function PatientsPage() {
  return (
    <CrudPage
      title="Pacientes"
      endpoint="/patients"
      fields={[
        { name: 'name', label: 'Nome' },
        { name: 'email', label: 'E-mail' },
        { name: 'phone', label: 'Telefone' },
        { name: 'cpf', label: 'CPF' },
      ]}
      columns={[
        { key: 'name', label: 'Nome' },
        { key: 'email', label: 'E-mail' },
        { key: 'phone', label: 'Telefone' },
        { key: 'createdAt', label: 'Cadastro', format: (r) => new Date(r.createdAt).toLocaleDateString('pt-BR') },
      ]}
    />
  );
}
