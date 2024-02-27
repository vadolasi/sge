/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import DefaultLayout from "@/layouts/default"
import "moment/locale/pt-br"
import moment from "moment"
import { useEffect, useMemo, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Table } from "@/components/Table"
import { unpack } from "msgpackr"
import { useQuery, useSuspenseQuery, keepPreviousData } from "@tanstack/react-query"
import MultiSelect from "@/components/MultiSelect"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useQueryParam, ArrayParam, NumberParam, withDefault } from "use-query-params"
import { useLocation } from "react-router"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import charts from "@/charts"
import { useUser } from "@/lib/auth"

export const options = {
  title: "Todas as fases dos empreendimentos eólicos do RN",
  vAxis: { title: "Cidade" },
  hAxis: { title: "Quantidade" },
  seriesType: "bars"
};

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

const columnsCentralizada: { name: string, selector: string, format?: (data: never) => string }[] = [
  { name: "ID", selector: "_id" },
  { name: "Nome do Empreendimento", selector: "NomEmpreendimento" },
  { name: "Núcleo CEG", selector: "IdeNucleoCEG" },
  { name: "Código CEG", selector: "CodCEG" },
  { name: "UF", selector: "SigUFPrincipal" },
  { name: "Tipo de Geração", selector: "SigTipoGeracao" },
  { name: "Fase da Usina", selector: "DscFaseUsina" },
  { name: "Origem do Combustível", selector: "DscOrigemCombustivel" },
  { name: "Fonte do Combustível", selector: "DscFonteCombustivel" },
  { name: "Tipo de Outorga", selector: "DscTipoOutorga" },
  { name: "Nome da Fonte do Combustível", selector: "NomFonteCombustivel" },
  { name: "Data de Entrada em Operação", selector: "DatEntradaOperacao", format: (data: string) => moment(data).format("L") },
  { name: "Potência Outorgada (kW)", selector: "MdaPotenciaOutorgadaKw" },
  { name: "Potência Fiscalizada (kW)", selector: "MdaPotenciaFiscalizadaKw" },
  { name: "Garantia Física (kW)", selector: "MdaGarantiaFisicaKw" },
  { name: "Geração Qualificada", selector: "IdcGeracaoQualificada", format: (data: boolean) => data ? "Sim" : "Não" },
  { name: "Coordenada N do Empreendimento", selector: "NumCoordNEmpreendimento" },
  { name: "Coordenada E do Empreendimento", selector: "NumCoordEEmpreendimento" },
  { name: "Início da Vigência", selector: "DatInicioVigencia", format: (data: string) => moment(data).format("L") },
  { name: "Fim da Vigência", selector: "DatFimVigencia", format: (data: string) => moment(data).format("L") },
  { name: "Proprietário do Regime de Participação", selector: "DscPropriRegimePariticipacao" },
  { name: "Sub-Bacia", selector: "DscSubBacia" },
  { name: "Municípios", selector: "DscMuninicpios" }
]

const columnsDistribuida: { name: string, selector: string, format?: (data: never) => string }[] = []

