import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 p-4 text-white shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Bioagricsa - Panel de Control</h1>
          <div className="space-x-4">
            <span className="text-sm">Hola, Gustavo</span>
            <Link href="/login" className="rounded bg-blue-800 px-3 py-1 text-sm hover:bg-blue-900">
              Salir
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  );
}
