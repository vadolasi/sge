import { GoogleChartWrapperChartType } from "react-google-charts"
import { Remote } from "comlink"
import { DbWorker } from "../worker"

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
  name: string
  getArgs: (data: Data & { onComplete: (args: Args) => void }) => JSX.Element
  getData: (db: Remote<typeof DbWorker>, args: Args) => Promise<Props>
  getProps: (props: Props, args: Args) => {
    data: unknown,
    options: Record<string, unknown>,
    height?: string
  }
}
