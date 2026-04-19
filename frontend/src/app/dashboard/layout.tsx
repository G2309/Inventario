"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const esInicioDashboard = pathname === "/dashboard";

  const handleSalir = () => {
    localStorage.removeItem("usuario_id");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-bio-light">
      <header className="bg-bio-dark px-8 py-4 shadow-md lg:px-12">
        <div className="flex w-full items-center justify-between">
          
          <div className="flex items-center gap-4">
            {!esInicioDashboard && (
              <Link 
                href="/dashboard" 
                className="flex items-center justify-center rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-bio-green hover:text-white"
                title="Volver al inicio"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </Link>
            )}
            <div className="text-2xl font-black tracking-widest text-white">
              BIO<span className="text-bio-green-light">AGRIC</span>
            </div>
          </div>

          <button 
            onClick={handleSalir}
            className="rounded-lg bg-red-500/20 px-4 py-2 font-bold text-red-200 transition-colors hover:bg-red-500 hover:text-white"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
