// Página de gestión de puertas: CRUD completo con modal de creación/edición
import { useState } from 'react';
import { DoorOpen, Pencil, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Door } from '@/types';
import {
  useAllDoors,
  useCreateDoor,
  useUpdateDoor,
  useToggleDoor,
  useDeleteDoor,
} from '@/hooks/useDoors';

// ─── Modal de crear / editar ──────────────────────────────────────────────────

interface DoorFormProps {
  door: Door | null;
  onClose: () => void;
}

function DoorModal({ door, onClose }: DoorFormProps) {
  const [nombre, setNombre] = useState(door?.nombre ?? '');
  const [ubicacion, setUbicacion] = useState(door?.ubicacion ?? '');
  const [error, setError] = useState('');

  const createDoor = useCreateDoor();
  const updateDoor = useUpdateDoor();
  const isPending = createDoor.isPending || updateDoor.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const data = { nombre: nombre.trim(), ubicacion: ubicacion.trim() };
    if (!data.nombre || !data.ubicacion) {
      setError('Todos los campos son requeridos.');
      return;
    }

    try {
      if (door) {
        await updateDoor.mutateAsync({ id: door.id, data });
      } else {
        await createDoor.mutateAsync(data);
      }
      onClose();
    } catch {
      setError('Ocurrió un error. Intente de nuevo.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-white/[0.08] rounded-card w-full max-w-sm mx-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-text-primary font-semibold text-sm">
            {door ? 'Editar puerta' : 'Nueva puerta'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-text-secondary text-xs mb-1.5">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Entrada principal"
              className="input-base w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-text-secondary text-xs mb-1.5">Ubicación</label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Planta baja, ala norte"
              className="input-base w-full"
            />
          </div>

          {error && <p className="text-error text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : door ? 'Guardar cambios' : 'Crear puerta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

interface ModalState {
  open: boolean;
  door: Door | null;
}

export function DoorsPage() {
  const [modal, setModal] = useState<ModalState>({ open: false, door: null });
  const [deleteError, setDeleteError] = useState<{ id: string; msg: string } | null>(null);

  const { data: doors = [], isLoading, isError } = useAllDoors();
  const toggleDoor = useToggleDoor();
  const deleteDoor = useDeleteDoor();

  function openCreate() {
    setModal({ open: true, door: null });
  }

  function openEdit(door: Door) {
    setModal({ open: true, door });
  }

  function closeModal() {
    setModal({ open: false, door: null });
  }

  async function handleDelete(door: Door) {
    setDeleteError(null);
    try {
      await deleteDoor.mutateAsync(door.id);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo eliminar la puerta.';
      setDeleteError({ id: door.id, msg });
    }
  }

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Puertas</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Puntos de acceso registrados en el sistema
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Nueva puerta
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-bg-card border border-white/[0.07] rounded-card overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-text-secondary text-sm">Cargando...</div>
        ) : isError ? (
          <div className="py-16 text-center text-error text-sm">
            Error al cargar los datos. Intente de nuevo.
          </div>
        ) : doors.length === 0 ? (
          <div className="py-16 text-center">
            <DoorOpen className="w-8 h-8 text-text-secondary mx-auto mb-2" />
            <p className="text-text-secondary text-sm">No hay puertas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="text-left text-text-secondary text-xs font-medium px-5 py-3">
                  Nombre
                </th>
                <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                  Ubicación
                </th>
                <th className="text-left text-text-secondary text-xs font-medium px-4 py-3">
                  Estado
                </th>
                <th className="text-right text-text-secondary text-xs font-medium px-5 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {doors.map((door) => (
                <>
                  <tr
                    key={door.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Nombre */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-component bg-bg-secondary border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                          <DoorOpen className="w-3.5 h-3.5 text-text-secondary" />
                        </div>
                        <span
                          className={`text-sm font-medium ${door.activa ? 'text-text-primary' : 'text-text-secondary line-through'}`}
                        >
                          {door.nombre}
                        </span>
                      </div>
                    </td>

                    {/* Ubicación */}
                    <td className="px-4 py-3.5 text-text-secondary text-sm">
                      {door.ubicacion}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`badge ${door.activa ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
                      >
                        {door.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Editar */}
                        <button
                          onClick={() => openEdit(door)}
                          title="Editar"
                          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-white/[0.06] rounded-component transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Activar / Desactivar */}
                        <button
                          onClick={() => toggleDoor.mutate(door.id)}
                          title={door.activa ? 'Desactivar' : 'Activar'}
                          className={`p-1.5 rounded-component transition-colors ${
                            door.activa
                              ? 'text-success hover:bg-success/10'
                              : 'text-text-secondary hover:text-success hover:bg-success/10'
                          }`}
                        >
                          {door.activa ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => handleDelete(door)}
                          title="Eliminar"
                          className="p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-component transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Error de eliminación inline */}
                  {deleteError?.id === door.id && (
                    <tr key={`${door.id}-err`} className="bg-error/5">
                      <td colSpan={4} className="px-5 py-2 text-error text-xs">
                        {deleteError.msg}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {doors.length > 0 && (
        <p className="text-text-secondary text-xs mt-3">
          {doors.length} {doors.length === 1 ? 'puerta' : 'puertas'} registradas ·{' '}
          {doors.filter((d) => d.activa).length} activas
        </p>
      )}

      {/* Modal */}
      {modal.open && <DoorModal door={modal.door} onClose={closeModal} />}
    </div>
  );
}
