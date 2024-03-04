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
import { Label } from "@/components/ui/label"
import { useQueryParam, ArrayParam, NumberParam, withDefault, StringParam } from "use-query-params"
import { useLocation } from "react-router"
import charts from "@/charts"
import Image from "@/components/Image"
import RelatoryDialog from "@/components/RelatoryDialog"
import request from "@/lib/request"
import usePagination from "@/lib/usePagination"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

export const options = {
  title: "Todas as fases dos empreendimentos eólicos do RN",
  vAxis: { title: "Cidade" },
  hAxis: { title: "Quantidade" },
  seriesType: "bars"
};

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
  { name: "Data de Entrada em Operação", selector: "DatEntradaOperacao", format: (data: number) => moment.unix(Number(data)).format("L") },
  { name: "Potência Outorgada (kW)", selector: "MdaPotenciaOutorgadaKw" },
  { name: "Potência Fiscalizada (kW)", selector: "MdaPotenciaFiscalizadaKw" },
  { name: "Garantia Física (kW)", selector: "MdaGarantiaFisicaKw" },
  { name: "Geração Qualificada", selector: "IdcGeracaoQualificada", format: (data: boolean) => data ? "Sim" : "Não" },
  { name: "Coordenada N do Empreendimento", selector: "NumCoordNEmpreendimento" },
  { name: "Coordenada E do Empreendimento", selector: "NumCoordEEmpreendimento" },
  { name: "Início da Vigência", selector: "DatInicioVigencia", format: (data: number) => moment.unix(Number(data)).format("L") },
  { name: "Fim da Vigência", selector: "DatFimVigencia", format: (data: number) => moment.unix(Number(data)).format("L") },
  { name: "Proprietário do Regime de Participação", selector: "DscPropriRegimePariticipacao" },
  { name: "Sub-Bacia", selector: "DscSubBacia" },
  { name: "Municípios", selector: "DscMuninicpios" }
]

const columnsDistribuida: { name: string, selector: string, format?: (data: never) => string }[] = []

interface FilterableColumn {
  id: string
  type: "select" | "date" | "number" | "boolean" | "multiSelect"
  label: string
  fixed?: boolean
}

const filterableColumns: FilterableColumn[] = [
  { id: "uf", type: "select", label: "UF", fixed: true },
  { id: "municipio", type: "multiSelect", label: "Municípios" },
  { id: "tipoGeracao", type: "multiSelect", label: "Tipos de Geração" },
  { id: "faseUsina", type: "multiSelect", label: "Fases da Usina" },
  { id: "origemCombustivel", type: "multiSelect", label: "Origens do Combustível" },
  { id: "fonteCombustivel", type: "multiSelect", label: "Fontes do Combustível" },
  { id: "potenciaOutorgada", type: "number", label: "Potência Outorgada" },
  { id: "potenciaFiscalizada", type: "number", label: "Potência Fiscalizada" },
  { id: "garantiaFisica", type: "number", label: "Garantia Física" },
  { id: "geracaoQualificada", type: "boolean", label: "Geração Qualificada" },
  { id: "inicioVigencia", type: "date", label: "Início da Vigência" },
  { id: "fimVigencia", type: "date", label: "Fim da Vigência" },
  { id: "proprietarioRegimeParticipacao", type: "select", label: "Proprietário do Regime de Participação" },
  { id: "subBacia", type: "select", label: "Sub-Bacia" }
]

const schema = z.object({
  filters: z.array(
    z.object({
      id: z.string(),
      comparator: z.enum(["eq", "neq", "gt", "lt", "gte", "lte", "in", "nin"]),
      value: z.union([
        z.string(),
        z.array(z.string()),
        z.number(),
        z.boolean()
      ])
    })
  )
})

type Filter = z.infer<typeof schema>

