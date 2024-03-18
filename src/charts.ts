interface IChart {
  name: string
  url: string
}

const charts: Record<string, IChart> = {
  fases_empreendimentos_municiopio: {
    name: "Fases dos empreendimentos por município",
    url:`${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/fases_empreendimentos_municipio/`,
  },
  distribuicao_geografica: {
    name: "Distribuição geográfica",
    url: `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/distribuicao_geografica/`,
  },
  cenario_nacional: {
    name: "Cenário nacional",
    url: `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/cenario_nacional/`,
  },
  fases_empreendimentos: {
    name: "Fases dos empreendimentos",
    url:`${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/fases_empreendimentos/`,
  },
  empreendimentos_municipio: {
    name: "Empreendimentos",
    url:`${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/empreendimentos_municipio/`,
  }
}

export default charts
