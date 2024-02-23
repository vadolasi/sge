import { RxCollection, RxDatabase, RxJsonSchema, createRxDatabase } from "rxdb"
import { getRxStorageMemory } from "rxdb/plugins/storage-memory"
import { expose } from "comlink"

export type Dado = {
  _id: string
  NomEmpreendimento: string
  IdeNucleoCEG: string
  CodCEG: string
  SigUFPrincipal: string
  SigTipoGeracao: string
  DscFaseUsina: string
  DscOrigemCombustivel: string
  DscFonteCombustivel: string
  DscTipoOutorga: string
  NomFonteCombustivel: string
  DatEntradaOperacao: string
  MdaPotenciaOutorgadaKw: number
  MdaPotenciaFiscalizadaKw: number
  MdaGarantiaFisicaKw: number
  IdcGeracaoQualificada: boolean
  NumCoordNEmpreendimento: number
  NumCoordEEmpreendimento: number
  DatInicioVigencia: string
  DatFimVigencia: string
  DscPropriRegimePariticipacao: string
  DscSubBacia: string
  DscMuninicpios: string
}

const codMap = {
  1: "_id",
  2: "NomEmpreendimento",
  3: "IdeNucleoCEG",
  4: "CodCEG",
  5: "SigUFPrincipal",
  6: "SigTipoGeracao",
  7: "DscFaseUsina",
  8: "DscOrigemCombustivel",
  9: "DscFonteCombustivel",
  10: "DscTipoOutorga",
  11: "NomFonteCombustivel",
  12: "DatEntradaOperacao",
  13: "MdaPotenciaOutorgadaKw",
  14: "MdaPotenciaFiscalizadaKw",
  15: "MdaGarantiaFisicaKw",
  16: "IdcGeracaoQualificada",
  17: "NumCoordNEmpreendimento",
  18: "NumCoordEEmpreendimento",
  19: "DatInicioVigencia",
  20: "DatFimVigencia",
  21: "DscPropriRegimePariticipacao",
  22: "DscSubBacia",
  23: "DscMuninicpios",
}

interface DocType {
  _id: string
  NomEmpreendimento: string
  IdeNucleoCEG: string
  CodCEG: string
  SigUFPrincipal: string
  SigTipoGeracao: string
  DscFaseUsina: string
  DscOrigemCombustivel: string
  DscFonteCombustivel: string
  DscTipoOutorga: string
  NomFonteCombustivel: string
  DatEntradaOperacao: string
  MdaPotenciaOutorgadaKw: number
  MdaPotenciaFiscalizadaKw: number
  MdaGarantiaFisicaKw: number
  IdcGeracaoQualificada: boolean
  NumCoordNEmpreendimento: number
  NumCoordEEmpreendimento: number
  DatInicioVigencia: string
  DatFimVigencia: string
  DscPropriRegimePariticipacao: string
  DscSubBacia: string
  DscMuninicpios: string
}

const schema: RxJsonSchema<DocType> = {
  version: 0,
  type: "object",
  primaryKey: "_id",
  properties: {
    _id: { type: "string", maxLength: 5 },
    NomEmpreendimento: { type: "string" },
    IdeNucleoCEG: { type: "string", maxLength: 6 },
    CodCEG: { type: "string", maxLength: 20 },
    SigUFPrincipal: { type: "string", maxLength: 2 },
    SigTipoGeracao: { type: "string", maxLength: 3 },
    DscFaseUsina: { type: "string" },
    DscOrigemCombustivel: { type: "string" },
    DscFonteCombustivel: { type: "string" },
    DscTipoOutorga: { type: "string" },
    NomFonteCombustivel: { type: "string" },
    DatEntradaOperacao: { type: "string" },
    MdaPotenciaOutorgadaKw: { type: "number" },
    MdaPotenciaFiscalizadaKw: { type: "interger" },
    MdaGarantiaFisicaKw: { type: "number" },
    IdcGeracaoQualificada: { type: "boolean" },
    NumCoordNEmpreendimento: { type: "number" },
    NumCoordEEmpreendimento: { type: "number" },
    DatInicioVigencia: { type: "string" },
    DatFimVigencia: { type: "string" },
    DscPropriRegimePariticipacao: { type: "string" },
    DscSubBacia: { type: "string" },
    DscMuninicpios: { type: "string" }
  },
  required: ["_id", "NomEmpreendimento"]
}

