// Modal de creación y edición de personas
import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { Person, PersonFormData } from '@/types';
import { useCreatePerson, useUpdatePerson } from '@/hooks/usePersons';

interface PersonFormProps {
  person: Person | null;
  onClose: () => void;
}

const TIPO_OPTIONS: PersonFormData['tipo'][] = ['empleado', 'visitante', 'contratista'];

export function PersonForm({ person, onClose }: PersonFormProps) {
  const isEdit = person !== null;
  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();

  const [nombre, setNombre] = useState(person?.nombre ?? '');
  const [tipo, setTipo] = useState<PersonFormData['tipo']>(person?.tipo ?? 'empleado');
  const [fotoUrl, setFotoUrl] = useState(person?.foto_url ?? '');
  const [activo, setActivo] = useState(person?.activo ?? true);
  const [error, setError] = useState('');

  const isLoading = createPerson.isPending || updatePerson.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const data: Partial<PersonFormData> = {
      nombre,
      tipo,
      foto_url: fotoUrl.trim() || null,
    };

    try {
      if (isEdit) {
        await updatePerson.mutateAsync({ id: person.id, data: { ...data, activo } });
      } else {
        await createPerson.mutateAsync(data as Omit<PersonFormData, 'activo'>);
      }
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al guardar los datos. Intente de nuevo.');
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card border border-white/[0.07] rounded-card w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-text-primary font-medium">
            {isEdit ? 'Editar persona' : 'Nueva persona'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          <div>
            <label className="block text-text-secondary text-xs mb-1.5">
              Nombre completo <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-base"
              placeholder="Ej: Juan García"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-text-secondary text-xs mb-1.5">
              Tipo <span className="text-error">*</span>
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as PersonFormData['tipo'])}
              className="input-base"
              required
            >
              {TIPO_OPTIONS.map((t) => (
                <option key={t} value={t} className="bg-bg-secondary capitalize">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-text-secondary text-xs mb-1.5">
              URL de foto <span className="text-text-secondary">(opcional)</span>
            </label>
            <input
              type="url"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              className="input-base"
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="activo"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 accent-[#8b5cf6] rounded"
              />
              <label htmlFor="activo" className="text-text-secondary text-sm cursor-pointer">
                Persona activa
              </label>
            </div>
          )}

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-component px-3 py-2 text-error text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
