// app/dashboard/eleitores/page.tsx
'use client'

import { useState } from 'react';
import { cadastrarEleitor } from '../../actions';

export default function CadastroEleitorPage() {
  const [mensagem, setMensagem] = useState<{ tipo: 'erro' | 'sucesso', texto: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para controlar os campos condicionais
  const [tipoCadastro, setTipoCadastro] = useState('eleitor_consolidado');
  const [estadoCivil, setEstadoCivil] = useState('solteiro');
  const [isFiliado, setIsFiliado] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMensagem(null);
    
    // Anexa os checkboxes ao formData
    formData.set('notificar_niver_whats', (document.getElementById('not_whats') as HTMLInputElement).checked.toString());
    formData.set('notificar_niver_email', (document.getElementById('not_email') as HTMLInputElement).checked.toString());
    formData.set('seguindo_redes', (document.getElementById('seguindo') as HTMLInputElement).checked.toString());
    formData.set('filiado_partido', isFiliado.toString());

    const result = await cadastrarEleitor(formData);
    
    if (result?.error) {
      setMensagem({ tipo: 'erro', texto: result.error });
    } else if (result?.success) {
      setMensagem({ tipo: 'sucesso', texto: result.success });
      (document.getElementById('form-eleitor') as HTMLFormElement).reset();
      // Reseta os estados visuais
      setTipoCadastro('eleitor_consolidado');
      setEstadoCivil('solteiro');
      setIsFiliado(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setLoading(false);
  }

  // Estilo padronizado para os campos de texto e selects ficarem modernos
  const inputStyle = "w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-slate-700";
  const labelStyle = "block text-xs font-bold text-slate-600 mb-2 ml-1 uppercase tracking-wider";

  return (
    <div className="max-w-4xl mx-auto pb-12 font-sans">
      
      {/* CABEÇALHO */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Ficha Cadastral</h1>
        <p className="text-slate-500 font-medium mt-2">Preencha os dados abaixo. O sistema vinculará este cadastro automaticamente ao seu usuário.</p>
      </div>
      
      {/* ALERTA DE MENSAGEM */}
      {mensagem && (
        <div className={`p-4 rounded-2xl mb-8 font-bold text-center shadow-sm animate-bounce ${mensagem.tipo === 'erro' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
          {mensagem.texto}
        </div>
      )}

      <form id="form-eleitor" action={handleSubmit} className="space-y-8">
        
        {/* SESSÃO 1: TIPO DE CADASTRO */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <label className="block text-sm font-black text-indigo-900 mb-5 uppercase tracking-wider">Classificação do Cadastro</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['eleitor_consolidado', 'possivel_eleitor', 'indicacao'].map((tipo) => (
              <label key={tipo} className={`flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${tipoCadastro === tipo ? 'border-indigo-500 bg-indigo-50 text-indigo-700 transform scale-[1.02] shadow-md' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                <input 
                  type="radio" 
                  name="tipo_cadastro" 
                  value={tipo} 
                  checked={tipoCadastro === tipo}
                  onChange={(e) => setTipoCadastro(e.target.value)}
                  className="hidden" // Escondemos a bolinha padrão do rádio
                />
                <span className="font-bold capitalize">{tipo.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SESSÃO 2: INDICAÇÃO (Aparece e obriga se for Indicação) */}
        {tipoCadastro === 'indicacao' && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-8 rounded-3xl shadow-sm border border-yellow-200 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <h3 className="md:col-span-3 text-sm font-black text-yellow-800 uppercase tracking-wider flex items-center gap-2 border-b border-yellow-200/50 pb-3">
              ⚠️ Dados da Indicação (Obrigatórios)
            </h3>
            <div>
              <label className="block text-xs font-bold text-yellow-800 mb-2 ml-1">Cargo / Função *</label>
              <input type="text" name="cargo_funcao" required className={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-bold text-yellow-800 mb-2 ml-1">Secretaria *</label>
              <input type="text" name="secretaria" required className={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-bold text-yellow-800 mb-2 ml-1">Local de Trabalho *</label>
              <input type="text" name="local_trabalho" required className={inputStyle} />
            </div>
          </div>
        )}

        {/* SESSÃO 3: DADOS PESSOAIS */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2 gap-6">
          <h3 className="md:col-span-2 text-xl font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
            👤 Dados Pessoais
          </h3>
          
          <div>
            <label className={labelStyle}>Nome Completo *</label>
            <input type="text" name="nome_completo" required className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Nome Social (Opcional)</label>
            <input type="text" name="nome_social" className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Data de Nascimento *</label>
            <input type="date" name="data_nascimento" required className={inputStyle} />
            
            <div className="mt-3 flex gap-4 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="not_whats" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" /> Notificar Whats
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="not_email" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" /> Notificar E-mail
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Nacionalidade</label>
              <input type="text" name="nacionalidade" placeholder="Opcional" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Naturalidade</label>
              <input type="text" name="naturalidade" placeholder="Opcional" className={inputStyle} />
            </div>
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

          {estadoCivil === 'casado' && (
            <div className="animate-fade-in-up">
              <label className={labelStyle}>Nome do Cônjuge</label>
              <input type="text" name="nome_conjuge" className={inputStyle} />
            </div>
          )}
        </div>

        {/* SESSÃO 4: ENDEREÇO E CONTATO */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2 gap-6">
          <h3 className="md:col-span-2 text-xl font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
            📍 Contato e Localização
          </h3>
          
          <div className="md:col-span-2">
            <label className={labelStyle}>Endereço Completo *</label>
            <input type="text" name="endereco_completo" required className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Bairro (Timon-MA) *</label>
            <input type="text" name="bairro" required placeholder="Ex: Parque Piauí" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Ponto de Referência</label>
            <input type="text" name="ponto_referencia" className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>WhatsApp *</label>
            <input type="text" name="whatsapp" required placeholder="(99) 99999-9999" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>E-mail (Para campanhas)</label>
            <input type="email" name="email" className={inputStyle} />
          </div>
        </div>

        {/* SESSÃO 5: SOCIAIS E POLÍTICA */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2 gap-6">
          <h3 className="md:col-span-2 text-xl font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
            📱 Perfil Social e Político
          </h3>
          
          <div>
            <label className={labelStyle}>Link do Instagram</label>
            <input type="text" name="instagram_link" placeholder="@usuario ou link" className={`${inputStyle} mb-3`} />
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
              <input type="checkbox" id="seguindo" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" /> Usuário está seguindo nossas redes?
            </label>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <label className="block text-sm font-black text-slate-700 mb-3">Filiado a algum partido?</label>
            <div className="flex gap-4 mb-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all ${isFiliado ? 'border-indigo-500 bg-indigo-100 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                <input type="radio" name="filiado_check" checked={isFiliado} onChange={() => setIsFiliado(true)} className="hidden" /> 
                <span className="font-bold">Sim</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all ${!isFiliado ? 'border-indigo-500 bg-indigo-100 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'}`}>
                <input type="radio" name="filiado_check" checked={!isFiliado} onChange={() => setIsFiliado(false)} className="hidden" /> 
                <span className="font-bold">Não</span>
              </label>
            </div>

            {isFiliado && (
              <div className="space-y-3 animate-fade-in-up">
                <input type="text" name="nome_partido" placeholder="Qual partido?" className={inputStyle} />
                <input type="text" name="motivo_filiacao" placeholder="Por qual motivo é filiado?" className={inputStyle} />
              </div>
            )}
          </div>
        </div>

        {/* SESSÃO 6: FORMAÇÃO E CLASSE */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-2 gap-6">
          <h3 className="md:col-span-2 text-xl font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
            🎓 Dados Demográficos (Relatórios)
          </h3>
          
          <div>
            <label className={labelStyle}>Profissão Atual</label>
            <input type="text" name="profissao" className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Classe Social</label>
            <select name="classe_social" className={inputStyle}>
              <option value="">Selecione...</option>
              <option value="Alta">Alta</option>
              <option value="Media">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Grau de Instrução</label>
            <select name="grau_instrucao" className={inputStyle}>
              <option value="">Selecione...</option>
              <option value="Superior">Ensino Superior</option>
              <option value="Medio">Ensino Médio</option>
              <option value="Fundamental">Ensino Fundamental</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Formação Acadêmica</label>
            <input type="text" name="formacao_academica" placeholder="Ex: Direito, Administração..." className={inputStyle} />
          </div>
        </div>

        {/* BOTÃO SUBMIT */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xl p-5 rounded-3xl shadow-xl hover:shadow-emerald-500/40 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 active:scale-95 mt-4"
        >
          {loading ? 'Salvando Cadastro...' : 'Salvar Ficha Oficial'}
        </button>

      </form>
    </div>
  );
}