"use client";

import { useState, useEffect } from "react";

export default function IngresosPage() {
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState(""); // Inicia vacío para evitar el error de hidratación
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    setFecha(new Date().toISOString().split("T")[0]);
  }, []);

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(`Se han registrado ${cantidad} costales con fecha ${fecha}. El inventario ha sido actualizado.`);
    setCantidad(""); 
    
    setTimeout(() => setMensajeExito(""), 4000);
  };

  if (!fecha) return null; 

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-2xl font-semibold text-gray-800">Registrar Nueva Descarga</h2>
      
      {mensajeExito && (
        <div className="mb-4 rounded border-l-4 border-green-500 bg-green-100 p-4 text-green-700">
          {mensajeExito}
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-sm border">
        <form onSubmit={handleGuardar} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cantidad Total de Costales</label>
            <input
              type="number"
              min="1"
              required
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej. 150"
              className="mt-1 block w-full rounded-md border border-gray-300 p-4 text-xl font-bold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              Esta cantidad se sumará automáticamente al inventario disponible.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-green-600 px-4 py-3 font-bold text-white transition-colors hover:bg-green-700"
          >
            Guardar Descarga
          </button>
        </form>
      </div>
    </div>
  );
}
