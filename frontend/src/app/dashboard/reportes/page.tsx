"use client";

import { useState, useEffect } from "react";

export default function ReportesPage() {
  const [datos, setDatos] = useState<any>(null);
  const [umbral, setUmbral] = useState<number>(200);
  const [cargando, setCargando] = useState(true);
  const [fechaHistorial, setFechaHistorial] = useState(new Date().toISOString().split("T")[0]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [tipoExportacion, setTipoExportacion] = useState<'mensual' | 'diario'>('mensual');

  useEffect(() => {
    const umbralGuardado = localStorage.getItem("umbral_inventario");
    if (umbralGuardado) {
      setUmbral(parseInt(umbralGuardado));
    }

    const fetchDatos = async () => {
      try {
        const res = await fetch("http://localhost:8000/reportes/dashboard-hoy");
        if (res.ok) {
          const data = await res.json();
          setDatos(data);
        }
      } catch (err) {
        console.error("Error al cargar reportes", err);
      } finally {
        setCargando(false);
      }
    };

    fetchDatos();
  }, []);

  useEffect(() => {
    const fetchHistorial = async () => {
      setCargandoHistorial(true);
      try {
        const res = await fetch(`http://localhost:8000/reportes/historial?fecha=${fechaHistorial}`);
        if (res.ok) {
          const data = await res.json();
          setHistorial(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoHistorial(false);
      }
    };
    fetchHistorial();
  }, [fechaHistorial]);

  const handleUmbralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoUmbral = parseInt(e.target.value) || 0;
    setUmbral(nuevoUmbral);
    localStorage.setItem("umbral_inventario", nuevoUmbral.toString());
  };

  if (cargando) {
    return <div className="text-center text-xl font-bold text-white drop-shadow-md">Cargando métricas...</div>;
  }

  if (!datos) {
    return <div className="text-center text-xl font-bold text-red-500 drop-shadow-md">Error al cargar la información.</div>;
  }

  const inventarioBajo = datos.total_bodega <= umbral;

  const handleDescargarExcel = () => {
    const [yyyy, mm, dd] = fechaHistorial.split("-");
    const anio = parseInt(yyyy);
    const mes = parseInt(mm);
    const dia = parseInt(dd);

    if (tipoExportacion === 'diario') {
      window.open(`http://localhost:8000/reportes/exportar?mes=${mes}&anio=${anio}&dia=${dia}`);
    } else {
      window.open(`http://localhost:8000/reportes/exportar?mes=${mes}&anio=${anio}`);
    }
  };

  return (
    <div className="w-full px-8 lg:px-12">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-bio-dark drop-shadow-sm">Panel Gerencial</h2>
          <p className="text-bio-green-dark mt-1 font-medium">Resumen de operaciones y estado del Kardex.</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-4 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm border-0">
          <label className="text-sm font-bold text-bio-dark">Alerta en menos de:</label>
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={umbral}
            onChange={handleUmbralChange}
            className="w-32 accent-bio-green cursor-pointer"
          />
          <input
            type="number"
            value={umbral}
            onChange={handleUmbralChange}
            className="w-24 rounded-lg bg-white/80 p-2 text-center text-bio-dark font-bold outline-none focus:ring-0 border-0 shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-8">
        <div className="md:col-span-3 rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border-0 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-bio-dark">Existencia Total en Bodega</h3>
            <p className="text-bio-green-dark mt-2">Costales disponibles al día de hoy.</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <span 
              className={`text-6xl font-black drop-shadow-sm transition-colors duration-300 ${
                inventarioBajo ? "text-red-600" : "text-bio-green"
              }`}
            >
              {datos.total_bodega}
            </span>
            {inventarioBajo && (
              <p className="text-red-600 font-bold mt-2 animate-pulse">¡Stock crítico!</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-lg border-0">
          <h3 className="text-lg font-bold text-bio-dark mb-4 border-b-0">Hoy ({datos.fecha})</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-bio-dark">Ingresos</span>
              <span className="text-xl font-bold text-bio-green">{datos.hoy.ingresados}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-bio-dark">Despachos</span>
              <span className="text-xl font-bold text-gray-700">{datos.hoy.enviados}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-bio-dark">Devoluciones</span>
              <span className="text-xl font-bold text-orange-500">{datos.hoy.devoluciones}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-lg border-0">
          <h3 className="text-lg font-bold text-bio-dark mb-4">Acumulado del Mes</h3>
          <div className="grid grid-cols-2 gap-6 h-full items-center pb-6">
            <div className="text-center p-4 bg-bio-light/50 rounded-xl border-0 shadow-inner">
              <span className="block text-sm font-semibold text-bio-dark mb-1">Total Enviados</span>
              <span className="text-4xl font-bold text-gray-700">{datos.mes.enviados}</span>
            </div>
            <div className="text-center p-4 bg-bio-light/50 rounded-xl border-0 shadow-inner">
              <span className="block text-sm font-semibold text-bio-dark mb-1">Total Devoluciones</span>
              <span className="text-4xl font-bold text-orange-500">{datos.mes.devoluciones}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-lg border-0">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-6">
          <div>
            <h3 className="text-xl font-bold text-bio-dark">Auditoría Diaria y Exportación</h3>
            <p className="text-sm text-bio-green-dark">Revisa los movimientos en pantalla o descarga los reportes gerenciales.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
            <input
              type="date"
              value={fechaHistorial}
              onChange={(e) => setFechaHistorial(e.target.value)}
              className="rounded-lg bg-bio-light p-3 text-bio-dark font-bold outline-none focus:ring-0 border-0 shadow-inner"
            />
            
            <select
              value={tipoExportacion}
              onChange={(e) => setTipoExportacion(e.target.value as 'diario' | 'mensual')}
              className="rounded-lg bg-bio-light p-3 text-bio-dark font-bold outline-none border-0 shadow-inner"
            >
              <option value="mensual">Reporte Mensual Completo</option>
              <option value="diario">Reporte Solo de este Día</option>
            </select>

            <button
              onClick={handleDescargarExcel}
              className="rounded-lg bg-bio-dark px-6 py-3 font-bold text-white hover:bg-gray-800 transition-colors border-0 shadow-md whitespace-nowrap"
            >
              {tipoExportacion === 'mensual' ? ' Exportar Mes' : ' Exportar Día'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {cargandoHistorial ? (
            <p className="text-center text-bio-green-dark py-8">Cargando registros...</p>
          ) : historial.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hubo movimientos en esta fecha.</p>
          ) : (
            <table className="w-full text-left text-sm text-bio-dark">
              <thead className="bg-bio-green/10 text-bio-green-dark font-bold">
                <tr>
                  <th className="p-4 rounded-tl-lg">Hora</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Usuario</th>
                  <th className="p-4 rounded-tr-lg">Guía / Referencia</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((mov) => (
                  <tr key={mov.id} className="hover:bg-white/50 transition-colors border-b border-bio-light/50 last:border-0">
                    <td className="p-4 font-mono">{mov.hora}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        mov.tipo === 'Ingreso' ? 'bg-bio-green/20 text-bio-green-dark' :
                        mov.tipo === 'Despacho' ? 'bg-gray-200 text-gray-700' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">{mov.usuario}</td>
                    <td className="p-4 text-gray-600">{mov.guia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
