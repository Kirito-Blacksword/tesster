import { Suspense } from "react";

export const metadata = {
  title: "Employee Portal",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#11161f] text-slate-200">
      <header className="border-b border-white/10 bg-[#171e29] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-white">Tesster Internal System</h1>
          <nav className="flex gap-4">
            <a href="/admin" className="text-sm font-medium text-slate-300 hover:text-white">Dashboard</a>
            <a href="/admin/tests/new" className="text-sm font-medium text-brand hover:opacity-80">Upload Test</a>
            <a href="/" className="text-sm font-medium text-slate-500 hover:text-slate-300">Exit</a>
          </nav>
        </div>
      </header>
      <main className="p-6">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>
    </div>
  );
}
