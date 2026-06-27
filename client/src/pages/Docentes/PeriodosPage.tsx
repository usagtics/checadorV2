import { useEffect, useState, FormEvent } from 'react';
import { getPeriodosRequest, createPeriodoRequest, marcarPeriodoActivoRequest } from '../../api/periodos';
import MenuDocentes from '../../menu/MenuDocentes';

// Definimos la interfaz para el Periodo
interface Periodo {
  _id: string;
  nombre: string;
  activo: boolean;
}

export function PeriodosPage() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [nombre, setNombre] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const cargarPeriodos = async () => {
    try {
      const res = await getPeriodosRequest();
      setPeriodos(res.data);
    } catch (error) {
      console.error("Error al cargar periodos", error);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    try {
      setLoading(true);
      await createPeriodoRequest({ 
        nombre, 
        activo: periodos.length === 0 
      });
      setNombre('');
      cargarPeriodos();
    } catch (error) {
      console.error("Error al crear", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (id: string) => {
    try {
      await marcarPeriodoActivoRequest(id);
      cargarPeriodos();
    } catch (error) {
      console.error("Error al activar", error);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      <MenuDocentes />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-blue-900">Periodos Académicos</h1>
          <p className="text-blue-600/70 mt-1 font-medium">Administra los ciclos escolares y define el periodo activo.</p>
        </div>

        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mb-8 shadow-sm">
          <form onSubmit={onSubmit} className="flex gap-4 items-end max-w-2xl">
            <div className="flex-1">
              <label className="block text-sm font-black text-blue-900 mb-2 uppercase tracking-wide">
                Nuevo Periodo
              </label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                placeholder="Ej: Mayo - Agosto 2026"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !nombre}
              className="bg-blue-900 hover:bg-blue-950 text-white px-8 py-3 rounded-xl font-black transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Periodo'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Nombre</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {periodos.map((p: Periodo) => (
                <tr key={p._id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-blue-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-center">
                    {p.activo ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 uppercase">Activo</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-500 uppercase">Inactivo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!p.activo && (
                      <button 
                        onClick={() => toggleActivo(p._id)}
                        className="text-blue-900 font-black text-xs hover:bg-blue-100 px-4 py-2 rounded-lg transition-all border border-blue-200"
                      >
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default PeriodosPage;