export interface Data {
  ufs: string[]
  tiposGeracao: string[]
  fasesUsina: string[]
  origensCombustivel: string[]
  fontesCombustivel: string[]
  municipios: string[]
}

export default interface IChart<Args> {
  name: string
  getArgs: (data: Data & { onComplete: (args: Args) => void }) => JSX.Element
  getUrl: (args: Args) => string
  getTitle: (args: Args) => string
}
