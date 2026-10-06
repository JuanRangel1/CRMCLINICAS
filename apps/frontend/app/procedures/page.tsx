'use client';
import CrudPage from '../../lib/CrudPage';

export default function ProceduresPage() {
  return (
    <CrudPage
      title="Procedimentos"
      endpoint="/procedures"
      fields={[
        { name: 'name', label: 'Nome' },
        { name: 'category', label: 'Categoria' },
        { name: 'durationMin', label: 'Duração (min)', type: 'number' },
        { name: 'price', label: 'Preço', type: 'number' },
        { name: 'commission', label: 'Comissão %', type: 'number' },
      ]}
      columns={[{ key: 'name', label: 'Nome' }, { key: 'category', label: 'Categoria' }, { key: 'durationMin', label: 'Duração' }, { key: 'price', label: 'Preço', format: (r) => `R$ ${r.price}` }]}
    />
  );
}
