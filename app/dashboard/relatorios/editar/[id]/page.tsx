// app/dashboard/eleitores/editar/[id]/page.tsx
import { db } from '../../../../../db';
import { voters } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import FormEditar from './FormEditar';

export default async function EditarEleitorPage({ params }: { params: Promise<{ id: string }> }) {
  // O Next.js 16 exige que os parâmetros da URL sejam resolvidos de forma assíncrona
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Busca os dados atuais do eleitor no banco
  const [eleitor] = await db.select().from(voters).where(eq(voters.id, id));

  if (!eleitor) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center">
        <h1 className="text-2xl font-bold text-red-600">Eleitor não encontrado.</h1>
        <p className="text-gray-500 mt-2">A ficha pode ter sido excluída ou o link está incorreto.</p>
      </div>
    );
  }

  // Envia os dados para o formulário cliente que vamos criar no Passo 3
  return <FormEditar eleitor={eleitor} />;
}