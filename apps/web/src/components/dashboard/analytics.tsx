import React, { useState, useEffect } from 'react';
import { AreaChart, TrendingUp, PawPrint, Users, CreditCard, Plus, Trash2, Layout, PlusCircle, Loader2 } from 'lucide-react';

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
}

interface Report {
  id: string;
  name: string;
}

interface Widget {
  id: string;
  title: string;
  type: 'counter' | 'bar' | 'pie';
  layout: { x: number; y: number; w: number; h: number } | null;
  data: any;
}

export function AnalyticsDashboard() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State for new Widget
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetType, setWidgetType] = useState<'counter' | 'bar' | 'pie'>('counter');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [creatingWidget, setCreatingWidget] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const headers = {
        'x-organization-id': 'org-1',
        'Authorization': `Bearer ${token}`,
      };

      // 1. Fetch dashboards
      const dashRes = await fetch('http://localhost:4000/api/v1/dashboards', { headers });
      if (!dashRes.ok) throw new Error('Failed to fetch dashboards');
      const dashData = await dashRes.json();
      setDashboards(dashData);

      // 2. Fetch reports
      const repRes = await fetch('http://localhost:4000/api/v1/reports', { headers });
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData);
      }

      if (dashData.length > 0) {
        const activeDash = dashData[0];
        setSelectedDashboard(activeDash);
        fetchDashboardData(activeDash.id);
      } else {
        // Fallback mock en desarrollo si no hay dashboards sembrados
        setMockData();
      }
    } catch (err) {
      console.error(err);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (dashboardId: string) => {
    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/dashboards/${dashboardId}/data`, {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setWidgets(data.widgets || []);
    } catch (err) {
      console.error(err);
    }
  };

  const setMockData = () => {
    setDashboards([{ id: 'mock-dash', name: 'Panel de Residencia de Mascotas', description: 'Datos operativos del hotel canino' }]);
    setSelectedDashboard({ id: 'mock-dash', name: 'Panel de Residencia de Mascotas', description: 'Datos operativos del hotel canino' });
    setReports([
      { id: 'rep-1', name: 'Mascotas por Raza' },
      { id: 'rep-2', name: 'Reservas por Etapa' },
    ]);
    setWidgets([
      { id: 'w-1', title: 'Mascotas Totales', type: 'counter', layout: null, data: { value: 42, subtitle: '+12% este mes' } },
      { id: 'w-2', title: 'Contactos CRM', type: 'counter', layout: null, data: { value: 128, subtitle: '+4% este mes' } },
      { id: 'w-3', title: 'Reservas Activas', type: 'counter', layout: null, data: { value: 15, subtitle: 'Ocupación al 75%' } },
      { id: 'w-4', title: 'Espacio MinIO', type: 'counter', layout: null, data: { value: '1.2 GB / 10 GB', subtitle: '12% utilizado' } },
      {
        id: 'w-5',
        title: 'Distribución de Mascotas por Raza',
        type: 'bar',
        layout: null,
        data: [
          { label: 'Labrador', value: 12 },
          { label: 'Golden', value: 8 },
          { label: 'Poodle', value: 5 },
          { label: 'Siamés', value: 2 },
        ],
      },
      {
        id: 'w-6',
        title: 'Reservas por Etapa',
        type: 'pie',
        layout: null,
        data: [
          { label: 'Solicitado', value: 14, percent: 100 },
          { label: 'Confirmado', value: 10, percent: 71 },
          { label: 'Estancia Activa', value: 6, percent: 42 },
          { label: 'Finalizado', value: 18, percent: 100 },
        ],
      },
    ]);
  };

  const handleDashboardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dashId = e.target.value;
    const dash = dashboards.find((d) => d.id === dashId);
    if (dash) {
      setSelectedDashboard(dash);
      if (dashId === 'mock-dash') {
        setMockData();
      } else {
        fetchDashboardData(dashId);
      }
    }
  };

  const createWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDashboard || !widgetTitle.trim()) return;

    setCreatingWidget(true);
    const payload = {
      title: widgetTitle,
      type: widgetType,
      reportId: selectedReportId || null,
      config: { x: 0, y: 0, w: 6, h: 4 },
    };

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch(`http://localhost:4000/api/v1/dashboards/${selectedDashboard.id}/widgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create widget');

      setShowCreateModal(false);
      setWidgetTitle('');
      setSelectedReportId('');
      fetchDashboardData(selectedDashboard.id);
    } catch (err) {
      // Simulación local si es mock o falla
      const newMockWidget: Widget = {
        id: `w-${Math.random()}`,
        title: widgetTitle,
        type: widgetType,
        layout: null,
        data: widgetType === 'counter' ? { value: 10, subtitle: 'Nuevo Widget' } : [
          { label: 'Categoría A', value: 20 },
          { label: 'Categoría B', value: 30 },
        ],
      };
      setWidgets((prev) => [newMockWidget, ...prev]);
      setShowCreateModal(false);
    } finally {
      setCreatingWidget(false);
    }
  };

  const deleteWidget = async (widgetId: string) => {
    if (!selectedDashboard) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este widget del panel?')) return;

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      await fetch(`http://localhost:4000/api/v1/dashboards/widgets/${widgetId}`, {
        method: 'DELETE',
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchDashboardData(selectedDashboard.id);
    } catch (err) {
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
    }
  };

  // Filtrar widgets por tipo para distribución estética
  const kpiWidgets = widgets.filter((w) => w.type === 'counter');
  const chartWidgets = widgets.filter((w) => w.type !== 'counter');

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA DASHBOARD */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AreaChart className="w-5 h-5 text-secondary" />
            <span>Dashboard Operativo</span>
          </h2>
          <p className="text-xs text-slate-400">Analítica global consolidada a través de widgets relacionales</p>
        </div>

        <div className="flex gap-3 items-center">
          {/* SELECTOR DE DASHBOARD */}
          {dashboards.length > 1 && (
            <select
              value={selectedDashboard?.id || ''}
              onChange={handleDashboardChange}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-slate-700"
            >
              {dashboards.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-primary-foreground transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Widget</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI GRID (Contadores) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {kpiWidgets.map((w) => (
              <div
                key={w.id}
                className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition"
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition"></div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{w.title}</span>
                  <button
                    onClick={() => deleteWidget(w.id)}
                    className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 p-0.5 rounded transition duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-2xl font-extrabold text-white mt-2">
                  {/* Si el reporte devuelve datos agregados, tomamos el valor del resultado */}
                  {w.data?.value !== undefined
                    ? w.data.value
                    : Array.isArray(w.data)
                    ? w.data.length
                    : typeof w.data === 'object' && w.data !== null
                    ? Object.values(w.data)[0] || 0
                    : w.data || 0}
                </p>
                {w.data?.subtitle && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5" /> {w.data.subtitle}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* GRAPHICS SECTION (Barras / Tortas / Listas de distribución) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chartWidgets.map((w) => {
              const widgetData = Array.isArray(w.data) ? w.data : [];

              return (
                <div key={w.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative group hover:border-slate-700 transition">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-300">{w.title}</h3>
                    <button
                      onClick={() => deleteWidget(w.id)}
                      className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 p-0.5 rounded transition duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {w.type === 'bar' && (
                    <div className="h-60 flex flex-col justify-end pt-4 gap-2">
                      <div className="flex items-end gap-6 h-40 px-2">
                        {widgetData.map((item: any, idx: number) => {
                          const maxVal = Math.max(...widgetData.map((d: any) => d.value || 1));
                          const heightPct = Math.round(((item.value || 0) / maxVal) * 100);

                          return (
                            <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                              <div
                                className="w-full bg-primary/80 rounded-t-lg hover:bg-primary transition-all"
                                style={{ height: `${heightPct}%` }}
                              ></div>
                              <span className="text-[10px] mt-2 text-slate-400 font-medium truncate max-w-full">
                                {item.label || item.group} ({item.value})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t border-slate-800 w-full"></div>
                    </div>
                  )}

                  {w.type === 'pie' && (
                    <div className="space-y-4 pt-2">
                      {widgetData.map((item: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1 text-slate-400">
                            <span>{item.label || item.group}</span>
                            <span>{item.value} unidades</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${item.percent || 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL: CREAR WIDGET */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Añadir Widget al Tablero</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={createWidget} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Título del Widget</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Clientes Registrados"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Tipo de Gráfico</label>
                <select
                  value={widgetType}
                  onChange={(e) => setWidgetType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                >
                  <option value="counter">Tarjeta KPI (Contador)</option>
                  <option value="bar">Gráfico de Barras</option>
                  <option value="pie">Lista de Distribución (Barras Horizontales)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Informe Origen (Opcional)</label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                >
                  <option value="">Ninguno (Mock de Datos)</option>
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
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
                  disabled={creatingWidget}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {creatingWidget && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Añadir</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
