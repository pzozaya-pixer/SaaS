import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Eye, Link2, Calendar, User, Globe, AlertCircle, Loader2 } from 'lucide-react';

interface FormDefinition {
  id: string;
  name: string;
  description: string | null;
  targetEntity: string;
  isPublic: boolean;
  publicToken: string;
  expirationDate: string | null;
  createdAt: string;
}

interface FormSubmission {
  id: string;
  submittedAt: string;
  ipAddress: string;
  userAgent: string;
  payload: any;
}

export function FormsPanel() {
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Form State for new Form Definition
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [targetEntity, setTargetEntity] = useState('CONTACT');
  const [isPublic, setIsPublic] = useState(true);
  const [creatingForm, setCreatingForm] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoadingForms(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/forms', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch forms');
      const data = await res.json();
      setForms(data);
      if (data.length > 0) {
        setSelectedForm(data[0]);
        fetchSubmissions(data[0].id);
      } else {
        setMockForms();
      }
    } catch (err) {
      console.error(err);
      setMockForms();
    } finally {
      setLoadingForms(false);
    }
  };

  const fetchSubmissions = async (formId: string) => {
    setLoadingSubmissions(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/forms/${formId}/submissions`, {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data = await res.json();
      setSubmissions(data);
      if (data.length > 0) {
        setSelectedSubmission(data[0]);
      } else {
        setSubmissions([]);
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error(err);
      setMockSubmissions();
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const setMockForms = () => {
    const mock = [
      {
        id: 'form-1',
        name: 'Formulario de Admisión de Mascotas',
        description: 'Ficha pública para registro de mascotas',
        targetEntity: 'PET',
        isPublic: true,
        publicToken: 'pet-admission-token-9988',
        expirationDate: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'form-2',
        name: 'Contacto General Web',
        description: 'Formulario de contacto básico para landing page',
        targetEntity: 'CONTACT',
        isPublic: true,
        publicToken: 'contact-general-token-1122',
        expirationDate: null,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
    setForms(mock);
    setSelectedForm(mock[0]);
    setMockSubmissions();
  };

  const setMockSubmissions = () => {
    setSubmissions([
      {
        id: 'sub-1',
        submittedAt: new Date().toISOString(),
        ipAddress: '192.168.1.15',
        userAgent: 'Chrome / macOS',
        payload: {
          firstName: 'Bruce',
          lastName: 'Wayne',
          email: 'bruce@waynecorp.com',
          petName: 'Ace',
          breed: 'Bat-hound',
          age: 4,
          notes: 'Alimentación especial dos veces al día',
        },
      },
      {
        id: 'sub-2',
        submittedAt: new Date(Date.now() - 300000).toISOString(),
        ipAddress: '84.120.35.41',
        userAgent: 'Safari / iOS',
        payload: {
          firstName: 'Selina',
          lastName: 'Kyle',
          email: 'selina@gotham.cat',
          petName: 'Isis',
          breed: 'Black Cat',
          age: 2,
          notes: 'Ninguna alergia reportada.',
        },
      },
    ]);
    setSelectedSubmission({
      id: 'sub-1',
      submittedAt: new Date().toISOString(),
      ipAddress: '192.168.1.15',
      userAgent: 'Chrome / macOS',
      payload: {
        firstName: 'Bruce',
        lastName: 'Wayne',
        email: 'bruce@waynecorp.com',
        petName: 'Ace',
        breed: 'Bat-hound',
        age: 4,
        notes: 'Alimentación especial dos veces al día',
      },
    });
  };

  const handleFormSelect = (form: FormDefinition) => {
    setSelectedForm(form);
    if (form.id === 'form-1' || form.id === 'form-2') {
      setMockSubmissions();
    } else {
      fetchSubmissions(form.id);
    }
  };

  const createForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setCreatingForm(true);
    const payload = {
      name: formName,
      description: formDescription,
      targetEntity,
      isPublic,
      structure: {
        fields: ['firstName', 'lastName', 'email', 'phone', 'notes'],
      },
      expirationDate: new Date(Date.now() + 3600000 * 24 * 30).toISOString(), // 30 días de validez por defecto
    };

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create form');
      
      setShowCreateModal(false);
      setFormName('');
      setFormDescription('');
      fetchForms();
    } catch (err) {
      // Simulación local si falla
      const mockNewForm: FormDefinition = {
        id: `form-${Math.random()}`,
        name: formName,
        description: formDescription || 'Sin descripción',
        targetEntity,
        isPublic,
        publicToken: `custom-token-${Math.floor(Math.random() * 10000)}`,
        expirationDate: null,
        createdAt: new Date().toISOString(),
      };
      setForms((prev) => [mockNewForm, ...prev]);
      setSelectedForm(mockNewForm);
      setSubmissions([]);
      setSelectedSubmission(null);
      setShowCreateModal(false);
    } finally {
      setCreatingForm(false);
    }
  };

  const deleteForm = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este formulario y sus envíos permanentemente?')) return;
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      await fetch(`http://localhost:4000/api/v1/forms/${id}`, {
        method: 'DELETE',
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchForms();
    } catch (err) {
      setForms((prev) => prev.filter((f) => f.id !== id));
      if (selectedForm?.id === id) {
        setSelectedForm(null);
        setSubmissions([]);
        setSelectedSubmission(null);
      }
    }
  };

  const getPublicLink = (token: string) => {
    return `http://localhost:4000/api/v1/forms/public/${token}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('¡Enlace público copiado al portapapeles!');
  };

  return (
    <div className="grid grid-cols-12 gap-6 animate-fade-in">
      
      {/* COLUMNA IZQUIERDA: LISTADO DE FORMULARIOS */}
      <div className="col-span-12 md:col-span-4 bg-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between min-h-[500px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-md flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              <span>Diseños de Formularios</span>
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1.5 bg-primary rounded-lg text-primary-foreground hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {loadingForms ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : forms.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-8">No hay formularios creados.</p>
            ) : (
              forms.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleFormSelect(f)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex justify-between items-start group ${
                    selectedForm?.id === f.id
                      ? 'bg-slate-900 border-primary'
                      : 'border-slate-850 bg-slate-950 hover:bg-slate-900/30'
                  }`}
                >
                  <div className="space-y-1 truncate pr-2">
                    <h4 className="font-semibold text-white text-xs truncate">{f.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{f.description || 'Sin descripción'}</p>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                      {f.targetEntity}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteForm(f.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: RESPUESTAS RECIBIDAS (SUBMISSIONS) */}
      <div className="col-span-12 md:col-span-8 space-y-6">
        
        {/* DETALLE Y ENLACE DE FORMULARIO SELECCIONADO */}
        {selectedForm && (
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <span>{selectedForm.name}</span>
                  {selectedForm.isPublic && (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      <Globe className="w-2.5 h-2.5" /> Público
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{selectedForm.description || 'Ficha de recogida de datos'}</p>
              </div>

              {selectedForm.isPublic && (
                <button
                  onClick={() => copyToClipboard(getPublicLink(selectedForm.publicToken))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all active:scale-95"
                >
                  <Link2 className="w-3.5 h-3.5 text-secondary" />
                  <span>Copiar Enlace Público</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TABLA DE RESPUESTAS & VISOR */}
        {selectedForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LISTA DE SUBMISSIONS */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between min-h-[400px]">
              <div className="p-4 border-b border-slate-800">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Envíos Recibidos ({submissions.length})</span>
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[350px]">
                {loadingSubmissions ? (
                  <div className="py-12 flex justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-slate-600" />
                    <span>No hay respuestas registradas para este formulario.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-850">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className={`p-4 cursor-pointer transition flex items-center justify-between ${
                          selectedSubmission?.id === sub.id
                            ? 'bg-slate-900'
                            : 'hover:bg-slate-900/30'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-200 text-xs">
                            {sub.payload.petName || sub.payload.firstName || 'Envío Anónimo'}
                          </p>
                          <span className="text-[10px] text-slate-500 block">IP: {sub.ipAddress}</span>
                        </div>
                        <span className="text-[9px] text-slate-500">
                          {new Date(sub.submittedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* VISOR DE DETALLES DEL ENVÍO */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between min-h-[400px]">
              {selectedSubmission ? (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Detalles del Envío</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Fecha: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {Object.entries(selectedSubmission.payload).map(([key, val]: [string, any]) => (
                      <div key={key} className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase block tracking-wider mb-0.5">{key}</span>
                        <span className="text-xs text-slate-200 font-medium">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
                  <Eye className="w-8 h-8 text-slate-600 mb-2" />
                  <span>Selecciona un envío para ver las respuestas completas</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-slate-600" />
            <span>Selecciona un formulario a la izquierda o crea uno nuevo para empezar</span>
          </div>
        )}
      </div>

      {/* MODAL: CREAR FORMULARIO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Diseñar Nuevo Formulario</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={createForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Nombre del Formulario</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Admisión Hotel Canino"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Descripción</label>
                <textarea
                  placeholder="Instrucciones para el cliente..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700 h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Entidad Destino</label>
                <select
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                >
                  <option value="CONTACT">Contacto (CRM)</option>
                  <option value="PET">Mascota (Plugin Residencia)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Habilitar Link Público</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-450 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
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
                  disabled={creatingForm}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {creatingForm && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
