'use client';

import React, { useState } from 'react';
import { Sidebar } from '../components/layout/sidebar';
import { Header } from '../components/layout/header';
import { AnalyticsDashboard } from '../components/dashboard/analytics';
import { ContactsList } from '../components/crm/contacts-list';
import { KanbanBoard } from '../components/kanban/board';
import { Marketplace } from '../components/plugins/marketplace';
import { LimitsView } from '../components/billing/limits-view';
import { PetsList } from '../components/pets/pets-list';
import { SecurityPanel } from '../components/security/security-panel';
import { AutomationsPanel } from '../components/automations/automations-panel';
import { StoragePanel } from '../components/storage/storage-panel';
import { useTenantTheme } from '../hooks/useTenantTheme';

export default function SaaSAdminPanel() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crm' | 'pets' | 'kanban' | 'plugins' | 'billing' | 'security' | 'automations' | 'files'>('dashboard');
  
  // Colores corporativos (Fase 2 & 18: White-labeling dinámico)
  const [primaryColor, setPrimaryColor] = useState('#0f172a');
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
  
  // Activar Hook de tematización
  useTenantTheme(primaryColor, secondaryColor);
  const petResidenceActive = true; // Forzamos true para simular el plugin activo

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans transition-all duration-300">
      
      {/* SIDEBAR DE NAVEGACIÓN */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        petResidenceActive={petResidenceActive}
      />

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-1 flex flex-col min-h-screen bg-slate-900/90">
        
        {/* HEADER CON CONFIGURACIÓN HEX */}
        <Header
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          secondaryColor={secondaryColor}
          setSecondaryColor={setSecondaryColor}
        />

        {/* CONTENEDOR PRINCIPAL */}
        <main className="flex-1 p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'dashboard' && <AnalyticsDashboard />}
          {activeTab === 'crm' && <ContactsList />}
          {activeTab === 'pets' && petResidenceActive && <PetsList />}
          {activeTab === 'kanban' && petResidenceActive && <KanbanBoard />}
          {activeTab === 'plugins' && (
            <Marketplace
              petResidenceActive={petResidenceActive}
              setPetResidenceActive={() => {}}
            />
          )}
          {activeTab === 'billing' && <LimitsView />}
          {activeTab === 'security' && <SecurityPanel />}
          {activeTab === 'automations' && <AutomationsPanel />}
          {activeTab === 'files' && <StoragePanel />}
        </main>

        <footer className="border-t border-slate-800 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
          <p>© 2026 Antigravity SaaS Multitenant. Todos los derechos reservados.</p>
        </footer>
      </div>

    </div>
  );
}
