"use client";

import { useState, useEffect } from "react";

export default function ReportesPage() {
  const [datos, setDatos] = useState<any>(null);
  const [umbral, setUmbral] = useState<number>(200);
  const [cargando, setCargando] = useState(true);

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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-bio-dark drop-shadow-sm">Panel Gerencial</h2>
          <p className="text-bio-green-dark mt-1 font-medium">Resumen de operaciones y estado del Kardex.</p>
        </div>

        {/* Configuración de Umbral */}
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border-0">
          <label className="text-sm font-bold text-bio-dark">Alerta en menos de:</label>
          <input
            type="number"
            value={umbral}
            onChange={handleUmbralChange}
            className="w-20 rounded-lg bg-white/80 p-2 text-center text-bio-dark font-bold outline-none focus:ring-0 border-0 shadow-inner"
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
    </div>
  );
}
