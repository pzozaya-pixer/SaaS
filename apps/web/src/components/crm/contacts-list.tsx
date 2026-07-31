import React, { useState } from 'react';
import { User, Building2, Plus, Mail, Phone, MapPin } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  type: 'PERSON' | 'COMPANY';
  email: string;
  phone: string;
  role: string;
}

interface Center {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
}

export function ContactsList() {
  const [filter, setFilter] = useState<'ALL' | 'CLIENT' | 'PROVIDER' | 'PROSPECT'>('ALL');
  
  const [contacts] = useState<Contact[]>([
    { id: '1', name: 'Laura Martínez', type: 'PERSON', email: 'laura@example.com', phone: '612 345 678', role: 'Cliente' },
    { id: '2', name: 'Clínica Veterinaria Sur', type: 'COMPANY', email: 'contacto@vetsur.com', phone: '912 345 678', role: 'Proveedor' },
    { id: '3', name: 'Carlos Mendoza', type: 'PERSON', email: 'carlos@example.com', phone: '654 321 098', role: 'Prospecto' },
    { id: '4', name: 'Roberto Gómez', type: 'PERSON', email: 'roberto@example.com', phone: '622 111 222', role: 'Cliente' },
  ]);

  const [centers] = useState<Center[]>([
    { id: '1', name: 'Centro Principal Madrid', address: 'Calle Mayor 10, Madrid', phone: '911 222 333', status: 'Activo' },
    { id: '2', name: 'Centro Norte Alcobendas', address: 'Av. España 45, Alcobendas', phone: '911 444 555', status: 'Activo' },
  ]);

  const filteredContacts = contacts.filter(c => {
    if (filter === 'ALL') return true;
    if (filter === 'CLIENT') return c.role === 'Cliente';
    if (filter === 'PROVIDER') return c.role === 'Proveedor';
    if (filter === 'PROSPECT') return c.role === 'Prospecto';
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* SECCIÓN DE CENTROS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-secondary" />
              <span>Centros y Delegaciones</span>
            </h2>
            <p className="text-xs text-slate-400">Centros operativos aislados por inquilino</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-semibold text-primary-foreground transition-all">
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir Sede</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centers.map(center => (
            <div key={center.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-white">{center.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {center.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{center.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{center.phone}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN DE CONTACTOS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-secondary" />
              <span>Contactos</span>
            </h2>
            <p className="text-xs text-slate-400">Gestión unificada de clientes, proveedores y prospectos</p>
          </div>
          
          <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${filter === 'ALL' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('CLIENT')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${filter === 'CLIENT' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Clientes
            </button>
            <button
              onClick={() => setFilter('PROVIDER')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${filter === 'PROVIDER' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Proveedores
            </button>
            <button
              onClick={() => setFilter('PROSPECT')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${filter === 'PROSPECT' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Prospectos
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredContacts.map(c => (
                <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${c.type === 'PERSON' ? 'bg-sky-500/10 text-sky-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      {c.type === 'PERSON' ? 'Persona' : 'Empresa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{c.email}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{c.phone}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                      {c.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 text-xs font-medium mr-3">Editar</button>
                    <button className="text-rose-500 hover:text-rose-400 text-xs font-medium">Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
