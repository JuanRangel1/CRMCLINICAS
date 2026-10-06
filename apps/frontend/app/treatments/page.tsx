'use client';
import CrudPage from '../../lib/CrudPage';

export default function TreatmentsPage() {
  return (
    <CrudPage
      title="Tratamentos"
      endpoint="/treatments"
      fields={[{ name: 'name', label: 'Nome' }, { name: 'value', label: 'Valor', type: 'number' }, { name: 'patientId', label: 'ID Paciente' }, { name: 'professionalId', label: 'ID Profissional' }]}
      columns={[{ key: 'name', label: 'Nome' }, { key: 'status', label: 'Status' }, { key: 'value', label: 'Valor', format: (r) => `R$ ${r.value}` }]}
    />
  );
}
