import React from 'react';
import { Blocks } from 'lucide-react';

interface MarketplaceProps {
  petResidenceActive: boolean;
  setPetResidenceActive: (active: boolean) => void;
}

export function Marketplace({ petResidenceActive, setPetResidenceActive }: MarketplaceProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Blocks className="w-5 h-5 text-secondary" />
          <span>Marketplace de Plugins</span>
        </h2>
        <p className="text-xs text-slate-400">Activa o desactiva de forma aislada e instantánea los módulos sectoriales de la organización</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PLUGIN RESIDENCIA MASCOTAS */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-3xl">🐾</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${petResidenceActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                {petResidenceActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-4">Residencia de Mascotas</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Inyecta de forma transaccional las definiciones de Mascota y Reservas, añade un pipeline comercial y configura un panel analítico preconfigurado.
            </p>
          </div>
          <button
            onClick={() => setPetResidenceActive(!petResidenceActive)}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all ${
              petResidenceActive
                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {petResidenceActive ? 'Desactivar Plugin' : 'Activar Plugin'}
          </button>
        </div>

        {/* INMOBILIARIA */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4 opacity-50">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-3xl">🏢</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                Próximamente
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-4">Sistemas Inmobiliarios</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Gestión de propiedades, visitas virtuales, control de alquileres y firmas digitales de contratos.
            </p>
          </div>
          <button disabled className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-500 font-semibold text-xs cursor-not-allowed border border-slate-850">
            Adquirir Addon
          </button>
        </div>

        {/* CLÍNICAS VETERINARIAS */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4 opacity-50">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-3xl">🩺</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                Próximamente
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-4">Clínicas Veterinarias</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Historias clínicas de pacientes, recetas veterinarias, agenda de consultas médicas y recordatorios de vacunas.
            </p>
          </div>
          <button disabled className="w-full py-2.5 rounded-xl bg-slate-900 text-slate-500 font-semibold text-xs cursor-not-allowed border border-slate-850">
            Adquirir Addon
          </button>
        </div>
      </div>
    </div>
  );
}
