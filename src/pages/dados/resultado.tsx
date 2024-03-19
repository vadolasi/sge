/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { ArrowLeft, ArrowRight, Trash } from "lucide-react"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { Input } from "@/components/ui/input"

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

const columnsCentralizada: Record<string, { name: string, format?: (data: never) => string }> = {
  _id: { name: "ID" },
  NomEmpreendimento: { name: "Nome do Empreendimento" },
  IdeNucleoCEG: { name: "Núcleo CEG" },
  CodCEG: { name: "Código CEG" },
  SigUFPrincipal: { name: "UF" },
  SigTipoGeracao: { name: "Tipo de Geração" },
  DscFaseUsina: { name: "Fase da Usina" },
  DscOrigemCombustivel: { name: "Origem do Combustível" },
  DscFonteCombustivel: { name: "Fonte do Combustível" },
  DscTipoOutorga: { name: "Tipo de Outorga" },
  NomFonteCombustivel: { name: "Nome da Fonte do Combustível" },
  DatEntradaOperacao:{ name: "Data de Entrada em Operação", format: (data: number) => moment.unix(Number(data)).format("L") },
  MdaPotenciaOutorgadaKw: { name: "Potência Outorgada (kW)" },
  MdaPotenciaFiscalizadaKw: { name: "Potência Fiscalizada (kW)" },
  MdaGarantiaFisicaKw: { name: "Garantia Física (kW)" },
  IdcGeracaoQualificada: { name: "Geração Qualificada", format: (data: boolean) => data ? "Sim" : "Não" },
  NumCoordNEmpreendimento: { name: "Coordenada N do Empreendimento" },
  NumCoordEEmpreendimento: { name: "Coordenada E do Empreendimento" },
  DatInicioVigencia: { name: "Início da Vigência", format: (data: number) => moment.unix(Number(data)).format("L") },
  DatFimVigencia: { name: "Fim da Vigência", format: (data: number) => moment.unix(Number(data)).format("L") },
  DscPropriRegimePariticipacao: { name: "Proprietário do Regime de Participação" },
  DscSubBacia: { name: "Sub-Bacia" },
  DscMuninicpios: { name: "Municípios" }
}

const columnsDistribuida: { name: string, selector: string, format?: (data: never) => string }[] = []

const filterableColumns: Record<string, string> = {
  DscMuninicpios: "multiSelect",
  SigTipoGeracao: "multiSelect",
  DscFaseUsina: "multiSelect",
  DscOrigemCombustivel: "multiSelect",
  DscFonteCombustivel: "multiSelect",
  MdaPotenciaOutorgadaKw: "number",
  MdaPotenciaFiscalizadaKw: "number",
  MdaGarantiaFisicaKw: "number",
  IdcGeracaoQualificada: "boolean",
  DatInicioVigencia: "date",
  DatFimVigencia: "date",
  DatEntradaOperacao: "date"
}

const filterFiledsType: Record<string, string[]> = {
  multiSelect: ["in", "nin"],
  select: ["eq"],
  number: ["eq", "neq", "gte", "lte"],
  date: ["eq", "gte", "lte"]
}

const schema = z.object({
  filters: z.array(
    z.object({
      column: z.string().nullable(),
      comparator: z.enum(["eq", "neq", "gte", "lte", "in", "nin"]).nullable(),
      value: z.union([
        z.string(),
        z.array(z.string()),
        z.number(),
        z.boolean()
      ]).nullable()
    })
  )
})

const comparatorLabels = {
  eq: "Igual a",
  neq: "Diferente de",
  gte: "Maior ou igual a",
  lte: "Menor ou igual a",
  in: "Igual a",
  nin: "Diferente de"
}

type Filter = z.infer<typeof schema>

