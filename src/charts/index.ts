import DistribuicaoGeografica from "./DistribuicaoGeografica"
import FasesEmpreendimentos from "./FasesEmpreendimentos"
import Chart from "./charts"

const charts: Record<string, Chart<unknown>> = {
  fases_empreendimentos: FasesEmpreendimentos,
  distribuicao_geografica: DistribuicaoGeografica
}

export default charts
