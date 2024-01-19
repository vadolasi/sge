import { Separator } from "@/components/ui/separator"
import DefaultLayout from "@/layouts/default"

export default () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col justify-center items-center gap-4 p-9">
        <h1 className="text-3xl font-bold">Sobre o RelgerWeb</h1>
        <div className="p-8 md:p-0 md:w-3/4 lg:w-2/3 xl:w-1/2">
          <p><strong>RelgerWeb</strong> - Ferramenta computacional de gerenciamento dos dados técnicos relacionados aos empreendimentos de geração fotovoltaica conectados ao sistema elétrico do RN [Versão 0.1 | Novembro/2023].</p>
          <p className="mt-4">Automatizar o processo de emissão de documentos técnicos relacionados, dentre inúmeras outras especificidades, a quantidade e respectivas potências instaladas de empreendimentos de geração fotovoltaica conectadas ao sistema elétrico do RN é o objetivo principal desta ferramenta.</p>
          <Separator className="my-6" />
          <p className="text-center text-lg">Ferramenta em Constante Desenvolvimento</p>
          <p className="text-center text-sm text-gray-500">Atualize a base de dados periodicamente: Engª Joyce Oliva.</p>
        </div>
      </div>
    </DefaultLayout>
  )
}
