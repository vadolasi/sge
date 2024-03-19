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
    name: "[Mapa] Quantidade de empreendimentos por municipio",
    url: `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/distribuicao_geografica/`,
  },
  cenario_nacional: {
    name: "Comparação da quantidade de empreendimentos em relação ao resto do país",
    url: `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/cenario_nacional/`,
  },
  fases_empreendimentos: {
    name: "Quantitativo e potência por fase",
    url:`${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/fases_empreendimentos/`,
  },
  empreendimentos_municipio: {
    name: "Quantitativo e potência por municipio",
    url:`${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/empreendimentos_municipio/`,
  },
  fim_vigencia: {
    name: "Quantitativo por ano do fim da vigência",
    url: `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/empreendimentos_por_ano_vigencia/`
  },
  distribuicao_geografica_potencia: {
    name: "[Mapa] Potência total por municipio",
    url: `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/distribuicao_geografica_potencia/`,
  },
}

export default charts
