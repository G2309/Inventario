import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <nav className="bg-bio-dark/90 backdrop-blur-md p-4 text-white">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-bio-green-light">Bioagric</span>
          </div>
          <div className="space-x-4">
            <Link href="/login" className="rounded bg-bio-green px-4 py-2 text-sm font-bold hover:bg-bio-green-light hover:text-bio-dark transition-colors border-transparent border-0">
              Salir
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6 md:p-10">{children}</main>
    </div>
  );
}
