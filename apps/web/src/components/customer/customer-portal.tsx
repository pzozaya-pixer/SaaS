import React, { useState } from 'react';
import { ShieldCheck, LogIn, LogOut, Calendar, User, Mail, DollarSign, Activity, Loader2 } from 'lucide-react';

interface Booking {
  id: string;
  title: string;
  amount: number | null;
  stage: string;
  lastStageChangeAt: string;
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export function CustomerPortal() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      // 1. Fetch Profile
      const resProfile = await fetch(`http://localhost:4000/api/v1/customer-portal/profile?email=${encodeURIComponent(email)}`);
      if (!resProfile.ok) throw new Error('Customer profile not found');
      const dataProfile = await resProfile.json();
      setProfile(dataProfile);

      // 2. Fetch Bookings
      const resBookings = await fetch(`http://localhost:4000/api/v1/customer-portal/bookings?email=${encodeURIComponent(email)}`);
      if (resBookings.ok) {
        const dataBookings = await resBookings.json();
        setBookings(dataBookings);
      }
    } catch (err) {
      console.error(err);
      // Fallback de demostración local
      setMockData(email);
    } finally {
      setLoading(false);
    }
  };

  const setMockData = (custEmail: string) => {
    setProfile({
      id: 'cust-1',
      firstName: 'Pepper',
      lastName: 'Potts',
      email: custEmail,
      phone: '+1 (555) 890-234',
    });
    setBookings([
      {
        id: 'book-1',
        title: 'Estancia Navideña Rocky',
        amount: 250,
        stage: 'Check-out Realizado',
        lastStageChangeAt: new Date().toISOString(),
      },
      {
        id: 'book-2',
        title: 'Reserva Estancia Verano 2026',
        amount: 400,
        stage: 'Confirmada',
        lastStageChangeAt: new Date().toISOString(),
      },
    ]);
  };

  const handleLogout = () => {
    setProfile(null);
    setBookings([]);
    setHasSearched(false);
    setEmail('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-secondary" />
            <span>Portal de Clientes Externos</span>
          </h2>
          <p className="text-xs text-slate-400">Acceso seguro para clientes finales del inquilino (dueños de mascotas)</p>
        </div>

        {profile && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition border border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        )}
      </div>

      {!profile ? (
        /* ACCESO POR EMAIL */
        <div className="max-w-md mx-auto bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Acceder a mi Portal</h3>
            <p className="text-xs text-slate-500">Ingresa el correo electrónico asociado a tu ficha de cliente</p>
          </div>

          <form onSubmit={handlePortalLogin} className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="pepper@starkindustries.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              <span>Ingresar</span>
            </button>
          </form>
        </div>
      ) : (
        /* DETALLE DE PORTAL CLIENTE */
        <div className="grid grid-cols-12 gap-6">
          
          {/* PERFIL (COL 4) */}
          <div className="col-span-12 lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-3">
              <User className="w-4 h-4 text-slate-500" />
              <span>Mis Datos</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-3">
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Nombre Completo</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">{profile.firstName} {profile.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Email</span>
                  <span className="text-white font-mono mt-0.5 block">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">Teléfono</span>
                    <span className="text-white mt-0.5 block">{profile.phone}</span>
                  </div>
                )}
              </div>

              {/* MASCOTA ASOCIADA MOCK */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-850 space-y-2">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Mascota Vinculada</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">🐕 Rocky (Pitbull)</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                    Vacunas al Día
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Alimentación: Comida húmeda sin cereales, 2 tomas diarias.</p>
              </div>
            </div>
          </div>

          {/* HISTORIAL RESERVAS (COL 8) */}
          <div className="col-span-12 lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Mis Reservas e Historial</span>
            </h3>

            <div className="space-y-3">
              {bookings.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">No tienes estancias registradas todavía.</div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-slate-900/40 border border-slate-850 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-4 transition"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-xs">{b.title}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Última actualización: {new Date(b.lastStageChangeAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {b.amount && (
                        <span className="text-xs font-semibold text-slate-200 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3 text-slate-500" />
                          <span>{b.amount}€</span>
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                        {b.stage}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
