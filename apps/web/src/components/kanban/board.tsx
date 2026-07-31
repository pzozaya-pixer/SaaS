import React, { useState } from 'react';
import { CalendarDays, AlertTriangle } from 'lucide-react';

interface KanbanCard {
  id: string;
  title: string;
  client: string;
  amount: number;
  stageId: string;
  petName?: string;
  checkIn?: string;
  checkOut?: string;
}

export function KanbanBoard() {
  const [cards, setCards] = useState<KanbanCard[]>([
    { id: 'c1', title: 'Estancia Toby (Labrador)', client: 'Laura Martínez', amount: 150, stageId: 's1', petName: 'Toby' },
    { id: 'c2', title: 'Reserva Luna (Siamés)', client: 'Carlos Mendoza', amount: 80, stageId: 's2', petName: 'Luna', checkIn: '2026-08-01', checkOut: '2026-08-07' },
    { id: 'c3', title: 'Estancia Max (Pastor Alemán)', client: 'Ana Gómez', amount: 220, stageId: 's3', petName: 'Max', checkIn: '2026-07-28', checkOut: '2026-08-05' },
  ]);

  const [activeCardForTransition, setActiveCardForTransition] = useState<KanbanCard | null>(null);
  const [checkInVal, setCheckInVal] = useState('');
  const [checkOutVal, setCheckOutVal] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const triggerMove = (card: KanbanCard, targetStageId: string) => {
    // Regla de transición: confirmar requiere Check-In y Check-Out (Fase 4 & 8)
    if (targetStageId === 's2' && (!card.checkIn || !card.checkOut)) {
      setActiveCardForTransition(card);
      setCheckInVal('');
      setCheckOutVal('');
      setTransitionError(`La etapa 'Confirmado' requiere ingresar las fechas de Check-In y Check-Out de la estancia.`);
      return;
    }

    // Movimiento directo para otras etapas
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, stageId: targetStageId } : c));
  };

  const saveTransitionData = () => {
    if (!activeCardForTransition) return;
    if (!checkInVal || !checkOutVal) {
      alert('Debes completar las fechas requeridas.');
      return;
    }

    setCards(prev =>
      prev.map(c =>
        c.id === activeCardForTransition.id
          ? { ...c, stageId: 's2', checkIn: checkInVal, checkOut: checkOutVal }
          : c
      )
    );
    setActiveCardForTransition(null);
    setTransitionError(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-secondary" />
          <span>Pipeline: Reservas Residencia</span>
        </h2>
        <p className="text-xs text-slate-400">Reglas de transición dinámicas y cálculo de tiempos activos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* COLUMNA 1 */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Solicitado
            </span>
            <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
              {cards.filter(c => c.stageId === 's1').length}
            </span>
          </div>
          <div className="flex flex-col gap-3 min-h-[300px]">
            {cards.filter(c => c.stageId === 's1').map(c => (
              <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                <h4 className="font-semibold text-sm text-white">{c.title}</h4>
                <p className="text-xs text-slate-400 mt-1">Dueño: {c.client}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-secondary">{c.amount} €</span>
                  <button
                    onClick={() => triggerMove(c, 's2')}
                    className="text-xs bg-primary text-primary-foreground hover:opacity-90 px-2 py-1 rounded transition"
                  >
                    Avanzar →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 2 */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmado
            </span>
            <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
              {cards.filter(c => c.stageId === 's2').length}
            </span>
          </div>
          <div className="flex flex-col gap-3 min-h-[300px]">
            {cards.filter(c => c.stageId === 's2').map(c => (
              <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                <h4 className="font-semibold text-sm text-white">{c.title}</h4>
                <p className="text-xs text-slate-400 mt-1">Dueño: {c.client}</p>
                <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                  📅 In: {c.checkIn} | Out: {c.checkOut}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-secondary">{c.amount} €</span>
                  <button
                    onClick={() => triggerMove(c, 's3')}
                    className="text-xs bg-primary text-primary-foreground hover:opacity-90 px-2 py-1 rounded transition"
                  >
                    Avanzar →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 3 */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Estancia Activa
            </span>
            <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
              {cards.filter(c => c.stageId === 's3').length}
            </span>
          </div>
          <div className="flex flex-col gap-3 min-h-[300px]">
            {cards.filter(c => c.stageId === 's3').map(c => (
              <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                <h4 className="font-semibold text-sm text-white">{c.title}</h4>
                <p className="text-xs text-slate-400 mt-1">Dueño: {c.client}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-secondary">{c.amount} €</span>
                  <button
                    onClick={() => triggerMove(c, 's4')}
                    className="text-xs bg-primary text-primary-foreground hover:opacity-90 px-2 py-1 rounded transition"
                  >
                    Finalizar ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA 4 */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span> Finalizado
            </span>
            <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
              {cards.filter(c => c.stageId === 's4').length}
            </span>
          </div>
          <div className="flex flex-col gap-3 min-h-[300px]">
            {cards.filter(c => c.stageId === 's4').map(c => (
              <div key={c.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-900/50 opacity-60">
                <h4 className="font-semibold text-sm text-slate-400 line-through">{c.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Dueño: {c.client}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-slate-500">{c.amount} €</span>
                  <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">Ganado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL TRANSICIÓN BLOCKER (Fase 4) */}
      {activeCardForTransition && (
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
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Fecha Check-In</label>
                <input
                  type="date"
                  value={checkInVal}
                  onChange={(e) => setCheckInVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Fecha Check-Out</label>
                <input
                  type="date"
                  value={checkOutVal}
                  onChange={(e) => setCheckOutVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveCardForTransition(null)}
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

    </div>
  );
}
