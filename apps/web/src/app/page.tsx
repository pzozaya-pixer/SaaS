'use client';

import React, { useState } from 'react';

// Tipos base para simular estado interactivamente
interface Contact {
  id: string;
  name: string;
  type: 'PERSON' | 'COMPANY';
  email: string;
  phone: string;
  role: string; // Cliente, Proveedor, Prospecto
}

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

export default function SaaSAdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'kanban' | 'plugins' | 'billing'>('dashboard');
  
  // Estado de Plugins (Fase 6 & 8)
  const [petResidenceActive, setPetResidenceActive] = useState<boolean>(true);
  
  // Estado de Contactos (Fase 2)
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Laura Martínez', type: 'PERSON', email: 'laura@example.com', phone: '612 345 678', role: 'Cliente' },
    { id: '2', name: 'Clínica Veterinaria Sur', type: 'COMPANY', email: 'contacto@vetsur.com', phone: '912 345 678', role: 'Proveedor' },
    { id: '3', name: 'Carlos Mendoza', type: 'PERSON', email: 'carlos@example.com', phone: '654 321 098', role: 'Prospecto' },
  ]);

  // Estado de Kanban (Fase 4 & 8)
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([
    { id: 'c1', title: 'Estancia Toby (Labrador)', client: 'Laura Martínez', amount: 150, stageId: 's1', petName: 'Toby' },
    { id: 'c2', title: 'Reserva Luna (Siamés)', client: 'Carlos Mendoza', amount: 80, stageId: 's2', petName: 'Luna', checkIn: '2026-08-01', checkOut: '2026-08-07' },
    { id: 'c3', title: 'Estancia Max (Pastor Alemán)', client: 'Ana Gómez', amount: 220, stageId: 's3', petName: 'Max', checkIn: '2026-07-28', checkOut: '2026-08-05' },
  ]);

  // Alertas
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Mover tarjeta de etapa (Fase 4)
  const handleMoveCard = (cardId: string, targetStageId: string) => {
    const card = kanbanCards.find(c => c.id === cardId);
    if (!card) return;

    // Validación dinámica simulada (Fase 4: requerimientos de transición)
    if (targetStageId === 's2' && (!card.checkIn || !card.checkOut)) {
      setAlertMessage(`⚠️ Transición Bloqueada: La etapa 'Confirmado' requiere ingresar las fechas de Check-In y Check-Out de la mascota.`);
      return;
    }

    setKanbanCards(prev => prev.map(c => c.id === cardId ? { ...c, stageId: targetStageId } : c));
    setAlertMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans transition-all duration-300">
      
      {/* HEADER DE LA PLATAFORMA (Fase 2: Marca corporativa y multitenancy) */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-lg">
            Ω
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
              Antigravity SaaS Core
            </h1>
            <p className="text-xs text-slate-400">Organización: <span className="text-cyan-400 font-medium">PetResidence S.L.</span></p>
          </div>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS (Fase 1-7) */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'crm' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            CRM Contactos
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'kanban' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Pipeline Kanban
          </button>
          <button
            onClick={() => setActiveTab('plugins')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'plugins' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Plugins
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'billing' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Planes y Límites
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Plan Profesional Activo
          </span>
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold border border-slate-700 text-slate-300">
            AD
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">

        {/* ALERTA GLOBAL (Fase 4: Errores de reglas de transición) */}
        {alertMessage && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-3 animate-fade-in text-sm">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">Regla de Transición Requerida</p>
              <p className="opacity-90">{alertMessage}</p>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA: DASHBOARD (Fase 5) */}
        {/* ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Panel de Control: Residencia de Mascotas</h2>
                <p className="text-sm text-slate-400">Widgets dinámicos alimentados por agregación JSONB en PostgreSQL</p>
              </div>
              <span className="text-xs text-slate-500">Última actualización: Hace un momento</span>
            </div>

            {/* KPI WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                <h3 className="text-slate-400 text-sm font-medium">Mascotas Registradas</h3>
                <p className="text-3xl font-extrabold mt-2 text-white">42</p>
                <p className="text-xs text-emerald-400 mt-2 font-medium">↑ 12% este mes</p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
                <h3 className="text-slate-400 text-sm font-medium">Ingresos Estimados</h3>
                <p className="text-3xl font-extrabold mt-2 text-white">3,450 €</p>
                <p className="text-xs text-emerald-400 mt-2 font-medium">↑ 8% vs semana pasada</p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
                <h3 className="text-slate-400 text-sm font-medium">Estancias Activas</h3>
                <p className="text-3xl font-extrabold mt-2 text-white">15</p>
                <p className="text-xs text-amber-400 mt-2 font-medium">Ocupación al 75%</p>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
                <h3 className="text-slate-400 text-sm font-medium">Tasa de Conversión</h3>
                <p className="text-3xl font-extrabold mt-2 text-white">92.4 %</p>
                <p className="text-xs text-emerald-400 mt-2 font-medium">Límite del plan óptimo</p>
              </div>
            </div>

            {/* GRÁFICOS DINÁMICOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-md font-semibold mb-4 flex items-center justify-between">
                  <span>Mascotas por Raza</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Reporte JSONB</span>
                </h3>
                {/* Gráfico SVG custom */}
                <div className="h-64 flex flex-col justify-end gap-3 pt-6">
                  <div className="flex items-end gap-6 h-48 px-4">
                    <div className="flex flex-col items-center flex-1 h-full justify-end">
                      <div className="w-full bg-blue-600/80 rounded-t-lg hover:bg-blue-500 transition-all" style={{ height: '70%' }}></div>
                      <span className="text-xs mt-2 text-slate-400">Labrador</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 h-full justify-end">
                      <div className="w-full bg-cyan-600/80 rounded-t-lg hover:bg-cyan-500 transition-all" style={{ height: '45%' }}></div>
                      <span className="text-xs mt-2 text-slate-400">Golden Retr.</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 h-full justify-end">
                      <div className="w-full bg-indigo-600/80 rounded-t-lg hover:bg-indigo-500 transition-all" style={{ height: '30%' }}></div>
                      <span className="text-xs mt-2 text-slate-400">Poodle</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 h-full justify-end">
                      <div className="w-full bg-teal-600/80 rounded-t-lg hover:bg-teal-500 transition-all" style={{ height: '15%' }}></div>
                      <span className="text-xs mt-2 text-slate-400">Siamés</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-800 w-full"></div>
                </div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-md font-semibold mb-4 flex items-center justify-between">
                  <span>Reservas en el Pipeline</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">Pipeline Stage</span>
                </h3>
                {/* Gráfico Embudo */}
                <div className="space-y-4 pt-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-400">
                      <span>Solicitado</span>
                      <span>14 reservas</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-400">
                      <span>Confirmado</span>
                      <span>10 reservas</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '71%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-400">
                      <span>Estancia Activa</span>
                      <span>6 reservas</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-400">
                      <span>Finalizado</span>
                      <span>18 reservas</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-slate-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA: CRM CONTACTOS (Fase 2) */}
        {/* ========================================== */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold">CRM Contactos y Clientes</h2>
              <p className="text-sm text-slate-400">Aislamiento por inquilino multitenant y clasificación unificada</p>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Nombre / Razón Social</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Teléfono</th>
                    <th className="px-6 py-4">Rol Comercial</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {contacts.map(c => (
                    <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${c.type === 'PERSON' ? 'bg-sky-500/10 text-sky-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{c.email}</td>
                      <td className="px-6 py-4 text-slate-300">{c.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                          {c.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-400 hover:text-blue-300 text-xs font-medium">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA: PIPELINE KANBAN (Fase 4 & 8) */}
        {/* ========================================== */}
        {activeTab === 'kanban' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Pipeline: Reservas de Residencia</h2>
              <p className="text-sm text-slate-400">Reglas de transición activas y control de cuotas</p>
            </div>

            {/* TABLERO KANBAN */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* ETAPA 1: Solicitado */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-sm">Solicitado</span>
                  </div>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                    {kanbanCards.filter(c => c.stageId === 's1').length}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                  {kanbanCards.filter(c => c.stageId === 's1').map(c => (
                    <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
                      <h4 className="font-semibold text-sm text-white">{c.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">Cliente: {c.client}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-bold text-cyan-400">{c.amount} €</span>
                        <button
                          onClick={() => handleMoveCard(c.id, 's2')}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-md transition"
                        >
                          Avanzar →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ETAPA 2: Confirmado */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-sm">Confirmado</span>
                  </div>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                    {kanbanCards.filter(c => c.stageId === 's2').length}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                  {kanbanCards.filter(c => c.stageId === 's2').map(c => (
                    <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
                      <h4 className="font-semibold text-sm text-white">{c.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">Cliente: {c.client}</p>
                      <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        📅 {c.checkIn} a {c.checkOut}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-bold text-cyan-400">{c.amount} €</span>
                        <button
                          onClick={() => handleMoveCard(c.id, 's3')}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-md transition"
                        >
                          Avanzar →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ETAPA 3: Estancia Activa */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-semibold text-sm">Estancia Activa</span>
                  </div>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                    {kanbanCards.filter(c => c.stageId === 's3').length}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                  {kanbanCards.filter(c => c.stageId === 's3').map(c => (
                    <div key={c.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
                      <h4 className="font-semibold text-sm text-white">{c.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">Cliente: {c.client}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-bold text-cyan-400">{c.amount} €</span>
                        <button
                          onClick={() => handleMoveCard(c.id, 's4')}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-md transition"
                        >
                          Finalizar ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ETAPA 4: Finalizado */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                    <span className="font-semibold text-sm">Finalizado</span>
                  </div>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                    {kanbanCards.filter(c => c.stageId === 's4').length}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                  {kanbanCards.filter(c => c.stageId === 's4').map(c => (
                    <div key={c.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 opacity-70">
                      <h4 className="font-semibold text-sm text-slate-300 line-through">{c.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">Cliente: {c.client}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-bold text-slate-400">{c.amount} €</span>
                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">Ganado</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA: PLUGINS (Fase 6 & 8) */}
        {/* ========================================== */}
        {activeTab === 'plugins' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Catálogo de Plugins Sectoriales</h2>
              <p className="text-sm text-slate-400">Activa y desactiva dinámicamente funcionalidades del Marketplace</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* PLUGIN RESIDENCIA MASCOTAS */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🐾</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${petResidenceActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {petResidenceActive ? 'Activo' : 'Desactivado'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4">Residencia de Mascotas</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Inyecta entidades de mascotas, pipelines de reserva, vacunas, alimentación y gráficos preconfigurados.
                  </p>
                </div>
                <button
                  onClick={() => setPetResidenceActive(!petResidenceActive)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${petResidenceActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                >
                  {petResidenceActive ? 'Desactivar Plugin' : 'Activar Plugin'}
                </button>
              </div>

              {/* PLUGIN FACTURACIÓN ELECTRÓNICA */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4 opacity-60">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🧾</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                      Instalar
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4">Facturación Electrónica</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Generación automática de facturas PDF, firma digital y conexión de pasarelas de pago.
                  </p>
                </div>
                <button disabled className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold text-sm cursor-not-allowed">
                  Instalar Addon
                </button>
              </div>

              {/* PLUGIN CONTROL DE HORARIOS */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4 opacity-60">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">⏱️</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                      Instalar
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4">Fichaje y Calendarios</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Control de presencia de empleados, cuadrantes de turnos y sincronización con Google Calendar.
                  </p>
                </div>
                <button disabled className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold text-sm cursor-not-allowed">
                  Instalar Addon
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* PESTAÑA: PLANES Y LÍMITES (Fase 7) */}
        {/* ========================================== */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Límites del Plan Activo</h2>
              <p className="text-sm text-slate-400">Monitorización de consumos de tu organización</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* LÍMITE USUARIOS */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Usuarios Activos</span>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-white font-medium">3 / 5</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-slate-500">Quedan 2 invitaciones disponibles en tu plan.</p>
              </div>

              {/* LÍMITE CENTROS */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Centros / Delegaciones</span>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-white font-medium">1 / 2</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-xs text-slate-500">Puedes crear 1 centro o sede adicional.</p>
              </div>

              {/* LÍMITE DE ALMACENAMIENTO */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Almacenamiento MinIO</span>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-white font-medium">1.2 GB / 10 GB</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '12%' }}></div>
                </div>
                <p className="text-xs text-slate-500">Consumo de archivos adjuntos y documentos.</p>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Antigravity SaaS Multitenant. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}
