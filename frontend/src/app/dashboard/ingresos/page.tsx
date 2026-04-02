"use client";

import { useState } from "react";

export default function IngresosPage() {
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [mensajeExito, setMensajeExito] = useState("");

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(`¡Éxito! Se han registrado ${cantidad} costales con fecha ${fecha}.`);
    setCantidad(""); 
    setTimeout(() => setMensajeExito(""), 4000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-bio-dark">Registrar Descarga</h2>
        <p className="text-bio-green_dark mt-1">Ingresa los costales recibidos en bodega.</p>
      </div>
      
      {mensajeExito && (
        <div className="mb-6 rounded-lg bg-bio-green_light/20 p-4 text-bio-green_dark shadow-sm border-transparent">
          <p className="font-semibold">{mensajeExito}</p>
        </div>
      )}

      <div className="rounded-xl bg-white p-8 shadow-lg">
        <form onSubmit={handleGuardar} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-bio-dark mb-2">Fecha de Ingreso</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="block w-full rounded-lg bg-bio-light p-3 text-bio-dark outline-none focus:ring-2 focus:ring-bio-green shadow-inner border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-bio-dark mb-2">Cantidad Total de Costales</label>
            <input
              type="number"
              min="1"
              required
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej. 150"
              className="block w-full rounded-lg bg-bio-light p-4 text-2xl font-bold text-bio-dark outline-none focus:ring-2 focus:ring-bio-green shadow-inner border-transparent"
            />
            <p className="mt-2 text-sm text-bio-green">
              Esta cantidad se sumará automáticamente al inventario.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-lg bg-bio-green px-4 py-4 font-bold text-white text-lg transition-all hover:bg-bio-green_dark hover:shadow-lg shadow-md"
            >
              Guardar Descarga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
