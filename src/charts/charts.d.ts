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

export default interface IChart<Args, Props> {
  name: string
  getArgs: (data: Data & { onComplete: (args: Args) => void }) => JSX.Element
  getData: (db: Remote<typeof DbWorker>, args: Args) => Promise<Props>
  getGraph: (props: Props, args: Args) => JSX.Element
}
