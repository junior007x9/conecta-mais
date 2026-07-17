// app/dashboard/relatorios/FiltrosRelatorio.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function FiltrosRelatorio({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Guarda os valores atuais da URL para manter o filtro preenchido na tela
  const [bairro, setBairro] = useState(searchParams.get('bairro') || '');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '');
  const [lideranca, setLideranca] = useState(searchParams.get('lideranca') || '');

  function handleFiltrar(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Só adiciona na URL os filtros que foram preenchidos
    if (bairro) params.set('bairro', bairro);
    if (tipo) params.set('tipo', tipo);
    if (isAdmin && lideranca) params.set('lideranca', lideranca);

    // Recarrega a página com os novos filtros na URL
    router.push(`/dashboard/relatorios?${params.toString()}`);
  }

  function handleLimpar() {
    setBairro('');
    setTipo('');
    setLideranca('');
    router.push('/dashboard/relatorios');
  }

  const inputStyle = "w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none text-sm text-slate-700 font-medium";

  return (
    <form onSubmit={handleFiltrar} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 animate-fade-in-down flex flex-col md:flex-row gap-4 items-end">
      
      <div className="flex-1 w-full">
        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider ml-1">📍 Filtrar por Bairro</label>
        <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex: Parque Piauí" className={inputStyle} />
      </div>

      <div className="flex-1 w-full">
        <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider ml-1">🏷️ Classificação</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputStyle}>
          <option value="">Todos os tipos...</option>
          <option value="eleitor_consolidado">Consolidado</option>
          <option value="possivel_eleitor">Possível Eleitor</option>
          <option value="indicacao">Indicação</option>
        </select>
      </div>

      {isAdmin && (
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider ml-1">👑 Liderança</label>
          <input type="text" value={lideranca} onChange={(e) => setLideranca(e.target.value)} placeholder="Nome do líder..." className={inputStyle} />
        </div>
      )}

      <div className="flex gap-2 w-full md:w-auto">
        <button type="button" onClick={handleLimpar} className="px-5 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors w-full md:w-auto">
          Limpar
        </button>
        <button type="submit" className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-500/30 transition-all w-full md:w-auto">
          🔍 Filtrar
        </button>
      </div>
    </form>
  );
}