export default () => {
  const { search } = useLocation()
  const base = new URLSearchParams(search).get("base") ?? "centralizada"

  let columns = columnsCentralizada

  if (base === "distribuida") {
    columns = columnsDistribuida
  }

  const filterForm = useForm<Filter>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      filters: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: filterForm.control,
    name: "filters"
  })

  const { data: infos } = useSuspenseQuery<{
    ufs: string[],
    tipos_geracao: string[],
    fases_usina: string[],
    origens_combustivel: string[],
    fontes_combustivel: string[]
  }>({
    queryKey: ["infos", base],
    queryFn: async () => {
      const data = unpack(
        new Uint8Array(
          await request(`/dados/${base}/infos`).then(res => res.arrayBuffer()) as ArrayBufferLike
        )
      )

      return {
        ufs: data[0],
        tipos_geracao: data[1],
        fases_usina: data[2],
        origens_combustivel: data[3],
        fontes_combustivel: data[4]
      }
    }
  })

  const [data, setData] = useState<Dado[]>([])
  const [pageSize, setPageSize] = useQueryParam("items", withDefault(NumberParam, 10))
  const [currentPage, setCurrentPage] = useQueryParam("pagina", withDefault(NumberParam, 0))
  const [state, setState] = useQueryParam("estado", withDefault(StringParam, "RN"))
  const [totalItems, setTotalItems] = useState(0)
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
  const [graphs, setGraphs] = useState<{ name: string, url: string }[]>([])

  const pages = usePagination({ currentPage, pageSize, totalCount: totalItems })

  const paramsString = new URLSearchParams([
    ["uf", state],
    ...selectedTiposGeracao.map(tipo => ["tipo", tipo]),
    ...selectedFasesUsina.map(fase => ["fase", fase]),
    ...selectedOrigensCombustivel.map(origem => ["origem", origem]),
    ...selectedFontesCombustivel.map(fonte => ["fonte", fonte]),
    ...selectedMunicipios.map(municipio => ["municipio", municipio])
  ]).toString()

  const { data: empreendimentos } = useQuery<{ count: number, records: Dado[] }>({
    queryKey: [
      "dados",
      base,
      currentPage,
      pageSize,
      paramsString
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const data = unpack(
        new Uint8Array(
          await request(`/dados/${base}/?${paramsString}&limit=${pageSize}&page=${currentPage}`).then(res => res.arrayBuffer()) as ArrayBufferLike
        )
      )

      return {
        records: data[0].map((record: never[]) => {
          return {
            _id: record[0],
            NomEmpreendimento: record[1],
            IdeNucleoCEG: record[2],
            CodCEG: record[3],
            SigUFPrincipal: record[4],
            SigTipoGeracao: record[5],
            DscFaseUsina: record[6],
            DscOrigemCombustivel: record[7],
            DscFonteCombustivel: record[8],
            DscTipoOutorga: record[9],
            NomFonteCombustivel: record[10],
            DatEntradaOperacao: record[11],
            MdaPotenciaOutorgadaKw: record[12],
            MdaPotenciaFiscalizadaKw: record[13],
            MdaGarantiaFisicaKw: record[14],
            IdcGeracaoQualificada: record[15],
            NumCoordNEmpreendimento: record[16],
            NumCoordEEmpreendimento: record[17],
            DatInicioVigencia: record[18],
            DatFimVigencia: record[19],
            DscPropriRegimePariticipacao: record[20],
            DscSubBacia: record[21],
            DscMuninicpios: record[22]
          }
        }),
        count: data[1]
      }
    }
  })

  const { data: municipios } = useQuery<string[]>({
    queryKey: ["municipios", state],
    initialData: [],
    queryFn: async () =>
      unpack(
        new Uint8Array(
          await request(`/dados/${base}/municipios/?ufs=${state}`).then(res => res.arrayBuffer()) as ArrayBufferLike
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

  const args = {
    ufs: infos.ufs,
    tiposGeracao: infos.tipos_geracao,
    fasesUsina: infos.fases_usina,
    origensCombustivel: infos.origens_combustivel,
    fontesCombustivel: infos.fontes_combustivel,
    municipios,
    search: paramsString
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
            <Label>UF</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {infos.ufs.map(uf => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Municípios</Label>
            <MultiSelect
              entries={municipios.map(municipio => ({ label: municipio, value: municipio }))}
              selected={selectedMunicipios}
              onChange={setSelectedMunicipios}
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
          <div>
            <Label>Fontes do Combustível</Label>
            <MultiSelect
              entries={infos.fontes_combustivel.map(font => ({ label: font, value: font }))}
              selected={selectedFontesCombustivel}
              onChange={setSelectedFontesCombustivel}
              placeholder="Fontes do Combustível"
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
            {totalItems} resultados
          </div>
          <div className="space-x-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button variant="ghost" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>
                    <ArrowLeft />
                  </Button>
                </PaginationItem>
                {pages.map((page, index) => page === "..." ? (
                  <PaginationEllipsis key={index} />
                ) : (
                  <PaginationItem key={page}>
                    <Button
                      onClick={() => setCurrentPage(page as number - 1)}
                      variant={currentPage === page as number - 1 ? "outline" : "ghost"}
                    >
                      {(page as number)}
                    </Button>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <Button variant="ghost" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.floor(totalItems / pageSize)}>
                    <ArrowRight />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-2">Gráficos</h1>
        <div className="flex gap-2">
          {Object.entries(charts).map(([key, value]) => (
            <Label key={key} className="text-center flex items-center justify-center gap-1">
              <Checkbox
                checked={graphs.some(g => g.url === value.getUrl(args))}
                onCheckedChange={checked =>
                  setGraphs(graphs =>
                    checked
                      ? [
                          ...graphs,
                          {
                            name: value.getTitle(args),
                            url: value.getUrl(args)
                          }
                        ]
                      : graphs.filter(g => g.url !== value.getUrl(args))
                  )
                }
              />
              {value.getTitle(args)}
            </Label>
          ))}
        </div>
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 900: 2 }}
        >
          <Masonry>
            {graphs.map(graph => (
              <div key={graph.url} className="flex flex-col gap-2 p-1">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-center">{graph.name}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGraphs(graphs => graphs.filter(g => g.url !== graph.url))}
                  >
                    Remover
                  </Button>
                </div>
                <Image src={`${graph.url}?${paramsString}`} alt={graph.name} />
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
        <h1 className="text-2xl font-bold mt-4 mb-2">Relatórios</h1>
        <div className="flex items-center space-x-2">
          <RelatoryDialog
            url={`${import.meta.env.VITE_BACKEND_URL}/dados/${base}/relatorio_pdf?${paramsString}`}
            filename="relatorio.pdf"
            title="Emitir relatório em PDF"
          />
          <RelatoryDialog
            url={`${import.meta.env.VITE_BACKEND_URL}/dados/${base}/relatorio_xlsx?${paramsString}`}
            filename="relatorio.xlsx"
            title="Emitir relatório em XLSX"
          />
        </div>
      </div>
    </DefaultLayout>
  )
}
