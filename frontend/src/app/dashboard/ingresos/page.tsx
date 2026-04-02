"use client";

import { useState } from "react";

export default function IngresosPage() {
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [mensajeExito, setMensajeExito] = useState("");
  const [saldoTotal, setSaldoTotal] = useState<number | null>(null);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const usuario_id = localStorage.getItem("usuario_id") || 1; 
    
    try {
      const res = await fetch("http://localhost:8000/ingresos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: parseInt(cantidad), fecha, usuario_id }),
      });

      if (res.ok) {
        const data = await res.json();
        setMensajeExito(data.mensaje);
        setSaldoTotal(data.nuevo_saldo); 
        setCantidad(""); 
      } else {
        alert("Error al registrar los costales.");
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
    }
    setTimeout(() => setMensajeExito(""), 5000);
  };

  const handleRevertir = async () => {
    if (!cantidad) return alert("Escribe la cantidad que deseas anular.");
    
    try {
      const res = await fetch("http://localhost:8000/ingresos/revertir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad: parseInt(cantidad), fecha }),
      });

      if (res.ok) {
        const data = await res.json();
        setMensajeExito(data.mensaje);
        setSaldoTotal(data.nuevo_saldo);
        setCantidad("");
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Error al anular los costales.");
      }
    } catch (err) {
      alert("Error de conexión.");
    }
    setTimeout(() => setMensajeExito(""), 5000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-bio-dark">Registrar Descarga</h2>
          <p className="text-bio-green-dark mt-1">Ingresa los costales recibidos en bodega.</p>
        </div>
        
        {saldoTotal !== null && (
          <div className="bg-bio-dark text-white px-6 py-3 rounded-lg shadow-lg text-center">
            <span className="block text-sm text-bio-green-light">Total en Bodega</span>
            <span className="block text-3xl font-bold">{saldoTotal}</span>
          </div>
        )}
      </div>
      
      {mensajeExito && (
        <div className="mb-6 rounded-lg bg-bio-green-light/20 p-4 text-bio-green-dark">
          <p className="font-semibold">{mensajeExito}</p>
        </div>
      )}

      <div className="rounded-xl bg-white p-8 shadow-lg">
        <form onSubmit={handleGuardar} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-bio-dark mb-2">Fecha</label>
            <input
              type="date" required value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="block w-full rounded-lg bg-bio-light p-3 text-bio-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-bio-dark mb-2">Cantidad de Costales</label>
            <input
              type="number" min="1" required value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej. 150"
              className="block w-full rounded-lg bg-bio-light p-4 text-2xl font-bold text-bio-dark"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button type="submit" className="flex-1 rounded-lg bg-bio-green px-4 py-4 font-bold text-white text-lg hover:bg-bio-green-dark">
              Guardar Descarga
            </button>
            <button type="button" onClick={handleRevertir} className="rounded-lg bg-red-100 px-6 py-4 font-bold text-red-600 hover:bg-red-200">
              Borrar cantidad ingresada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
