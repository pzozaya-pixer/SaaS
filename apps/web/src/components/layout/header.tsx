import React from 'react';
import { Palette } from 'lucide-react';

interface HeaderProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
}

export function Header({ primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-md font-semibold text-slate-200">Panel de Administración</h1>
        <p className="text-xs text-slate-400">
          Organización: <span className="text-secondary font-medium">PetResidence S.L.</span>
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* SELECTOR DE COLORES CORPORATIVOS (Fase 2 & 18: White-labeling dinámico) */}
        <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <Palette className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-medium mr-2">Colores Corporativos:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Primario:</span>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 ml-3">
            <span className="text-slate-500">Secundario:</span>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer"
            />
          </div>
        </div>

        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Plan Profesional
        </span>

        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold border border-slate-700 text-slate-300">
          AD
        </div>
      </div>
    </header>
  );
}
