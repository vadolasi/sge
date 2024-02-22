/* eslint-disable react-refresh/only-export-components */
import { Button } from "@/components/ui/button"
import DefaultLayout from "@/layouts/default"
import { Link } from "react-router-dom"

export default () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4 p-8 items-center justify-center text-center h-full">
        <h1 className="text-2xl font-bold">Base de dados</h1>
        <h2 className="text-xl font-bold">Selecione a base de dados do sistema elétrico a ser utilizada:</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/dados/resultado?base=centralizada" className="w-min">
              Geração Centralizada
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-min">
            <Link to="/dados/resultado?base=distribuida">
              Geração Distribuída
            </Link>
          </Button>
        </div>
      </div>
    </DefaultLayout>
  )
}
