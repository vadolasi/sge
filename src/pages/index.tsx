/* eslint-disable react-refresh/only-export-components */
import { Separator } from "@/components/ui/separator"
import DefaultLayout from "@/layouts/default"

export default () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col justify-center items-center gap-4 p-9">
        <h1 className="text-3xl font-bold">Sobre o SGE</h1>
        <div className="p-8 md:p-0 md:w-3/4 lg:w-2/3 xl:w-1/2">
          <p>SGE: SISTEMA DE GERENCIAMENTO DE ENERGIA DESTINADO A FORNECER DADOS TÉCNICOS DOS EMPREENDIMENTOS DE GERAÇÃO DO ESTADO DO RIO GRANDE DO NORTE [Versão 0.1 | Março/2024].</p>
          <p className="mt-4">Automatizar o processo de emissão de documentos técnicos relacionados, dentre inúmeras outras especificidades, a quantidade e respectivas potências instaladas de empreendimentos de geração conectadas ao sistema elétrico do RN é o objetivo principal desta ferramenta.</p>
          <Separator className="my-6" />
          <p className="text-center text-lg">Ferramenta em Constante Desenvolvimento</p>
          <p className="text-center text-sm text-gray-500">Atualize a base de dados periodicamente: Engª Joyce Oliva.</p>
        </div>
      </div>
    </DefaultLayout>
  )
}
