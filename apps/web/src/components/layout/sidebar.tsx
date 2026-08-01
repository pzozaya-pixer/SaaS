import React from 'react';
import { LayoutDashboard, Users, PawPrint, CalendarDays, Blocks, CreditCard, Sparkles, Shield, Zap, HardDrive, FileText, Mail, Database } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  petResidenceActive: boolean;
}

export function Sidebar({ activeTab, setActiveTab, petResidenceActive }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col gap-6 p-6">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 text-lg">
            Ω
          </div>
          <div>
            <h2 className="text-md font-bold tracking-tight text-white">Antigravity Core</h2>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">SaaS Multitenant</p>
          </div>
        </div>

        {/* MENÚ DE SECCIONES */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">General</span>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'crm'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>CRM Contactos</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'files'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Archivos y Adjuntos</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'forms'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Formularios</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios y Roles</span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'emails'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Monitoreo de Correos</span>
          </button>

          <button
            onClick={() => setActiveTab('customfields')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'customfields'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Campos Personalizados</span>
          </button>

          {/* MENÚ CONDICIONAL POR PLUGINS */}
          {petResidenceActive && (
            <>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mt-4 mb-2">Residencia Canina</span>
              
              <button
                onClick={() => setActiveTab('pets')}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'pets'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <PawPrint className="w-4 h-4" />
                <span>Mascotas</span>
              </button>

              <button
                onClick={() => setActiveTab('kanban')}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'kanban'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Reservas Residencia</span>
              </button>
            </>
          )}

          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mt-4 mb-2">Configuración</span>

          <button
            onClick={() => setActiveTab('automations')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'automations'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Automatizaciones</span>
          </button>

          <button
            onClick={() => setActiveTab('plugins')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'plugins'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Blocks className="w-4 h-4" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'billing'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Planes y Límites</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'security'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Seguridad y API</span>
          </button>
        </div>
      </div>

      {/* FOOTER DEL SIDEBAR */}
      <div className="p-6 border-t border-slate-900 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="text-xs text-slate-400 font-medium">Tenant Aislado</span>
      </div>
    </aside>
  );
}
