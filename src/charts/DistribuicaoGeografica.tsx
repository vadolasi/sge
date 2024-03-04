/* eslint-disable react-refresh/only-export-components */
import type IChart from "./charts"

const DistribuicaoGeografica: IChart = {
  name: "Distribuição geográfica",
  getUrl: () => {
    return `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/distribuicao_geografica/`
  },
  getTitle: () => "Distribuição geográfica",
}

export default DistribuicaoGeografica
