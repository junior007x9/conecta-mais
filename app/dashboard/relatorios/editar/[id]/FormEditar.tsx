// app/dashboard/eleitores/editar/[id]/FormEditar.tsx
'use client'

import { useState } from 'react';
import { atualizarEleitor } from '../../../../../actions';
import { useRouter } from 'next/navigation';

export default function FormEditar({ eleitor }: { eleitor: any }) {
  const router = useRouter();
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso', texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Inicializa os estados com os dados reais do banco
  const [tipoCadastro, setTipoCadastro] = useState(eleitor.tipo_cadastro || 'eleitor_consolidado');
  const [estadoCivil, setEstadoCivil] = useState(eleitor.estado_civil || 'solteiro');
  const [isFiliado, setIsFiliado] = useState(eleitor.filiado_partido || false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMensagem(null);
    
    // Adiciona o ID do eleitor que está sendo editado
    formData.append('id', eleitor.id);
    
    formData.set('notificar_niver_whats', (document.getElementById('not_whats') as HTMLInputElement).checked.toString());
    formData.set('notificar_niver_email', (document.getElementById('not_email') as HTMLInputElement).checked.toString());
    formData.set('seguindo_redes', (document.getElementById('seguindo') as HTMLInputElement).checked.toString());
    formData.set('filiado_partido', isFiliado.toString());

    const result = await atualizarEleitor(formData);
    
    if (result?.error) {
      setMensagem({ tipo: 'erro', texto: result.error });
      setLoading(false);
    } else if (result?.success) {
      setMensagem({ tipo: 'sucesso', texto: result.success });
      // Redireciona de volta para os relatórios após 2 segundos
      setTimeout(() => {
        router.push('/dashboard/relatorios');
      }, 2000);
    }
  }

  const inputStyle = "w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-slate-700";
  const labelStyle = "block text-xs font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wider";

  return (
    <div className="max-w-4xl mx-auto pb-12 font-sans animate-fade-in-down">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Editar Ficha</h1>
          <p className="text-slate-500 font-medium mt-2">Alterando os dados de: <span className="font-bold text-indigo-600">{eleitor.nome_completo}</span></p>
        </div>
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 font-bold bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-xl transition-colors">
          Voltar
        </button>
      </div>
      
      {mensagem && (
        <div className={`p-4 rounded-2xl mb-8 font-bold text-center shadow-sm animate-bounce ${mensagem.tipo === 'erro' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
          {mensagem.texto}
        </div>
      )}

      <form action={handleSubmit} className="space-y-8">
        
        {/* SESSÃO 1: TIPO DE CADASTRO */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <label className="block text-sm font-black text-indigo-900 mb-5 uppercase tracking-wider">Classificação do Cadastro</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['eleitor_consolidado', 'possivel_eleitor', 'indicacao'].map((tipo) => (
              <label key={tipo} className={`flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${tipoCadastro === tipo ? 'border-indigo-500 bg-indigo-50 text-indigo-700 transform scale-[1.02] shadow-md' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                <input type="radio" name="tipo_cadastro" value={tipo} checked={tipoCadastro === tipo} onChange={(e) => setTipoCadastro(e.target.value)} className="hidden" />
                <span className="font-bold capitalize">{tipo.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* INDICAÇÃO OBRIGATÓRIA */}
        {tipoCadastro === 'indicacao' && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-8 rounded-3xl shadow-sm border border-yellow-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <h3 className="md:col-span-3 text-sm font-black text-yellow-800 uppercase tracking-wider flex items-center gap-2 border-b border-yellow-200/50 pb-3">⚠️ Dados da Indicação</h3>
            <div>
              <label className={labelStyle}>Cargo / Função *</label>
              <input type="text" name="cargo_funcao" defaultValue={eleitor.cargo_funcao} required className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Secretaria *</label>
              <input type="text" name="secretaria" defaultValue={eleitor.secretaria} required className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Local de Trabalho *</label>
              <input type="text" name="local_trabalho" defaultValue={eleitor.local_trabalho} required className={inputStyle} />
            </div>
          </div>
        )}

        {/* DADOS PESSOAIS */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <h3 className="md:col-span-2 text-xl font-black text-slate-800 border-b border-slate-100 pb-4">👤 Dados Pessoais</h3>
          
          <div><label className={labelStyle}>Nome Completo *</label><input type="text" name="nome_completo" defaultValue={eleitor.nome_completo} required className={inputStyle} /></div>
          <div><label className={labelStyle}>Nome Social (Opcional)</label><input type="text" name="nome_social" defaultValue={eleitor.nome_social} className={inputStyle} /></div>

          <div>
            <label className={labelStyle}>Data de Nascimento *</label>
            <input type="date" name="data_nascimento" defaultValue={eleitor.data_nascimento} required className={inputStyle} />
            <div className="mt-3 flex gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="not_whats" defaultChecked={eleitor.notificar_niver_whats} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" /> Notificar Whats</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="not_email" defaultChecked={eleitor.notificar_niver_email} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" /> Notificar E-mail</label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelStyle}>Nacionalidade</label><input type="text" name="nacionalidade" defaultValue={eleitor.nacionalidade} className={inputStyle} /></div>
            <div><label className={labelStyle}>Naturalidade</label><input type="text" name="naturalidade" defaultValue={eleitor.naturalidade} className={inputStyle} /></div>
          </div>

          <div>
            <label className={labelStyle}>Estado Civil</label>
            <select name="estado_civil" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} className={inputStyle}>
              <option value="solteiro">Solteiro(a)</option>
              <option value="casado">Casado(a)</option>
              <option value="divorciado">Divorciado(a)</option>
              <option value="viuvo">Viúvo(a)</option>
            </select>
          </div>
          {estadoCivil === 'casado' && (<div><label className={labelStyle}>Nome do Cônjuge</label><input type="text" name="nome_conjuge" defaultValue={eleitor.nome_conjuge} className={inputStyle} /></div>)}
        </div>

        {/* CONTATO */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <h3 className="md:col-span-2 text-xl font-black text-slate-800 border-b border-slate-100 pb-4">📍 Contato e Localização</h3>
          
          <div className="md:col-span-2"><label className={labelStyle}>Endereço Completo *</label><input type="text" name="endereco_completo" defaultValue={eleitor.endereco_completo} required className={inputStyle} /></div>
          <div><label className={labelStyle}>Bairro (Timon-MA) *</label><input type="text" name="bairro" defaultValue={eleitor.bairro} required className={inputStyle} /></div>
          <div><label className={labelStyle}>Ponto de Referência</label><input type="text" name="ponto_referencia" defaultValue={eleitor.ponto_referencia} className={inputStyle} /></div>
          <div><label className={labelStyle}>WhatsApp *</label><input type="text" name="whatsapp" defaultValue={eleitor.whatsapp} required className={inputStyle} /></div>
          <div><label className={labelStyle}>E-mail (Para campanhas)</label><input type="email" name="email" defaultValue={eleitor.email} className={inputStyle} /></div>
        </div>

        {/* SOCIAIS E POLÍTICA */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <h3 className="md:col-span-2 text-xl font-black text-slate-800 border-b border-slate-100 pb-4">📱 Perfil Social e Político</h3>
          
          <div>
            <label className={labelStyle}>Link do Instagram</label>
            <input type="text" name="instagram_link" defaultValue={eleitor.instagram_link} className={`${inputStyle} mb-3`} />
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100"><input type="checkbox" id="seguindo" defaultChecked={eleitor.seguindo_redes} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" /> Seguindo nossas redes?</label>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <label className="block text-sm font-black text-slate-700 mb-3">Filiado a algum partido?</label>
            <div className="flex gap-4 mb-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all ${isFiliado ? 'border-indigo-500 bg-indigo-100 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'}`}><input type="radio" name="filiado_check" checked={isFiliado} onChange={() => setIsFiliado(true)} className="hidden" /> <span className="font-bold">Sim</span></label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all ${!isFiliado ? 'border-indigo-500 bg-indigo-100 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'}`}><input type="radio" name="filiado_check" checked={!isFiliado} onChange={() => setIsFiliado(false)} className="hidden" /> <span className="font-bold">Não</span></label>
            </div>
            {isFiliado && (
              <div className="space-y-3">
                <input type="text" name="nome_partido" defaultValue={eleitor.nome_partido} placeholder="Qual partido?" className={inputStyle} />
                <input type="text" name="motivo_filiacao" defaultValue={eleitor.motivo_filiacao} placeholder="Motivo?" className={inputStyle} />
              </div>
            )}
          </div>
        </div>

        {/* FORMAÇÃO */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <h3 className="md:col-span-2 text-xl font-black text-slate-800 border-b border-slate-100 pb-4">🎓 Dados Demográficos</h3>
          <div><label className={labelStyle}>Profissão Atual</label><input type="text" name="profissao" defaultValue={eleitor.profissao} className={inputStyle} /></div>
          <div><label className={labelStyle}>Classe Social</label><select name="classe_social" defaultValue={eleitor.classe_social} className={inputStyle}><option value="">Selecione...</option><option value="Alta">Alta</option><option value="Media">Média</option><option value="Baixa">Baixa</option></select></div>
          <div><label className={labelStyle}>Grau de Instrução</label><select name="grau_instrucao" defaultValue={eleitor.grau_instrucao} className={inputStyle}><option value="">Selecione...</option><option value="Superior">Ensino Superior</option><option value="Medio">Ensino Médio</option><option value="Fundamental">Ensino Fundamental</option><option value="Outro">Outro</option></select></div>
          <div><label className={labelStyle}>Formação Acadêmica</label><input type="text" name="formacao_academica" defaultValue={eleitor.formacao_academica} className={inputStyle} /></div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xl p-5 rounded-3xl shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 mt-4">
          {loading ? 'Atualizando Ficha...' : '💾 Salvar Alterações'}
        </button>

      </form>
    </div>
  );
}