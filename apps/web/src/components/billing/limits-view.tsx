import React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export function LimitsView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-secondary" />
          <span>Suscripción y Cuotas</span>
        </h2>
        <p className="text-xs text-slate-400">Verifica el uso de recursos y selecciona tu plan de facturación</p>
      </div>

      {/* PLANES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PLAN BÁSICO */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-md font-bold text-slate-300">Plan Básico</h3>
            <p className="text-2xl font-extrabold text-white mt-2">29 € <span className="text-xs text-slate-500 font-medium">/ mes</span></p>
            <ul className="text-xs text-slate-400 space-y-2 mt-4">
              <li className="flex items-center gap-2">✓ Hasta 2 usuarios</li>
              <li className="flex items-center gap-2">✓ Hasta 1 Sede/Centro</li>
              <li className="flex items-center gap-2">✓ 2 GB de almacenamiento</li>
            </ul>
          </div>
          <button className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300">
            Cambiar Plan
          </button>
        </div>

        {/* PLAN PROFESIONAL */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-primary relative flex flex-col justify-between gap-4 shadow-lg shadow-primary/5">
          <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
            Plan Activo
          </div>
          <div>
            <h3 className="text-md font-bold text-white">Plan Profesional</h3>
            <p className="text-2xl font-extrabold text-white mt-2">79 € <span className="text-xs text-slate-500 font-medium">/ mes</span></p>
            <ul className="text-xs text-slate-200 space-y-2 mt-4">
              <li className="flex items-center gap-2 text-emerald-400">✓ Hasta 5 usuarios</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ Hasta 2 Sedes/Centros</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ 10 GB de almacenamiento</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ Todos los plugins habilitados</li>
            </ul>
          </div>
          <button className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90">
            Gestionar Suscripción
          </button>
        </div>

        {/* PLAN ENTERPRISE */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-md font-bold text-slate-300">Plan Enterprise</h3>
            <p className="text-2xl font-extrabold text-white mt-2">199 € <span className="text-xs text-slate-500 font-medium">/ mes</span></p>
            <ul className="text-xs text-slate-400 space-y-2 mt-4">
              <li className="flex items-center gap-2">✓ Usuarios ilimitados</li>
              <li className="flex items-center gap-2">✓ Sedes ilimitadas</li>
              <li className="flex items-center gap-2">✓ 100 GB de almacenamiento</li>
              <li className="flex items-center gap-2">✓ SLA garantizado</li>
            </ul>
          </div>
          <button className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-semibold text-slate-300">
            Contactar Ventas
          </button>
        </div>
      </div>

      {/* LÍMITES DETALLADOS */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-semibold mb-4 text-slate-300">Consumo de Recursos</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1 text-slate-400">
              <span>Usuarios Activos</span>
              <span>3 / 5 usuarios</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 text-slate-400">
              <span>Centros y Delegaciones</span>
              <span>1 / 2 centros</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1 text-slate-400">
              <span>Almacenamiento de Archivos (MinIO)</span>
              <span>1.2 GB / 10 GB</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
