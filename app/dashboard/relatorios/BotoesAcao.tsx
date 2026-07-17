// app/dashboard/relatorios/BotoesAcao.tsx
'use client'

import { useState } from 'react';
import { deletarEleitor } from '../../actions';
import Link from 'next/link';

export default function BotoesAcao({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmacao = window.confirm('Tem certeza que deseja excluir esta ficha? Esta ação não pode ser desfeita.');
    if (!confirmacao) return;

    setLoading(true);
    const result = await deletarEleitor(id);
    
    if (result?.error) {
      alert(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="flex justify-end gap-2">
      <Link 
        href={`/dashboard/eleitores/editar/${id}`} 
        className="flex items-center justify-center w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white hover:-translate-y-0.5 transition-all shadow-sm"
        title="Editar Eleitor"
      >
        ✏️
      </Link>

      <button 
        onClick={handleDelete} 
        disabled={loading}
        className="flex items-center justify-center w-9 h-9 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white hover:-translate-y-0.5 transition-all disabled:opacity-50 shadow-sm"
        title="Excluir Eleitor"
      >
        {loading ? '⏳' : '🗑️'}
      </button>
    </div>
  );
}