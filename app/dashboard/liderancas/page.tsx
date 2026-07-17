// app/dashboard/liderancas/page.tsx
'use client'

import { useState } from 'react';
import { cadastrarLideranca } from '../../actions';

export default function LiderancasPage() {
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso', texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCadastro(formData: FormData) {
    setLoading(true);
    setMensagem(null);
    
    const result = await cadastrarLideranca(formData);
    
    if (result?.error) {
      setMensagem({ tipo: 'erro', texto: result.error });
    } else if (result?.success) {
      setMensagem({ tipo: 'sucesso', texto: result.success });
      // Limpa o formulário após o sucesso
      (document.getElementById('form-lideranca') as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  // Estilo padronizado para combinar com o resto do sistema
  const inputStyle = "w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-slate-700";
  const labelStyle = "block text-xs font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wider";

  return (
    <div className="max-w-3xl mx-auto pb-12 font-sans">
      
      {/* CABEÇALHO */}
      <div className="mb-8 animate-fade-in-down">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gestão de Lideranças</h1>
        <p className="text-slate-500 font-medium mt-2">Crie o acesso para sua equipe de líderes coordenarem os cadastros.</p>
      </div>
      
      {/* ALERTA DE MENSAGEM */}
      {mensagem && (
        <div className={`p-4 rounded-2xl mb-8 font-bold text-center shadow-sm animate-bounce ${mensagem.tipo === 'erro' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
          {mensagem.texto}
        </div>
      )}

      {/* FORMULÁRIO EM CARD FLUTUANTE */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">👑</span> Cadastrar Nova Liderança
        </h2>

        <form id="form-lideranca" action={handleCadastro} className="space-y-6">
          <div>
            <label className={labelStyle}>Nome Completo da Liderança *</label>
            <input 
              type="text" 
              name="nome"
              required
              className={inputStyle}
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className={labelStyle}>E-mail de Acesso *</label>
            <input 
              type="email" 
              name="email"
              required
              className={inputStyle}
              placeholder="lideranca@email.com"
            />
          </div>

          <div>
            <label className={labelStyle}>Senha Provisória *</label>
            <input 
              type="password" 
              name="senha"
              required
              className={inputStyle}
              placeholder="Crie uma senha para a liderança"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-black text-xl p-5 rounded-3xl shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 active:scale-95 mt-4 flex justify-center items-center gap-2"
          >
            {loading ? 'Cadastrando...' : <><span>➕</span> Criar Acesso da Liderança</>}
          </button>
        </form>
      </div>
    </div>
  );
}