'use client';
import CrudPage from '../../lib/CrudPage';

export default function RoomsPage() {
  return (
    <CrudPage
      title="Salas"
      endpoint="/rooms"
      fields={[{ name: 'name', label: 'Nome da sala' }]}
      columns={[{ key: 'name', label: 'Nome' }]}
    />
  );
}
