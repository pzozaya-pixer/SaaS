import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Check, X, ShieldAlert, Key, Loader2, Mail } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited';
  joinedAt: string;
}

interface PermissionRow {
  module: string;
  action: string;
  description: string;
  admin: boolean;
  manager: boolean;
  reader: boolean;
}

export function UsersPanel() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Invitation Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('manager');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Intentar cargar desde backend (o fallback mock)
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/auth/organization/users', {
        headers: {
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setMockUsers();
      }
    } catch (err) {
      console.error(err);
      setMockUsers();
    } finally {
      setLoading(false);
    }

    // Inicializar matriz de permisos interactiva
    setPermissions([
      { module: 'CRM Contactos', action: 'create', description: 'Crear e importar contactos', admin: true, manager: true, reader: false },
      { module: 'CRM Contactos', action: 'read', description: 'Visualizar contactos y detalles', admin: true, manager: true, reader: true },
      { module: 'CRM Contactos', action: 'delete', description: 'Eliminar registros de contactos', admin: true, manager: false, reader: false },
      { module: 'Mascotas', action: 'write', description: 'Administrar ingresos y check-ins', admin: true, manager: true, reader: false },
      { module: 'Almacenamiento', action: 'upload', description: 'Subir archivos y adjuntos a MinIO', admin: true, manager: true, reader: false },
      { module: 'Seguridad', action: 'manage_keys', description: 'Crear y revocar llaves de API', admin: true, manager: false, reader: false },
      { module: 'Facturación', action: 'upgrade', description: 'Modificar plan y ciclo de pago', admin: true, manager: false, reader: false },
    ]);
  };

  const setMockUsers = () => {
    setUsers([
      {
        id: 'u-1',
        name: 'Tony Stark',
        email: 'tony@starkindustries.com',
        role: 'Administrador',
        status: 'active',
        joinedAt: new Date(Date.now() - 3600000 * 24 * 60).toLocaleDateString(),
      },
      {
        id: 'u-2',
        name: 'Pepper Potts',
        email: 'pepper@starkindustries.com',
        role: 'Gestor',
        status: 'active',
        joinedAt: new Date(Date.now() - 3600000 * 24 * 30).toLocaleDateString(),
      },
      {
        id: 'u-3',
        name: 'Happy Hogan',
        email: 'happy@starkindustries.com',
        role: 'Lector',
        status: 'invited',
        joinedAt: new Date().toLocaleDateString(),
      },
    ]);
  };

  const inviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setInviting(true);
    const payload = {
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
    };

    try {
      const token = localStorage.getItem('token') || 'mock-session-token-32-chars-long';
      const res = await fetch('http://localhost:4000/api/v1/auth/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'org-1',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to invite user');

      alert('¡Invitación enviada exitosamente!');
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
      fetchInitialData();
    } catch (err) {
      // Simulación local si falla
      const roleName = inviteRole === 'admin' ? 'Administrador' : inviteRole === 'manager' ? 'Gestor' : 'Lector';
      const newMockUser: UserItem = {
        id: `u-${Math.random()}`,
        name: inviteName,
        email: inviteEmail,
        role: roleName,
        status: 'invited',
        joinedAt: new Date().toLocaleDateString(),
      };
      setUsers((prev) => [...prev, newMockUser]);
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
    } finally {
      setInviting(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas revocar el acceso a este usuario permanentemente?')) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const togglePermission = (idx: number, role: 'admin' | 'manager' | 'reader') => {
    setPermissions((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [role]: !row[role] } : row))
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            <span>Usuarios, Roles y Permisos (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400">Controla el acceso al sistema, delega responsabilidades y audita accesos</p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-bold text-primary-foreground transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invitar Usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* LISTADO DE USUARIOS (COL 5) */}
        <div className="col-span-12 lg:col-span-5 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between min-h-[450px]">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Miembros del Equipo</span>
            </h3>

            <div className="divide-y divide-slate-900 space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                users.map((u) => (
                  <div key={u.id} className="pt-3 first:pt-0 flex items-center justify-between group">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-xs flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.status === 'invited' && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase">
                            Pendiente
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-850 rounded text-slate-300 uppercase">
                        {u.role}
                      </span>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MATRIZ DE PERMISOS (COL 7) */}
        <div className="col-span-12 lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between min-h-[450px]">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Matriz de Autorizaciones (RBAC)</span>
            </h3>

            <div className="overflow-x-auto border border-slate-900 rounded-2xl">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Acción / Módulo</th>
                    <th className="px-4 py-3 text-center">Admin</th>
                    <th className="px-4 py-3 text-center">Gestor</th>
                    <th className="px-4 py-3 text-center">Lector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {permissions.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-white block">{row.module} - {row.action}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{row.description}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => togglePermission(idx, 'admin')}
                          className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition border ${
                            row.admin
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'border-slate-800 text-slate-600 hover:border-slate-700'
                          }`}
                        >
                          {row.admin && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => togglePermission(idx, 'manager')}
                          className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition border ${
                            row.manager
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'border-slate-800 text-slate-600 hover:border-slate-700'
                          }`}
                        >
                          {row.manager && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => togglePermission(idx, 'reader')}
                          className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition border ${
                            row.reader
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'border-slate-800 text-slate-600 hover:border-slate-700'
                          }`}
                        >
                          {row.reader && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: INVITAR USUARIO */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Invitar Miembro del Equipo</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>

            <form onSubmit={inviteUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Happy Hogan"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="happy@starkindustries.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Rol Asignado</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-700"
                >
                  <option value="admin">Administrador (Acceso Total)</option>
                  <option value="manager">Gestor (Creación y Lectura)</option>
                  <option value="reader">Lector (Solo Visualización)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enviar Invitación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
