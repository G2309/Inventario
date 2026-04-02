"use client";

import { useState } from "react";

export default function DespachosPage() {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [saldoTotal, setSaldoTotal] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");

  const [cantidad, setCantidad] = useState("");
  const [guiaEnvio, setGuiaEnvio] = useState("");
  const [agencia, setAgencia] = useState("");

  const [guiaRetorno, setGuiaRetorno] = useState("");
  const [infoCaex, setInfoCaex] = useState<any>(null);

  const mostrarMensaje = (msg: string) => {
    setMensaje(msg);
    setTimeout(() => setMensaje(""), 5000);
  };

  const handleEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    const usuario_id = localStorage.getItem("usuario_id") || 1;
    
    try {
      const res = await fetch("http://localhost:8000/despachos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cantidad: parseInt(cantidad), 
          guia_logistica: guiaEnvio, 
          agencia_ubicacion: agencia, 
          fecha, usuario_id 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje(data.mensaje);
        setSaldoTotal(data.nuevo_saldo);
        setCantidad(""); setGuiaEnvio(""); setAgencia("");
      } else alert(data.detail);
    } catch (err) { alert("Error de conexión"); }
  };

  const procesarRetorno = async (endpoint: string) => {
    if (!guiaRetorno) return alert("Ingresa el número de guía");
    const usuario_id = localStorage.getItem("usuario_id") || 1;

    try {
      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guia_logistica: guiaRetorno, fecha, usuario_id }),
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje(data.mensaje);
        setSaldoTotal(data.nuevo_saldo);
        setGuiaRetorno("");
      } else alert(data.detail);
    } catch (err) { alert("Error de conexión"); }
  };

  const verificarEnCaex = async () => {
    if (!guiaRetorno) return alert("Escribe la guía primero.");
    setInfoCaex({ cargando: true });
    try {
      const res = await fetch(`http://localhost:8000/rastreo/${guiaRetorno}`);
      const data = await res.json();
      if (res.ok) setInfoCaex(data);
      else { alert(data.detail); setInfoCaex(null); }
    } catch {
      alert("Error conectando con Cargo Expreso.");
      setInfoCaex(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-bio-dark">Gestión de Despachos</h2>
          <p className="text-bio-green-dark mt-1">Registra salidas de Cargo Expreso y devoluciones.</p>
        </div>
        
        {saldoTotal !== null && (
          <div className="mt-4 md:mt-0 bg-bio-dark text-white px-6 py-3 rounded-xl shadow-lg text-center border-0">
            <span className="block text-sm text-bio-green-light font-medium">Total en Bodega</span>
            <span className="block text-3xl font-bold">{saldoTotal}</span>
          </div>
        )}
      </div>

      {mensaje && (
        <div className="mb-6 rounded-xl bg-white/80 backdrop-blur-sm p-4 text-bio-green-dark shadow-md border-0">
          <p className="font-bold">{mensaje}</p>
        </div>
      )}

      <div className="mb-8 rounded-xl bg-white/80 backdrop-blur-sm p-6 shadow-lg border-0 w-full md:w-1/3">
        <label className="block text-sm font-bold text-bio-dark mb-2">Fecha de Operación</label>
        <input
          type="date" required value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="block w-full rounded-lg bg-bio-light p-3 text-bio-dark outline-none focus:ring-0 border-0 border-transparent shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-lg border-0">
          <h3 className="text-xl font-bold text-bio-dark mb-6">Nuevo Envío</h3>
          <form onSubmit={handleEnvio} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-bio-dark mb-2">Número de Guía</label>
              <input
                type="text" required value={guiaEnvio} onChange={(e) => setGuiaEnvio(e.target.value)}
                placeholder="Ingresa No. Guía"
                className="block w-full rounded-lg bg-bio-light p-3 text-bio-dark outline-none focus:ring-0 border-0 border-transparent shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-bio-dark mb-2">Agencia Destino</label>
              <input
                type="text" required value={agencia} onChange={(e) => setAgencia(e.target.value)}
                placeholder="Ej. Guatemala"
                className="block w-full rounded-lg bg-bio-light p-3 text-bio-dark outline-none focus:ring-0 border-0 border-transparent shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-bio-dark mb-2">Cantidad de Costales</label>
              <input
                type="number" min="1" required value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                className="block w-full rounded-lg bg-bio-light p-3 text-bio-dark outline-none focus:ring-0 border-0 border-transparent shadow-inner"
              />
            </div>
            <button type="submit" className="w-full rounded-lg bg-bio-green px-4 py-4 font-bold text-white text-lg hover:bg-bio-green-dark shadow-md border-0 transition-colors">
              Registrar Salida
            </button>
          </form>
        </div>

        <div className="rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-lg border-0">
          <h3 className="text-xl font-bold text-bio-dark mb-6">Retornos y Anulaciones</h3>
          <p className="text-sm text-bio-green-dark mb-6">Ingresa la guía para procesar un paquete devuelto o anular un envío mal ingresado.</p>
          
          <div className="rounded-xl bg-white/80 backdrop-blur-sm p-8 shadow-lg border-0">
          <h3 className="text-xl font-bold text-bio-dark mb-6">Retornos y Anulaciones</h3>
          <p className="text-sm text-bio-green-dark mb-6">Ingresa la guía para procesar un paquete devuelto o anular un envío mal ingresado.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-bio-dark mb-2">Número de Guía a buscar</label>
              <input
                type="text" value={guiaRetorno} onChange={(e) => setGuiaRetorno(e.target.value)}
                placeholder="Ej. CE-987654"
                className="block w-full rounded-lg bg-bio-light p-4 text-bio-dark font-bold text-lg outline-none focus:ring-0 border-0 border-transparent shadow-inner"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={verificarEnCaex} 
                className="rounded-lg bg-bio-dark px-4 py-2 font-bold text-white text-sm hover:bg-gray-800 transition-colors border-0">
                Verificar en CAEX
              </button>
            </div>

            {infoCaex && !infoCaex.cargando && (
              <div className="rounded-lg bg-bio-light p-4 text-sm text-bio-dark border-l-4 border-bio-green">
                <p><strong>Estado:</strong> {infoCaex.estado_general}</p>
                <p><strong>Último mov:</strong> {infoCaex.ultimo_movimiento?.movimiento}</p>
                <p className="text-xs text-gray-500 mt-1">{infoCaex.ultimo_movimiento?.ruta}</p>
              </div>
            )}
            {infoCaex?.cargando && <p className="text-sm text-bio-green-dark">Conectando con Cargo Expreso...</p>}

            <div className="pt-4 space-y-4">
              <button 
                onClick={() => procesarRetorno("devoluciones")} 
                className="w-full rounded-lg bg-bio-dark px-4 py-4 font-bold text-white text-lg hover:bg-gray-800 shadow-md border-0 transition-colors">
                Registrar como Devolución
              </button>
              <button 
                onClick={() => procesarRetorno("despachos/anular")} 
                className="w-full rounded-lg bg-red-100 px-4 py-3 font-bold text-red-600 hover:bg-red-200 border-0 transition-colors">
                Anular Envío Incorrecto
              </button>
            </div>
          </div>
        </div>
        </div>

      </div>
    </div>
  );
}
