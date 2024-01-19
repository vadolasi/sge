import { Button } from "@/components/ui/button"
import DefaultLayout from "@/layouts/default"
import { Link } from "react-router-dom"

export default () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4 p-8">
        <h1 className="text-2xl font-bold">Base de dados</h1>
        <h2 className="text-xl font-bold">Selecione a base de dados do sistema elétrico a ser utilizada:</h2>
        <div className="flex flex-col">
          <Button asChild variant="link">
            <Link to="/dados/resultado?tipo=1" className="w-min">
              Geração Centralizada
            </Link>
          </Button>
          <Button asChild variant="link" className="w-min">
            <Link to="/dados/resultado?tipo=2">
              Geração Distribuída - Minigeração
            </Link>
          </Button>
          <Button asChild variant="link" className="w-min">
            <Link to="/dados/resultado?tipo=3">
              Geração Distribuída - Minigeração
            </Link>
          </Button>
        </div>
      </div>
    </DefaultLayout>
  )
}
