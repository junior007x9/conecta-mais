// app/dashboard/layout.tsx
import { cookies } from 'next/headers';
import Link from 'next/link';
import { logout } from '../actions';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('conecta_session');
  const user = sessionCookie ? JSON.parse(sessionCookie.value) : null;

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Menu Lateral Super Moderno */}
      <aside className="w-72 bg-gradient-to-b from-indigo-950 via-indigo-900 to-blue-900 text-white flex flex-col shadow-2xl relative z-10">
        <div className="p-8 text-3xl font-black border-b border-white/10 bg-white/5 backdrop-blur-sm">
          Conecta<span className="text-cyan-400">Mais</span>
        </div>
        
        <nav className="flex-1 p-5 space-y-3">
          <Link href="/dashboard" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white/10 hover:translate-x-2 transition-all duration-300 font-medium text-indigo-100 hover:text-white">
            <span className="text-xl">🏠</span> Início
          </Link>
          
          <Link href="/dashboard/eleitores" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white/10 hover:translate-x-2 transition-all duration-300 font-medium text-indigo-100 hover:text-white">
            <span className="text-xl">✍️</span> Cadastrar Eleitor
          </Link>

          <Link href="/dashboard/relatorios" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-white/10 hover:translate-x-2 transition-all duration-300 font-medium text-indigo-100 hover:text-white">
            <span className="text-xl">📊</span> Relatório Geral
          </Link>

          {user?.role === 'admin' && (
            <Link href="/dashboard/liderancas" className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-800/50 hover:bg-indigo-500/50 hover:translate-x-2 transition-all duration-300 font-medium text-indigo-100 hover:text-white border border-indigo-400/20">
              <span className="text-xl">👑</span> Gestão de Lideranças
            </Link>
          )}
        </nav>

        {/* Rodapé do Menu */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
              {user?.nome?.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-indigo-300 uppercase tracking-wider font-bold">{user?.role}</p>
              <p className="text-sm font-bold truncate max-w-[150px]">{user?.nome}</p>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="w-full bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white font-bold py-3 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 border border-red-500/30 hover:border-red-500 active:scale-95">
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>

      {/* Conteúdo Principal com Scroll Suave */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto scroll-smooth">
        {children}
      </main>

    </div>
  );
}