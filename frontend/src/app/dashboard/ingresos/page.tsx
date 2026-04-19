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
    <div className="w-full px-8 lg:px-12">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-bio-dark">Registrar Descarga</h2>
          <p className="text-bio-green-dark mt-1">Ingresa los costales recibidos en bodega.</p>
        </div>
        
        {saldoTotal !== null && (
          <div className="mt-4 md:mt-0 bg-bio-dark text-white px-6 py-3 rounded-xl shadow-lg text-center border-0">
            <span className="block text-sm text-bio-green-light font-medium">Total en Bodega</span>
            <span className="block text-3xl font-bold">{saldoTotal}</span>
          </div>
        )}
      </div>
      
      {mensajeExito && (
        <div className="mb-6 rounded-xl bg-white/80 backdrop-blur-sm p-4 text-bio-green-dark shadow-md border-0">
          <p className="font-bold">{mensajeExito}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-lg border-0 h-fit">
          <form onSubmit={handleGuardar} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-bio-dark mb-2">Fecha</label>
              <input
                type="date" required value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="block w-full rounded-lg bg-bio-light p-3 text-bio-dark outline-none focus:ring-0 border-0 border-transparent shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-bio-dark mb-2">Cantidad de Costales</label>
              <input
                type="number" min="1" required value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="Ej. 150"
                className="block w-full rounded-lg bg-bio-light p-4 text-2xl font-bold text-bio-dark outline-none focus:ring-0 border-0 border-transparent shadow-inner"
              />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button type="submit" className="flex-1 rounded-lg bg-bio-green px-4 py-4 font-bold text-white text-lg hover:bg-bio-green-dark shadow-md border-0 transition-colors">
                Guardar Descarga
              </button>
              <button type="button" onClick={handleRevertir} className="rounded-lg bg-red-100 px-6 py-4 font-bold text-red-600 hover:bg-red-200 border-0 transition-colors">
                Anular Error
              </button>
            </div>
          </form>
        </div>

        <div className="hidden lg:flex flex-col justify-center items-center rounded-xl bg-bio-green/10 p-8 border-0">
            <svg className="w-32 h-32 text-bio-green/40 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            <h3 className="text-xl font-bold text-bio-dark text-center">Registro de Bodega</h3>
            <p className="text-bio-green-dark text-center mt-2">Mantén actualizado el Kardex asegurando las entradas correctas.</p>
        </div>
      </div>
    </div>
  );
}
