import React, { useState, useEffect } from 'react';
import { CalendarDays, AlertTriangle, Plus, ArrowRight, CheckCircle2, Shield, Settings, Loader2 } from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
  requiredFields: string[] | any;
}

interface KanbanRecord {
  id: string;
  title: string;
  stageId: string;
  values: any;
}

export function KanbanBoard() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [records, setRecords] = useState<KanbanRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Blocker Modal for missing transition fields
  const [activeCardForTransition, setActiveCardForTransition] = useState<KanbanRecord | null>(null);
  const [targetStageForTransition, setTargetStageForTransition] = useState<Stage | null>(null);
  const [transitionFieldsData, setTransitionFieldsData] = useState<Record<string, string>>({});
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Modales de creación
  const [showStageModal, setShowStageModal] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('blue');
  const [newStageRequired, setNewStageRequired] = useState('');
  const [creatingStage, setCreatingStage] = useState(false);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [newRecordAmount, setNewRecordAmount] = useState('');
  const [newRecordClient, setNewRecordClient] = useState('');
  const [newRecordPet, setNewRecordPet] = useState('');
  const [creatingRecord, setCreatingRecord] = useState(false);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/pipelines', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch pipelines');
      const data = await res.json();
      setPipelines(data);

      if (data.length > 0) {
        setSelectedPipeline(data[0]);
        fetchBoardDetails(data[0].id);
      } else {
        setMockData();
      }
    } catch (err) {
      console.error(err);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardDetails = async (pipelineId: string) => {
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const headers = {
        'x-organization-id': 'org-1',
        'Authorization': `Bearer ${token}`,
      };

      // Fetch stages
      const stagesRes = await fetch(`http://localhost:4000/api/v1/pipelines/${pipelineId}/stages`, { headers });
      const stagesData = await stagesRes.json();
      // Ordenar por campo order
      const sortedStages = (stagesData || []).sort((a: any, b: any) => a.order - b.order);
      setStages(sortedStages);

      // Fetch records (tarjetas)
      const recordsRes = await fetch(`http://localhost:4000/api/v1/pipelines/${pipelineId}/records`, { headers });
      const recordsData = await recordsRes.json();
      setRecords(recordsData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const setMockData = () => {
    setPipelines([{ id: 'mock-pipe', name: 'Reservas Residencia' }]);
    setSelectedPipeline({ id: 'mock-pipe', name: 'Reservas Residencia' });
    setStages([
      { id: 's1', name: 'Solicitado', color: 'blue', order: 1, requiredFields: [] },
      { id: 's2', name: 'Confirmado', color: 'emerald', order: 2, requiredFields: ['checkIn', 'checkOut'] },
      { id: 's3', name: 'Estancia Activa', color: 'amber', order: 3, requiredFields: [] },
      { id: 's4', name: 'Finalizado', color: 'slate', order: 4, requiredFields: [] },
    ]);
    setRecords([
      { id: 'c1', title: 'Estancia Toby (Labrador)', stageId: 's1', values: { client: 'Laura Martínez', amount: 150, petName: 'Toby' } },
      { id: 'c2', title: 'Reserva Luna (Siamés)', stageId: 's2', values: { client: 'Carlos Mendoza', amount: 80, petName: 'Luna', checkIn: '2026-08-01', checkOut: '2026-08-07' } },
      { id: 'c3', title: 'Estancia Max (Pastor Alemán)', stageId: 's3', values: { client: 'Ana Gómez', amount: 220, petName: 'Max', checkIn: '2026-07-28', checkOut: '2026-08-05' } },
    ]);
  };

  const handlePipelineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pipeId = e.target.value;
    const pipe = pipelines.find((p) => p.id === pipeId);
    if (pipe) {
      setSelectedPipeline(pipe);
      if (pipeId === 'mock-pipe') {
        setMockData();
      } else {
        fetchBoardDetails(pipeId);
      }
    }
  };

  const triggerMove = (card: KanbanRecord, targetStage: Stage) => {
    const requiredFields = Array.isArray(targetStage.requiredFields)
      ? targetStage.requiredFields
      : typeof targetStage.requiredFields === 'string'
      ? JSON.parse(targetStage.requiredFields || '[]')
      : [];

    // Validar si el record ya tiene esos campos completos en "values"
    const missingFields = requiredFields.filter((field: string) => !card.values?.[field]);

    if (missingFields.length > 0) {
      // Blocker: Abrir modal de transición para ingresar los campos requeridos
      setActiveCardForTransition(card);
      setTargetStageForTransition(targetStage);
      
      const initialFieldsData: Record<string, string> = {};
      missingFields.forEach((field: string) => {
        initialFieldsData[field] = '';
      });
      setTransitionFieldsData(initialFieldsData);
      setTransitionError(`La etapa '${targetStage.name}' requiere completar los siguientes datos de la ficha.`);
      return;
    }

    // Si tiene todos, enviar directamente la transición
    executeTransition(card.id, targetStage.id, {});
  };

  const executeTransition = async (recordId: string, stageId: string, transitionData: any) => {
    if (!selectedPipeline) return;

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/pipelines/records/${recordId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetStageId: stageId,
          fields: transitionData,
        }),
      });

      if (!res.ok) throw new Error('Transition rejected');
      fetchBoardDetails(selectedPipeline.id);
      setActiveCardForTransition(null);
      setTargetStageForTransition(null);
    } catch (err) {
      // Simulación local para el mock
      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? { ...r, stageId, values: { ...r.values, ...transitionData } }
            : r
        )
      );
      setActiveCardForTransition(null);
      setTargetStageForTransition(null);
    }
  };

  const saveTransitionData = () => {
    if (!activeCardForTransition || !targetStageForTransition) return;

    // Validar que se ingresen los campos
    const emptyFields = Object.keys(transitionFieldsData).filter((k) => !transitionFieldsData[k].trim());
    if (emptyFields.length > 0) {
      alert('Debes completar todos los campos obligatorios para continuar.');
      return;
    }

    executeTransition(activeCardForTransition.id, targetStageForTransition.id, transitionFieldsData);
  };

  const addStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPipeline || !newStageName.trim()) return;

    setCreatingStage(true);
    // Parsear campos requeridos
    const reqFields = newStageRequired
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      name: newStageName,
      color: newStageColor,
      order: stages.length + 1,
      requiredFields: reqFields,
    };

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/pipelines/${selectedPipeline.id}/stages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create stage');
      fetchBoardDetails(selectedPipeline.id);
      setShowStageModal(false);
      setNewStageName('');
      setNewStageRequired('');
    } catch (err) {
      // Mock local
      const newMockStage: Stage = {
        id: `s-${Math.random()}`,
        name: newStageName,
        color: newStageColor,
        order: stages.length + 1,
        requiredFields: reqFields,
      };
      setStages((prev) => [...prev, newMockStage]);
      setShowStageModal(false);
    } finally {
      setCreatingStage(false);
    }
  };

  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPipeline || !newRecordTitle.trim()) return;

    setCreatingRecord(true);
    const payload = {
      title: newRecordTitle,
      stageId: stages[0]?.id || 's1',
      values: {
        amount: parseFloat(newRecordAmount) || 0,
        client: newRecordClient || 'Desconocido',
        petName: newRecordPet || '',
      },
    };

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/pipelines/${selectedPipeline.id}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create record');
      fetchBoardDetails(selectedPipeline.id);
      setShowRecordModal(false);
      setNewRecordTitle('');
      setNewRecordAmount('');
      setNewRecordClient('');
      setNewRecordPet('');
    } catch (err) {
      // Mock local
      const newMockRecord: KanbanRecord = {
        id: `c-${Math.random()}`,
        title: newRecordTitle,
        stageId: stages[0]?.id || 's1',
        values: {
          amount: parseFloat(newRecordAmount) || 0,
          client: newRecordClient,
          petName: newRecordPet,
        },
      };
      setRecords((prev) => [...prev, newMockRecord]);
      setShowRecordModal(false);
    } finally {
      setCreatingRecord(false);
    }
  };

  const getBadgeColor = (colorName: string) => {
    switch (colorName) {
      case 'blue':
        return 'bg-blue-500';
      case 'emerald':
      case 'green':
        return 'bg-emerald-500';
      case 'amber':
      case 'yellow':
        return 'bg-amber-500';
      case 'purple':
        return 'bg-purple-500';
      case 'red':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA KANBAN */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-secondary" />
            <span>Fichas y Kanban Dinámico</span>
          </h2>
          <p className="text-xs text-slate-400">Diseña embudos de conversión, configura transiciones y gestiona tarjetas</p>
        </div>

        <div className="flex gap-3">
          {pipelines.length > 1 && (
            <select
              value={selectedPipeline?.id || ''}
              onChange={handlePipelineChange}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-slate-700"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowStageModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Nueva Etapa</span>
          </button>

          <button
            onClick={() => setShowRecordModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-primary-foreground transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Ficha</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        /* GRID DE COLUMNAS (ETAPAS) */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
          {stages.map((stage, idx) => {
            const stageCards = records.filter((r) => r.stageId === stage.id);
            const isLast = idx === stages.length - 1;

            return (
              <div key={stage.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4 min-w-[250px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getBadgeColor(stage.color)}`}></span> 
                    <span>{stage.name}</span>
                  </span>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                    {stageCards.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 min-h-[350px]">
                  {stageCards.map((c) => (
                    <div
                      key={c.id}
                      className={`bg-slate-900 p-4 rounded-xl border border-slate-850 hover:border-slate-700 transition flex flex-col justify-between gap-3 ${
                        isLast ? 'opacity-65' : ''
                      }`}
                    >
                      <div>
                        <h4 className={`font-semibold text-sm text-white ${isLast ? 'line-through text-slate-400' : ''}`}>
                          {c.title}
                        </h4>
                        {c.values?.client && (
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Cliente: {c.values.client}</p>
                        )}
                        {c.values?.petName && (
                          <p className="text-[10px] text-slate-500">Mascota: {c.values.petName}</p>
                        )}

                        {/* Campos dinámicos requeridos */}
                        {(c.values?.checkIn || c.values?.checkOut) && (
                          <div className="mt-2 text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block font-semibold">
                            📅 In: {c.values.checkIn || '-'} | Out: {c.values.checkOut || '-'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-850/65">
                        <span className="text-xs font-bold text-secondary">{c.values?.amount || 0} €</span>
                        {!isLast && (
                          <button
                            onClick={() => {
                              const nextStage = stages[idx + 1];
                              if (nextStage) triggerMove(c, nextStage);
                            }}
                            className="text-[10px] bg-primary text-primary-foreground hover:opacity-95 px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 active:scale-95"
                          >
                            <span>Avanzar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {isLast && (
                          <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                            Completado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL TRANSICIÓN BLOCKER (Fase 4 & 28) */}
      {activeCardForTransition && targetStageForTransition && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-md font-semibold text-white">Validación de Transición</h3>
            </div>
            
            <p className="text-xs text-slate-400">
              {transitionError}
            </p>

            <div className="space-y-3">
              {Object.keys(transitionFieldsData).map((field) => (
                <div key={field}>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    {field === 'checkIn' ? 'Fecha Check-In' : field === 'checkOut' ? 'Fecha Check-Out' : field}
                  </label>
                  <input
                    type={field.includes('Date') || field.includes('check') ? 'date' : 'text'}
                    value={transitionFieldsData[field]}
                    onChange={(e) =>
                      setTransitionFieldsData((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setActiveCardForTransition(null);
                  setTargetStageForTransition(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={saveTransitionData}
                className="px-3 py-1.5 rounded-lg bg-primary hover:opacity-90 text-xs font-semibold text-primary-foreground transition"
              >
                Confirmar Transición
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA ETAPA */}
      {showStageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Nueva Etapa del Pipeline</h3>
              <button onClick={() => setShowStageModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={addStage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Nombre de la Etapa</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Check-out Programado"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Color Distintivo</label>
                <select
                  value={newStageColor}
                  onChange={(e) => setNewStageColor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                >
                  <option value="blue">Azul</option>
                  <option value="emerald">Verde</option>
                  <option value="amber">Amarillo</option>
                  <option value="purple">Púrpura</option>
                  <option value="red">Rojo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Campos Obligatorios de Transición</label>
                <input
                  type="text"
                  placeholder="Ej. checkIn, checkOut (separados por coma)"
                  value={newStageRequired}
                  onChange={(e) => setNewStageRequired(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
                <span className="text-[10px] text-slate-500 block mt-1">Los nombres de campo deben coincidir con las propiedades JSON.</span>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStageModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingStage}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {creatingStage && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Crear</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA FICHA */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Nueva Ficha de Negocio</h3>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={addRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Título de la Ficha</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Estancia Rocky (Pitbull)"
                  value={newRecordTitle}
                  onChange={(e) => setNewRecordTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Importe (€)</label>
                  <input
                    type="number"
                    placeholder="150"
                    value={newRecordAmount}
                    onChange={(e) => setNewRecordAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Mascota (Nombre)</label>
                  <input
                    type="text"
                    placeholder="Rocky"
                    value={newRecordPet}
                    onChange={(e) => setNewRecordPet(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Cliente (Dueño)</label>
                <input
                  type="text"
                  placeholder="Ej. Laura Martínez"
                  value={newRecordClient}
                  onChange={(e) => setNewRecordClient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingRecord}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {creatingRecord && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Crear</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
