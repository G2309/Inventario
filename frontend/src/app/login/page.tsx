"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("usuario_id", data.id); 
        router.push("/dashboard");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-transparent">
      
      <div className="hidden w-1/2 flex-col items-center justify-center bg-[#012326] p-12 md:flex">
        <div className="relative h-64 w-64 mb-8">
          <Image 
            src="/logo.png" 
            alt="Bioagricsa Logo" 
            fill 
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-transparent md:w-1/2">
        <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm rounded-xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-bio-dark">Bienvenido</h1>
            <p className="mt-2 font-medium text-bio-green-dark">Accede al inventario.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-bio-dark mb-2">Usuario</label>
              <input
                type="text"
                required
                className="w-full rounded-lg bg-bio-light p-4 text-bio-dark border-transparent border-0 focus:ring-0"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-bio-dark mb-2">Contraseña</label>
              <input
                type="password"
                required
                className="w-full rounded-lg bg-bio-light p-4 text-bio-dark border-transparent border-0 focus:ring-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-bio-green px-4 py-4 font-bold text-white transition-colors hover:bg-bio-green-dark border-transparent border-0"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
