import React from 'react';
import { AreaChart, TrendingUp, PawPrint, Users, CreditCard } from 'lucide-react';

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AreaChart className="w-5 h-5 text-secondary" />
          <span>Dashboard Operativo</span>
        </h2>
        <p className="text-xs text-slate-400">Analítica global consolidada a través de widgets relacionales</p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mascotas Totales</span>
            <PawPrint className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">42</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +12% este mes
          </span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contactos CRM</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">128</p>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +4% este mes
          </span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reservas Activas</span>
            <PawPrint className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">15</p>
          <span className="text-[10px] text-amber-400 font-semibold mt-2 block">Ocupación al 75%</span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Límite de Almacenamiento</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">1.2 GB / 10 GB</p>
          <span className="text-[10px] text-slate-400 mt-2 block">12% utilizado</span>
        </div>
      </div>

      {/* GRAPHICS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Distribución de Mascotas por Raza</h3>
          <div className="h-60 flex flex-col justify-end pt-4 gap-2">
            <div className="flex items-end gap-6 h-40 px-2">
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-full bg-primary/80 rounded-t-lg hover:bg-primary transition-all" style={{ height: '75%' }}></div>
                <span className="text-[10px] mt-2 text-slate-400 font-medium">Labrador (12)</span>
              </div>
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-full bg-secondary/80 rounded-t-lg hover:bg-secondary transition-all" style={{ height: '45%' }}></div>
                <span className="text-[10px] mt-2 text-slate-400 font-medium">Golden (8)</span>
              </div>
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-full bg-primary/60 rounded-t-lg hover:bg-primary transition-all" style={{ height: '30%' }}></div>
                <span className="text-[10px] mt-2 text-slate-400 font-medium">Poodle (5)</span>
              </div>
              <div className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="w-full bg-teal-600/80 rounded-t-lg hover:bg-teal-500 transition-all" style={{ height: '15%' }}></div>
                <span className="text-[10px] mt-2 text-slate-400 font-medium">Siamés (2)</span>
              </div>
            </div>
            <div className="border-t border-slate-800 w-full"></div>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Reservas por Etapa</h3>
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Solicitado</span>
                <span>14 reservas</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Confirmado</span>
                <span>10 reservas</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Estancia Activa</span>
                <span>6 reservas</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Finalizado</span>
                <span>18 reservas</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
