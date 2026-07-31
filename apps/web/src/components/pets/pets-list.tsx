import React, { useState } from 'react';
import { PawPrint, Plus, Sparkles } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  dietInstructions: string;
  vaccinationStatus: string;
  lastVaccinationDate: string;
}

export function PetsList() {
  const [pets, setPets] = useState<Pet[]>([
    { id: '1', name: 'Toby', breed: 'Labrador', age: 3, dietInstructions: 'Pienso light 200g/día', vaccinationStatus: 'Al día', lastVaccinationDate: '2026-05-10' },
    { id: '2', name: 'Luna', breed: 'Siamés', age: 2, dietInstructions: 'Comida húmeda mañana y noche', vaccinationStatus: 'Al día', lastVaccinationDate: '2026-06-15' },
    { id: '3', name: 'Max', breed: 'Pastor Alemán', age: 5, dietInstructions: 'Sin gluten, 300g/día', vaccinationStatus: 'Pendiente', lastVaccinationDate: '2025-11-20' },
  ]);

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [diet, setDiet] = useState('');
  const [vacStatus, setVacStatus] = useState('Al día');
  const [vacDate, setVacDate] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);

  const addPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newPet: Pet = {
      id: String(pets.length + 1),
      name,
      breed,
      age: Number(age) || 0,
      dietInstructions: diet,
      vaccinationStatus: vacStatus,
      lastVaccinationDate: vacDate || 'No registrada',
    };

    setPets([...pets, newPet]);
    setName('');
    setBreed('');
    setAge('');
    setDiet('');
    setVacStatus('Al día');
    setVacDate('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-secondary" />
            <span>Mascotas</span>
          </h2>
          <p className="text-xs text-slate-400">Registros de mascotas (Entidad Personalizada inyectada por el plugin)</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/95 text-xs font-semibold text-primary-foreground transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Mascota</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addPet} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-scale-up">
          <div className="md:col-span-3 pb-2 border-b border-slate-900 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span>Nueva Mascota</span>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nombre (Obligatorio)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              placeholder="Ej. Rex"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Raza / Especie</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              placeholder="Ej. Golden Retriever"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Edad</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              placeholder="Ej. 4"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Instrucciones de Alimentación</label>
            <input
              type="text"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              placeholder="Ej. Pienso hipoalergénico"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Estado de Vacunación</label>
            <select
              value={vacStatus}
              onChange={(e) => setVacStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="Al día">Al día</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Fecha de Última Vacunación</label>
            <input
              type="date"
              value={vacDate}
              onChange={(e) => setVacDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-900">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-primary hover:opacity-90 text-xs font-semibold text-primary-foreground transition"
            >
              Guardar Mascota
            </button>
          </div>
        </form>
      )}

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Raza</th>
              <th className="px-6 py-4">Edad</th>
              <th className="px-6 py-4">Alimentación</th>
              <th className="px-6 py-4">Vacunación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {pets.map(pet => (
              <tr key={pet.id} className="hover:bg-slate-900/30 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-secondary font-bold">PET-000{pet.id}</td>
                <td className="px-6 py-4 font-semibold text-white">{pet.name}</td>
                <td className="px-6 py-4 text-slate-300">{pet.breed}</td>
                <td className="px-6 py-4 text-slate-300">{pet.age} años</td>
                <td className="px-6 py-4 text-slate-400 text-xs">{pet.dietInstructions || 'Sin instrucciones'}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded inline-block w-fit ${pet.vaccinationStatus === 'Al día' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-emerald-500/20'}`}>
                      {pet.vaccinationStatus}
                    </span>
                    <span className="text-[10px] text-slate-500">Última: {pet.lastVaccinationDate}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
