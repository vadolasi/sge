/* eslint-disable react-refresh/only-export-components */
import type IChart from "./charts"

const FasesEmpreendimentos: IChart = {
  name: "Fases dos empreendimentos",
  getUrl: () => {
    return `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/fases_empreendimentos/`
  },
  getTitle: () => "Fases dos empreendimentos"
}

export default FasesEmpreendimentos
