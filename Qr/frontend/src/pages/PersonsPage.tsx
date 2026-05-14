// Página de gestión de personas con tabla, filtros y descarga de QR
import { useState, useEffect } from 'react';
import { Download, Pencil, Plus, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { Person } from '@/types';
import { usePersons, useUpdatePerson } from '@/hooks/usePersons';
import { personsService } from '@/services/persons';
import { PersonForm } from '@/components/PersonForm';

// Hook de debounce para la búsqueda por nombre
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  );
}

const TIPO_BADGE: Record<string, string> = {
  empleado: 'bg-blue-500/15 text-blue-400',
  visitante: 'bg-emerald-500/15 text-emerald-400',
  contratista: 'bg-amber-500/15 text-amber-400',
};

interface ModalState {
  open: boolean;
  person: Person | null;
}

export function PersonsPage() {
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [activoFilter, setActivoFilter] = useState('');
  const [modal, setModal] = useState<ModalState>({ open: false, person: null });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch || undefined,
    tipo: tipoFilter || undefined,
    activo: activoFilter || undefined,
  };

  const { data: persons, isLoading, isError } = usePersons(filters);
  const updatePerson = useUpdatePerson();

  function openCreate() {
    setModal({ open: true, person: null });
  }

  function openEdit(person: Person) {
    setModal({ open: true, person });
  }

  function closeModal() {
    setModal({ open: false, person: null });
  }

  async function handleDownloadQr(person: Person) {
    setDownloadingId(person.id);
    try {
      const response = await personsService.downloadQr(person.id);
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${person.nombre.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // El interceptor de Axios ya maneja el 401; otros errores se ignoran silenciosamente
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleToggleActivo(person: Person) {
    await updatePerson.mutateAsync({
      id: person.id,
      data: { activo: !person.activo },
    });
  }

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Personas</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Empleados, visitantes y contratistas registrados
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Nueva persona
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="input-base pl-9"
          />
        </div>

        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="input-base w-44"
        >
          <option value="">Todos los tipos</option>
          <option value="empleado">Empleado</option>
          <option value="visitante">Visitante</option>
          <option value="contratista">Contratista</option>
        </select>

        <select
          value={activoFilter}
          onChange={(e) => setActivoFilter(e.target.value)}
          className="input-base w-40"
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-bg-card border border-white/[0.07] rounded-card overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-text-secondary text-sm">Cargando...</div>
        ) : isError ? (
          <div className="py-16 text-center text-error text-sm">
            Error al cargar los datos. Intente de nuevo.
          </div>
        ) : !persons || persons.length === 0 ? (
          <div className="py-16 text-center text-text-secondary text-sm">
            No se encontraron personas con los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left text-text-secondary text-xs font-medium px-5 py-3">
                  Nombre
                </th>
                <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                  Tipo
                </th>
                <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                  Estado
                </th>
                <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                  Registrado
                </th>
                <th className="text-right text-text-secondary text-xs font-medium px-5 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {persons.map((person) => (
                <tr
                  key={person.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  {/* Nombre */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                        {person.foto_url ? (
                          <img
                            src={person.foto_url}
                            alt={person.nombre}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-accent text-xs font-semibold">
                            {person.nombre.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${person.activo ? 'text-text-primary' : 'text-text-secondary line-through'}`}
                      >
                        {person.nombre}
                      </span>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`badge capitalize ${TIPO_BADGE[person.tipo] ?? 'bg-white/10 text-text-secondary'}`}
                    >
                      {person.tipo}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`badge ${person.activo ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
                    >
                      {person.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3.5 text-text-secondary text-sm">
                    {formatDate(person.created_at)}
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {/* Editar */}
                      <button
                        onClick={() => openEdit(person)}
                        title="Editar"
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/[0.06] rounded-component transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Descargar QR */}
                      <button
                        onClick={() => handleDownloadQr(person)}
                        disabled={downloadingId === person.id}
                        title="Descargar QR"
                        className="p-1.5 text-text-secondary hover:text-accent hover:bg-accent-light rounded-component transition-colors disabled:opacity-40"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Activar / Desactivar */}
                      <button
                        onClick={() => handleToggleActivo(person)}
                        title={person.activo ? 'Desactivar' : 'Activar'}
                        className={`p-1.5 rounded-component transition-colors ${
                          person.activo
                            ? 'text-success hover:bg-success/10'
                            : 'text-error hover:bg-error/10'
                        }`}
                      >
                        {person.activo ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Contador */}
      {persons && persons.length > 0 && (
        <p className="text-text-secondary text-xs mt-3">
          {persons.length} {persons.length === 1 ? 'persona' : 'personas'} encontradas
        </p>
      )}

      {/* Modal */}
      {modal.open && <PersonForm person={modal.person} onClose={closeModal} />}
    </div>
  );
}