export default () => {
  const { search } = useLocation()
  const base = new URLSearchParams(search).get("base") ?? "centralizada"

  let columns = columnsCentralizada

  if (base === "distribuida") {
    columns = columnsDistribuida
  }

  const { token } = useUser()

  const { data: infos } = useSuspenseQuery<{
    ufs: string[],
    tipos_geracao: string[],
    fases_usina: string[],
    origens_combustivel: string[],
    fontes_combustivel: string[]
  }>({
    queryKey: ["infos", base],
    queryFn: async () =>
      unpack(
        new Uint8Array(
          await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/dados/${base}/infos`,
            {
              headers: {
                Authorization: `Token ${token}`
              }
            }
          ).then(res => res.arrayBuffer()) as ArrayBufferLike
        )
      )
  })

  const [data, setData] = useState<Dado[]>([])
  const [pageSize, setPageSize] = useQueryParam("items", withDefault(NumberParam, 10))
  const [currentPage, setCurrentPage] = useQueryParam("pagina", withDefault(NumberParam, 0))
  const [totalItems, setTotalItems] = useState(0)
  const [querySelectedUfs, setSelectedUfs] = useQueryParam("uf", withDefault(ArrayParam, []))
  const selectedUfs = useMemo<string[]>(() => querySelectedUfs.filter(uf => uf !== null) as string[], [querySelectedUfs])
  const [querySelectedTiposGeracao, setSelectedTiposGeracao] = useQueryParam("tipoGeracao", withDefault(ArrayParam, []))
  const selectedTiposGeracao = useMemo<string[]>(() => querySelectedTiposGeracao.filter(tipo => tipo !== null) as string[], [querySelectedTiposGeracao])
  const [querySelectedFasesUsina, setSelectedFasesUsina] = useQueryParam("faseUsina", withDefault(ArrayParam, []))
  const selectedFasesUsina = useMemo<string[]>(() => querySelectedFasesUsina.filter(fase => fase !== null) as string[], [querySelectedFasesUsina])
  const [querySelectedOrigensCombustivel, setSelectedOrigensCombustivel] = useQueryParam("origemCombustivel", withDefault(ArrayParam, []))
  const selectedOrigensCombustivel = useMemo<string[]>(() => querySelectedOrigensCombustivel.filter(origem => origem !== null) as string[], [querySelectedOrigensCombustivel])
  const [querySelectedFontesCombustivel, setSelectedFontesCombustivel] = useQueryParam("fonteCombustivel", withDefault(ArrayParam, []))
  const selectedFontesCombustivel = useMemo<string[]>(() => querySelectedFontesCombustivel.filter(font => font !== null) as string[], [querySelectedFontesCombustivel])
  const [querySelectedMunicipios, setSelectedMunicipios] = useQueryParam("municipio", withDefault(ArrayParam, []))
  const selectedMunicipios = useMemo<string[]>(() => querySelectedMunicipios.filter(municipio => municipio !== null) as string[], [querySelectedMunicipios])
  const [addGraphOpen, setAddGraphOpen] = useState(false)
  const [selectedChartToAdd, setSelectedChartToAdd] = useState<string | null>(null)
  const [enableAddGraph, setEnableAddGraph] = useState(false)
  const [graphToAddData, setGraphToAddData] = useState<Record<string, unknown> | null>(null)
  const [graphs, setGraphs] = useState<string[]>([])
  const [open2, setOpen2] = useState(false)

  const { data: empreendimentos, isLoading } = useQuery<{ count: number, records: Dado[] }>({
    queryKey: [
      "dados",
      base,
      currentPage,
      pageSize,
      selectedUfs.sort().join(","),
      selectedTiposGeracao.sort().join(","),
      selectedFasesUsina.sort().join(","),
      selectedOrigensCombustivel.sort().join(","),
      selectedFontesCombustivel.sort().join(","),
      selectedMunicipios.sort().join(",")
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      let params = "?"

      if (pageSize) {
        params += `limit=${pageSize}&`
      }

      if (currentPage) {
        params += `page=${currentPage}&`
      }

      for (const uf of selectedUfs) {
        params += `uf=${uf}&`
      }

      for (const tipo of selectedTiposGeracao) {
        params += `tipo=${tipo}&`
      }

      for (const fase of selectedFasesUsina) {
        params += `fase=${fase}&`
      }

      for (const origem of selectedOrigensCombustivel) {
        params += `origem=${origem}&`
      }

      for (const fonte of selectedFontesCombustivel) {
        params += `fonte=${fonte}&`
      }

      for (const municipio of selectedMunicipios) {
        params += `municipio=${municipio}&`
      }

      params = params.slice(0, -1)

      const data = unpack(
        new Uint8Array(
          await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/dados/${base}/${params}`,
            {
              headers: {
                Authorization: `Token ${token}`
              }
            }
          ).then(res => res.arrayBuffer()) as ArrayBufferLike
        )
      )

      const records = data.records.map(item => {
        const obj: Dado = {} as Dado

        Object.entries(item).forEach(([key, value]) => {
          obj[codMap[Number(key)]] = value
        })

        return obj
      })

      return {
        count: data.count,
        records
      }
    }
  })

  const { data: municipios } = useQuery<string[]>({
    queryKey: ["municipios", selectedUfs.sort().join(",")],
    enabled: selectedUfs.length > 0,
    initialData: [],
    queryFn: async () =>
      unpack(
        new Uint8Array(
          await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/dados/${base}/municipios/?ufs=${selectedUfs.sort().join(",")}`,
            {
              headers: {
                Authorization: `Token ${token}`
              }
            }
          ).then(res => res.arrayBuffer()) as ArrayBufferLike
        )
      )
  })

  const [querySelectedColumns, setSelectedColumns] = useQueryParam("coluna", withDefault(ArrayParam, []))
  const selectedColumns = useMemo<string[]>(() => querySelectedColumns.filter(column => column !== null) as string[], [querySelectedColumns])

  useEffect(() => {
    if (empreendimentos) {
      setData(empreendimentos.records)
      setTotalItems(empreendimentos.count)
    }
  }, [empreendimentos])

  useEffect(() => {
    setSelectedMunicipios(selectedMunicipios => selectedMunicipios.filter(municipio => municipios.includes(municipio)))
  }, [municipios])

  useEffect(() => {
    if (currentPage > Math.floor(totalItems / pageSize)) {
      setCurrentPage(Math.floor(totalItems / pageSize))
    }
  }, [totalItems, currentPage, pageSize])

  useEffect(() => {
    let pageIndex = currentPage

    if (data.length / (pageSize ?? 10) < currentPage) {
      pageIndex = Math.floor(data.length / (pageSize ?? 10))
    }

    setPageSize(pageSize ?? 10)
    setCurrentPage(pageIndex)
  }, [pageSize])

  const visibleColumns = useMemo(
    () => columns.filter(
      column =>
        (selectedColumns.length > 0 ? selectedColumns : columns.map(column => column.selector))
          .includes(column.selector)
    ),
    [selectedColumns]
  )

  const download = async () => {
    const blob = new Blob(["a".repeat(3100000)], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "relatorio.pdf"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DefaultLayout>
      <div className="p-12">
        <h1 className="text-2xl font-bold mb-4">Resultados</h1>
        <h2 className="text-xl font-bold">Colunas</h2>
          <MultiSelect
            entries={columns.map(column => ({ label: column.name, value: column.selector }))}
            selected={selectedColumns}
            onChange={setSelectedColumns}
            placeholder="Selecione as colunas"
            className="mt-2"
          />
        <h2 className="text-xl font-bold mt-4">Filtros</h2>
        <div className="grid gap-2 mt-1 grid-cols-4">
          <div>
            <Label>UFs</Label>
            <MultiSelect
              entries={infos.ufs.map(uf => ({ label: uf, value: uf }))}
              selected={selectedUfs}
              onChange={setSelectedUfs}
              placeholder="UFs"
            />
          </div>
          <div>
            <Label>Municípios</Label>
            <MultiSelect
              entries={municipios.map(municipio => ({ label: municipio, value: municipio }))}
              selected={selectedMunicipios}
              onChange={setSelectedMunicipios}
              disabled={selectedUfs.length === 0}
              placeholder="Municípios"
            />
          </div>
          <div>
            <Label>Tipos de Geração</Label>
            <MultiSelect
              entries={infos.tipos_geracao.map(tipo => ({ label: tipo, value: tipo }))}
              selected={selectedTiposGeracao}
              onChange={setSelectedTiposGeracao}
              placeholder="Tipos de Geração"
            />
          </div>
          <div>
            <Label>Fases da Usina</Label>
            <MultiSelect
              entries={infos.fases_usina.map(fase => ({ label: fase, value: fase }))}
              selected={selectedFasesUsina}
              onChange={setSelectedFasesUsina}
              placeholder="Fases da Usina"
            />
          </div>
          <div>
            <Label>Origens do Combustível</Label>
            <MultiSelect
              entries={infos.origens_combustivel.map(origem => ({ label: origem, value: origem }))}
              selected={selectedOrigensCombustivel}
              onChange={setSelectedOrigensCombustivel}
              placeholder="Origens do Combustível"
            />
          </div>
          <div>
            <Label>Fontes do Combustível</Label>
            <MultiSelect
              entries={infos.fontes_combustivel.map(font => ({ label: font, value: font }))}
              selected={selectedFontesCombustivel}
              onChange={setSelectedFontesCombustivel}
              placeholder="Fontes do Combustível"
            />
          </div>
        </div>
        <div className="flex items-center pb-4 mt-4">
          <div>
            <Label>Quantidade de linhas</Label>
            <Select onValueChange={data => setPageSize(Number(data))} defaultValue={String(pageSize)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={String(10)}>10</SelectItem>
                <SelectItem value={String(20)}>20</SelectItem>
                <SelectItem value={String(50)}>50</SelectItem>
                <SelectItem value={String(100)}>100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full">
          <div className="rounded-md border">
            <div className="max-h-[600px] relative overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-secondary">
                  <TableRow>
                    {visibleColumns.map(column => (
                      <TableHead key={column.name} className="whitespace-nowrap">
                        {column.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((row) => (
                      <TableRow
                        key={row._id}
                      >
                        {visibleColumns.map(column => (
                          <TableCell key={column.name} className="whitespace-nowrap">
                            {row[column.selector as never] !== null ? (column.format ? column.format(row[column.selector as never]) : row[column.selector as never]) : "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={23}
                        className="text-center"
                      >
                        Nenhum resultado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Página {currentPage + 1} de {Math.floor(totalItems / pageSize) + 1}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={isLoading || currentPage === 0}
            >
              <ArrowLeft />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={isLoading || currentPage === Math.floor(totalItems / pageSize)}
            >
              <ArrowRight />
            </Button>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-2">Gráficos</h1>
        <Dialog
          open={addGraphOpen}
          onOpenChange={value => {
            if (!value) {
              setEnableAddGraph(false)
              setSelectedChartToAdd(null)
              setGraphToAddData(null)
            }

            setAddGraphOpen(value)
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setAddGraphOpen(true)}>Adicionar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar gráfico</DialogTitle>
            </DialogHeader>
            <Label>Tipo de gráfico</Label>
            <Select value={selectedChartToAdd ?? undefined} onValueChange={setSelectedChartToAdd}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(charts).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedChartToAdd !== null && charts[selectedChartToAdd as keyof typeof charts]?.getArgs({
              ufs: infos.ufs,
              tiposGeracao: infos.tipos_geracao,
              fasesUsina: infos.fases_usina,
              origensCombustivel: infos.origens_combustivel,
              fontesCombustivel: infos.fontes_combustivel,
              municipios,
              onComplete: (data) => {
                setEnableAddGraph(true)
                setGraphToAddData(data as never)
              }
            })}
            <DialogFooter>
              <Button
                type="submit"
                disabled={!enableAddGraph}
                onClick={async () => {
                  setAddGraphOpen(false)
                  setEnableAddGraph(false)
                  const chart = charts[selectedChartToAdd as keyof typeof charts]
                  const data = chart.getUrl(graphToAddData as never)
                  setGraphs(graphs => [...graphs, data])
                  setSelectedChartToAdd(null)
                  setGraphToAddData(null)
                }}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="py-8 flex flex-col gap-8">
          {graphs.map((graph, index) => (
            <img key={graph} src={graph} alt={`Gráfico ${index}`} />
          ))}
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-2">Relatórios</h1>
        <div className="flex items-center space-x-2">
          <Dialog open={open2}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen2(true)}>Gerar relatório em PDF</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Emitir relatório</DialogTitle>
              </DialogHeader>
              <Label>Observação</Label>
              <Textarea></Textarea>
              <DialogFooter>
                <Button type="submit" onClick={() => {toast.success("Relatório gerado com sucesso");setOpen2(false);download()}}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button>Gerar relatório em XLSX</Button>
        </div>
      </div>
    </DefaultLayout>
  )
}
