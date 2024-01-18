import { Button } from "@/components/ui/button"
import DefaultLayout from "@/layouts/default"
import { Link } from "react-router-dom"

export default () => {
  return (
    <DefaultLayout>
      <div>
        <h1>Base de Dados</h1>
        <h2>Selecione a base de dados do sistema elétrico a ser utilizada:</h2>
        <div className="flex flex-col">
          <Button asChild variant="link">
            <Link to="/relatorios/relatorio1" className="w-min">
              Geração Centralizada
            </Link>
          </Button>
          <Button asChild variant="link" className="w-min">
            <Link to="/relatorios/relatorio2">
              Geração Distribuída - Minigeração
            </Link>
          </Button>
          <Button asChild variant="link" className="w-min">
            <Link to="/relatorios/relatorio3">
              Geração Distribuída - Minigeração
            </Link>
          </Button>
        </div>
      </div>
    </DefaultLayout>
  )
}