export default () => {
  const { search } = useLocation()
  const base = new URLSearchParams(search).get("base") ?? "centralizada"

  let columns = Object.keys(columnsCentralizada)

  if (base === "distribuida") {
    columns = Object.keys(columnsDistribuida)
  }

  const filterForm = useForm<Filter>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      filters: []
    }
  })

  const { fields: filters, append, remove } = useFieldArray({
    control: filterForm.control,
    name: "filters"
  })

  const currentFilters = filterForm.watch("filters")

  const { data: fetchedInfos } = useSuspenseQuery<{
    ufs: string[],
    SigTipoGeracao: string[],
    DscFaseUsina: string[],
    DscOrigemCombustivel: string[],
    NomFonteCombustivel: string[],
    DscMuninicpios: string[]
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
        SigTipoGeracao: data[1],
        DscFaseUsina: data[2],
        DscOrigemCombustivel: data[3],
        NomFonteCombustivel: data[4],
        DscMuninicpios: []
      }
    }
  })

  const [infos, setInfos] = useState<Record<string, string[]>>(fetchedInfos)

  const [data, setData] = useState<Dado[]>([])
  const [pageSize, setPageSize] = useQueryParam("items", withDefault(NumberParam, 10))
  const [currentPage, setCurrentPage] = useQueryParam("pagina", withDefault(NumberParam, 0))
  const [state, setState] = useQueryParam("estado", withDefault(StringParam, "RN"))
  const [totalItems, setTotalItems] = useState(0)
  const [graphs, setGraphs] = useState<{ name: string, url: string }[]>([])

  const pages = usePagination({ currentPage, pageSize, totalCount: totalItems })

  const [searchString, setSearchString] = useState(`SigUFPrincipal__eq=${state}`)

  const { data: empreendimentos } = useQuery<{ count: number, records: Dado[] }>({
    queryKey: [
      "dados",
      base,
      currentPage,
      pageSize,
      searchString
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const data = unpack(
        new Uint8Array(
          await request(`/dados/${base}/?${searchString}&limit=${pageSize}&page=${currentPage}`).then(res => res.arrayBuffer()) as ArrayBufferLike
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
          await request(`/dados/${base}/municipios/?SigUFPrincipal__eq=${state}`).then(res => res.arrayBuffer()) as ArrayBufferLike
        )
      )
  })

  useEffect(() => {
    setInfos(infos => ({
      ...infos,
      DscMuninicpios: municipios
    }))
  }, [municipios])

  const [querySelectedColumns, setSelectedColumns] = useQueryParam("coluna", withDefault(ArrayParam, []))
  const selectedColumns = useMemo<string[]>(() => querySelectedColumns.filter(column => column !== null) as string[], [querySelectedColumns])

  useEffect(() => {
    if (empreendimentos) {
      setData(empreendimentos.records)
      setTotalItems(empreendimentos.count)
    }
  }, [empreendimentos])

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
        (selectedColumns.length > 0 ? selectedColumns : columns)
          .includes(column)
    ),
    [selectedColumns]
  )

  const onFilter = filterForm.handleSubmit(data => {
    let searchString = data.filters
      .filter(filter => filter.column && filter.comparator && filter.value !== null)
      .flatMap(filter => {
        if (Array.isArray(filter.value)) {
          return filter.value.map(valueItem => `${filter.column}__${filter.comparator}=${encodeURIComponent(valueItem)}`)
        } else {
          return `${filter.column}__${filter.comparator}=${encodeURIComponent(filter.value)}`
        }
      })
      .join("&")

    if (searchString.length > 0) {
      searchString += "&"
    }

    searchString += `SigUFPrincipal__eq=${state}`

    setSearchString(searchString)
  })

  return (
    <DefaultLayout>
      <div className="p-12">
        <h1 className="text-2xl font-bold mb-4">Resultados</h1>
        <h2 className="text-xl font-bold">Colunas (em tela)</h2>
          <MultiSelect
            entries={columns.map(column => ({ label: columnsCentralizada[column].name, value: column }))}
            selected={selectedColumns}
            onChange={setSelectedColumns}
            placeholder="Selecione as colunas"
            className="mt-2"
          />
        <h2 className="text-xl font-bold mt-4">Filtros (para relatório)</h2>
        <div className="w-60">
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
        <Form {...filterForm}>
          <form onSubmit={onFilter}>
            {filters.map((filter, index) => (
              <div className="grid grid-cols-4 gap-x-4 gap-y-2 max-w-[50rem]">
                <FormField
                  control={filterForm.control}
                  name={`filters.${index}.column`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coluna</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um valor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(filterableColumns).map(column => (
                            <SelectItem key={`${filter.id}-${column}`} value={column}>{columnsCentralizada[column].name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {currentFilters[index].column !== null && (
                  <FormField
                    control={filterForm.control}
                    name={`filters.${index}.comparator`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condição</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um valor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filterFiledsType[filterableColumns[currentFilters[index].column]]?.map(column => (
                              <SelectItem key={`${filter.id}-${column}`} value={column}>{comparatorLabels[column]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {currentFilters[index].comparator !== null && (
                  <FormField
                    control={filterForm.control}
                    name={`filters.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                      <FormLabel>Valor(es)</FormLabel>
                        {{
                          multiSelect: () => (
                            <MultiSelect onChange={field.onChange} entries={infos[currentFilters[index].column].sort().map(info => ({ label: info, value: info }))} selected={field.value as string[] | null || []} />
                          ),
                          number: () => (
                            <Input type="number" {...field} value={field.value as number} />
                          ),
                          date: () => (
                            <Input type="date" {...field} onChange={ev => field.onChange(new Date(ev.currentTarget.value).getTime())} value={field.value as number} />
                          ),
                        }[filterableColumns[currentFilters[index].column]]()}
                      </FormItem>
                    )}
                  />
                )}
                <div className="flex pt-8">
                  <Button variant="outline" size="icon" type="button" onClick={() => remove(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" type="button" onClick={() => append({ column: null, comparator: null, value: null })} className="mt-5">Adicionar</Button>
            <Button type="submit" className="mt-5 ml-2">Salvar filtro</Button>
          </form>
        </Form>
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
                      <TableHead key={`column-${column}`} className="whitespace-nowrap">
                        {columnsCentralizada[column].name}
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
                          <TableCell key={column} className="whitespace-nowrap">
                            {row[column as never] !== null ? (columnsCentralizada[column].format ? columnsCentralizada[column].format(row[column as never]) : row[column as never]) : "-"}
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
                  <Button variant="ghost" onClick={() => setCurrentPage(currentPage => currentPage - 1)} disabled={currentPage === 0}>
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
                  <Button variant="ghost" onClick={() => setCurrentPage(currentPage => currentPage + 1)} disabled={currentPage === Math.floor(totalItems / pageSize)}>
                    <ArrowRight />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-2">Relatórios pré-definidos</h1>
        <div className="grid gap-2 grid-cols-3">
          {Object.entries(charts).map(([key, value]) => (
            <Label key={key} className="text-center flex items-center justify-center gap-1">
              <Checkbox
                checked={graphs.some(g => g.url === value.url)}
                onCheckedChange={checked =>
                  setGraphs(graphs =>
                    checked
                      ? [
                          ...graphs,
                          value
                        ]
                      : graphs.filter(g => g.url !== value.url)
                  )
                }
              />
              {value.name}
            </Label>
          ))}
        </div>
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 900: 2 }}
        >
          <Masonry>
            {graphs.map(graph => (
              <div key={graph.url} className="flex flex-col gap-2">
                <Label className="text-center text-lg mt-2">{graph.name}</Label>
                <Image src={`${graph.url}?${searchString}`} alt={graph.name} />
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
        <h1 className="text-2xl font-bold mt-4 mb-2">Relatórios</h1>
        <div className="flex items-center space-x-2">
          <RelatoryDialog
            url={`${import.meta.env.VITE_BACKEND_URL}/dados/${base}/relatorio_pdf?${searchString}`}
            filename="relatorio.pdf"
            title="Emitir relatório em PDF"
          />
          <RelatoryDialog
            url={`${import.meta.env.VITE_BACKEND_URL}/dados/${base}/relatorio_xlsx?${searchString}`}
            filename="relatorio.xlsx"
            title="Emitir relatório em XLSX"
          />
        </div>
      </div>
    </DefaultLayout>
  )
}