type MyDatabaseCollections = {
  empreendimentos: RxCollection<DocType>
}
type MyDatabase = RxDatabase<MyDatabaseCollections>

let db: MyDatabase

async function main() {
  db = await createRxDatabase<MyDatabaseCollections>({
    name: "db",
    storage: getRxStorageMemory(),
    eventReduce: true
  })

  db.addCollections({ empreendimentos: { schema } })
}

main()

export class DbWorker {
  static async setData(data: Map<keyof typeof codMap, string | number | boolean>[]) {
    const newData = data.map(item => {
      const obj: Dado = {} as Dado

      Object.entries(item).forEach(([key, value]) => {
        obj[codMap[Number(key)]] = value
      })

      return obj
    })

    await db.empreendimentos.bulkInsert(newData)
  }

  static async get(page: number, pageSize: number, filters: Record<string, unknown>) {
    const res = await db.empreendimentos.find({
      limit: pageSize,
      skip: page * pageSize,
      selector: filters
    }).exec()

    return res.map(item => item.toJSON())
  }

  static async getUfs() {
    const res = await db.empreendimentos.find().exec()

    return Array.from(new Set(res.map(item => item.SigUFPrincipal)))
  }

  static async getTiposGeracao() {
    const res = await db.empreendimentos.find().exec()

    return Array.from(new Set(res.map(item => item.SigTipoGeracao)))
  }

  static async getFasesUsina() {
    const res = await db.empreendimentos.find().exec()

    return Array.from(new Set(res.map(item => item.DscFaseUsina)))
  }

  static async getOrigensCombustivel() {
    const res = await db.empreendimentos.find().exec()

    return Array.from(new Set(res.map(item => item.DscOrigemCombustivel)))
  }

  static async getFontesCombustivel() {
    const res = await db.empreendimentos.find().exec()

    return Array.from(new Set(res.map(item => item.DscFonteCombustivel)))
  }

  static async getMunicipios(ufs: string[]) {
    const res = await db.empreendimentos.find({
      selector: {
        SigUFPrincipal: {
          $in: ufs
        }
      }
    }).exec()

    return Array.from(new Set(res.map(item => item.DscMuninicpios)))
  }

  static async getTotal(filters: Record<string, unknown>) {
    return db.empreendimentos.count({
      selector: filters
    }).exec()
  }

  static async getGraph_FasesEmpreendimentos(uf: string): Promise<[string, number, number, number][]> {
    const data = await db.empreendimentos.find({
      selector: {
        SigUFPrincipal: uf
      }
    }).exec()

    const municipios = Array.from(new Set(data.map(item => item.DscMuninicpios)))

    return municipios.map(municipio => {
      const operacao = data.filter(item => item.DscMuninicpios === municipio && item.DscFaseUsina === "Operação").length
      const construcao = data.filter(item => item.DscMuninicpios === municipio && item.DscFaseUsina === "Construção").length
      const construcaoNaoIniciada = data.filter(item => item.DscMuninicpios === municipio && item.DscFaseUsina === "Construção não iniciada").length

      return [
        municipio,
        operacao,
        construcao,
        construcaoNaoIniciada
      ]
    })
  }

  static async getGraph_DistribuicaoGeografica(uf: string): Promise<[number, number][]> {
    const data = await db.empreendimentos.find({
      selector: {
        SigUFPrincipal: uf
      }
    }).exec()

    return data.filter(item => item.NumCoordNEmpreendimento && item.NumCoordEEmpreendimento).map(item => [item.NumCoordNEmpreendimento, item.NumCoordEEmpreendimento])
  }
}


expose(DbWorker)
