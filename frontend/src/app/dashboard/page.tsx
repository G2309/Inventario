import Link from "next/link";

export default function DashboardHome() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-bio-dark drop-shadow-sm">Panel de Control</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Ingresos */}
        <Link href="/dashboard/ingresos" className="group block">
          <div className="flex h-full flex-col justify-between rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl border-0 border-transparent outline-none">
            <div>
              <div className="mb-4 inline-block rounded-lg bg-bio-green/20 p-4 text-bio-green-dark">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-bio-dark">Recepciones</h2>
              <p className="text-bio-green-dark">Registra la descarga de costales y súmalos a la existencia en bodega.</p>
            </div>
            <span className="mt-6 inline-block font-bold text-bio-green group-hover:text-bio-green-light">Ingresar costales →</span>
          </div>
        </Link>

        {/* Despachos */}
        <Link href="/dashboard/despachos" className="group block">
          <div className="flex h-full flex-col justify-between rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl border-0 border-transparent outline-none">
            <div>
              <div className="mb-4 inline-block rounded-lg bg-bio-green/20 p-4 text-bio-green-dark">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-bio-dark">Despachos</h2>
              <p className="text-bio-green-dark">Registra salidas con guía logística o reingresa devoluciones.</p>
            </div>
            <span className="mt-6 inline-block font-bold text-bio-green group-hover:text-bio-green-light">Gestionar envíos →</span>
          </div>
        </Link>

        {/* Reportes*/}
        <Link href="/dashboard/reportes" className="group block">
          <div className="flex h-full flex-col justify-between rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl border-0 border-transparent outline-none">
            <div>
              <div className="mb-4 inline-block rounded-lg bg-bio-green/20 p-4 text-bio-green-dark">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h2 className="mb-2 text-2xl font-bold text-bio-dark">Reportes</h2>
              <p className="text-bio-green-dark">Visualiza el resumen diario, métricas mensuales y exporta a Excel.</p>
            </div>
            <span className="mt-6 inline-block font-bold text-bio-green group-hover:text-bio-green-light">Ver métricas →</span>
          </div>
        </Link>

      </div>
    </div>
  );
}
