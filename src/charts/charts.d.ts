export interface Data {
  ufs: string[]
  tiposGeracao: string[]
  fasesUsina: string[]
  origensCombustivel: string[]
  fontesCombustivel: string[]
  municipios: string[]
  search: string
}

export default interface IChart {
  name: string
  getUrl: (data: Data) => string
  getTitle: (data: Data) => string
}
