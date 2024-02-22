import { GoogleChartWrapperChartType } from "react-google-charts"

export interface Data {
  ufs: string[]
  tiposGeracao: string[]
  fasesUsina: string[]
  origensCombustivel: string[]
  fontesCombustivel: string[]
  municipios: string[]
}

export default interface Chart<Args, Props> {
  type: GoogleChartWrapperChartType
  getArgs: (data: Data) => JSX.Element
  getData: (args: Args) => Promise<Props>
  getProps: (props: Props) => Promise<{
    data: never[]
    options: Record<string, unknown>
  }>
}
