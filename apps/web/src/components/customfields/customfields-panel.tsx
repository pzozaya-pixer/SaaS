import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Eye, Calendar, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';

interface CustomField {
  id: string;
  targetEntity: string;
  label: string;
  internalName: string;
  description: string | null;
  type: string;
  isRequired: boolean;
  validationRegex: string | null;
  createdAt: string;
}

export function CustomFieldsPanel() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('CONTACT');
  const [loading, setLoading] = useState(false);

  // Form State for new Custom Field
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fieldLabel, setFieldLabel] = useState('');
  const [internalName, setInternalName] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [fieldDesc, setFieldDesc] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [validationRegex, setValidationRegex] = useState('');
  const [creatingField, setCreatingField] = useState(false);

  useEffect(() => {
    fetchFields(selectedEntity);
  }, [selectedEntity]);

  const fetchFields = async (entity: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/custom-fields?targetEntity=${entity}`, {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch custom fields');
      const data = await res.json();
      setFields(data);
    } catch (err) {
      console.error(err);
      setMockFields(entity);
    } finally {
      setLoading(false);
    }
  };

  const setMockFields = (entity: string) => {
    if (entity === 'CONTACT') {
      setFields([
        {
          id: 'field-1',
          targetEntity: 'CONTACT',
          label: 'NIF/CIF',
          internalName: 'nif_cif',
          description: 'Identificador fiscal del contacto',
          type: 'TEXT',
          isRequired: true,
          validationRegex: '^[0-9]{8}[A-Z]$',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'field-2',
          targetEntity: 'CONTACT',
          label: 'Fecha de Aniversario',
          internalName: 'anniversary_date',
          description: 'Fecha de cumpleaños o fundación',
          type: 'DATE',
          isRequired: false,
          validationRegex: null,
          createdAt: new Date().toISOString(),
        },
      ]);
    } else {
      setFields([
        {
          id: 'field-3',
          targetEntity: 'PET',
          label: 'Instrucciones de Dieta',
          internalName: 'diet_instructions',
          description: 'Alergias o comida especial',
          type: 'TEXT',
          isRequired: true,
          validationRegex: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'field-4',
          targetEntity: 'PET',
          label: 'Estado Vacunación',
          internalName: 'vaccination_status',
          description: 'Cartilla de vacunas al día',
          type: 'BOOLEAN',
          isRequired: false,
          validationRegex: null,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const createField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim() || !internalName.trim()) return;

    setCreatingField(true);
    const payload = {
      targetEntity: selectedEntity,
      label: fieldLabel,
      internalName: internalName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      type: fieldType,
      description: fieldDesc,
      isRequired,
      validationRegex: validationRegex.trim() || null,
    };

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/custom-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create custom field');

      setShowCreateModal(false);
      setFieldLabel('');
      setInternalName('');
      setFieldDesc('');
      setIsRequired(false);
      setValidationRegex('');
      fetchFields(selectedEntity);
    } catch (err) {
      // Fallback local
      const newMock: CustomField = {
        id: `field-${Math.random()}`,
        targetEntity: selectedEntity,
        label: fieldLabel,
        internalName: internalName.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        description: fieldDesc || 'Sin descripción',
        type: fieldType,
        isRequired,
        validationRegex: validationRegex.trim() || null,
        createdAt: new Date().toISOString(),
      };
      setFields((prev) => [newMock, ...prev]);
      setShowCreateModal(false);
      setFieldLabel('');
      setInternalName('');
      setFieldDesc('');
      setIsRequired(false);
      setValidationRegex('');
    } finally {
      setCreatingField(false);
    }
  };

  const deleteField = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este campo personalizado? Los datos asociados de la organización también se borrarán.')) return;
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      await fetch(`http://localhost:4000/api/v1/custom-fields/${id}`, {
        method: 'DELETE',
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchFields(selectedEntity);
    } catch (err) {
      setFields((prev) => prev.filter((f) => f.id !== id));
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 animate-fade-in">
      
      {/* SECCIÓN ENTIDADES (COL 4) */}
      <div className="col-span-12 md:col-span-4 bg-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between min-h-[450px]">
        <div className="space-y-4">
          <h3 className="font-bold text-white text-md flex items-center gap-2">
            <Database className="w-5 h-5 text-secondary" />
            <span>Módulos del Sistema</span>
          </h3>
          <p className="text-xs text-slate-400">Selecciona el módulo para ver y añadir campos definidos</p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setSelectedEntity('CONTACT')}
              className={`w-full p-3 rounded-2xl border text-left font-semibold text-xs transition ${
                selectedEntity === 'CONTACT'
                  ? 'bg-slate-900 border-primary text-white shadow-md shadow-primary/5'
                  : 'border-slate-850 bg-slate-950 hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
              }`}
            >
              💼 Contacto CRM (CONTACT)
            </button>

            <button
              onClick={() => setSelectedEntity('PET')}
              className={`w-full p-3 rounded-2xl border text-left font-semibold text-xs transition ${
                selectedEntity === 'PET'
                  ? 'bg-slate-900 border-primary text-white shadow-md shadow-primary/5'
                  : 'border-slate-850 bg-slate-950 hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
              }`}
            >
              🐕 Mascota de Residencia (PET)
            </button>
          </div>
        </div>
      </div>

      {/* DETALLES DE CAMPOS (COL 8) */}
      <div className="col-span-12 md:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 p-6 space-y-6 min-h-[450px] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <div>
              <h3 className="font-bold text-white text-md">Campos Personalizados Activos</h3>
              <p className="text-xs text-slate-400 mt-1">Definición de campos inyectados en {selectedEntity}</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-primary-foreground transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Campo</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : fields.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
              <AlertCircle className="w-5 h-5 text-slate-600" />
              <span>No hay campos personalizados configurados para esta entidad.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div
                  key={f.id}
                  className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between gap-3 group hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-xs">{f.label}</span>
                      <button
                        onClick={() => deleteField(f.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">Clave: {f.internalName}</p>
                    <p className="text-[10px] text-slate-400">{f.description || 'Sin descripción'}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-850">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-900 text-slate-400 uppercase">
                      {f.type}
                    </span>
                    {f.isRequired && (
                      <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Requerido
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREAR CAMPO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Añadir Campo Personalizado</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={createField} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Etiqueta Visual (Label)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cédula Identidad"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Nombre Interno (Clave BD)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. cedula_id"
                  value={internalName}
                  onChange={(e) => setInternalName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Tipo de Campo</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                >
                  <option value="TEXT">Texto (TEXT)</option>
                  <option value="NUMBER">Número (NUMBER)</option>
                  <option value="DATE">Fecha (DATE)</option>
                  <option value="BOOLEAN">Booleano (BOOLEAN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Descripción (Ayuda)</label>
                <input
                  type="text"
                  placeholder="Instrucciones breves..."
                  value={fieldDesc}
                  onChange={(e) => setFieldDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Campo Obligatorio (Requerido)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRequired}
                    onChange={(e) => setIsRequired(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-450 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Regla Regex de Validación (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. ^[0-9]{9}$"
                  value={validationRegex}
                  onChange={(e) => setValidationRegex(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingField}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {creatingField && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
