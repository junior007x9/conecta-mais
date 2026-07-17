// app/page.tsx
'use client'

import { useState } from 'react';
import { loginUsuario } from './actions';

export default function LoginPage() {
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setErro(null);
    const result = await loginUsuario(formData);
    
    if (result?.error) {
      setErro(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-500 p-4">
      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 transform transition-all hover:scale-[1.01] duration-500">
        
        <div className="text-center mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
             <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-cyan-600 mb-2">Conecta Mais</h1>
          <p className="text-gray-500 font-medium">Gestão de Base e Inteligência</p>
        </div>

        {erro && (
          <div className="bg-red-100/80 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm text-center font-bold animate-pulse">
            {erro}
          </div>
        )}

        <form action={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">E-mail</label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all outline-none"
              placeholder="Digite seu e-mail"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Senha</label>
            <input 
              type="password" 
              name="senha"
              required
              className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold p-4 rounded-2xl transform hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? 'Validando Acesso...' : 'Entrar no Sistema'}
          </button>
        </form>

      </div>
    </main>
  );
}