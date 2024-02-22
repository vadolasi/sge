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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Table } from "@/components/Table"
import { unpack } from "msgpackr"
import { wrap } from "comlink"
import type { DbWorker, Dado } from "../../worker"
import { useSuspenseQuery } from "@tanstack/react-query"
import MultiSelect from "@/components/MultiSelect"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useQueryParam, ArrayParam, NumberParam, withDefault } from "use-query-params"
import { useLocation } from "react-router"
import { Chart } from "react-google-charts"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export const options = {
  title: "Todas as fases dos empreendimentos eólicos do RN",
  vAxis: { title: "Quantidade" },
  hAxis: { title: "Cidade" },
  seriesType: "bars"
};

const FormSchema = z.object({
  pageSize: z.number().min(1).max(1000).default(10),
  filters: z.array(z.object({
    key: z.string(),
    action: z.union([z.literal("eq"), z.literal("neq"), z.literal("gt"), z.literal("lt"), z.literal("gte"), z.literal("lte"), z.literal("in"), z.literal("nin"), z.literal("contains"), z.literal("ncontains"), z.literal("fulltext")]),
    value: z.array(z.union([z.string(), z.number(), z.boolean()])).default([]),
  })).default([]),
})

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

  const db = useMemo(
    () => wrap<typeof DbWorker>(new Worker(new URL("../../worker", import.meta.url), { type: "module" })),
    []
  )

  const { data: loadedData } = useSuspenseQuery({
    queryKey: ["dados", base],
    queryFn: async () =>
      unpack(
        new Uint8Array(
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/dados/${base}`).then(res => res.arrayBuffer()) as ArrayBufferLike
        )
      )
  })

  const [loading, setLoading] = useState(true)

  const [data, setData] = useState<Dado[]>([])
  const [pageSize, setPageSize] = useQueryParam("items", withDefault(NumberParam, 10))
  const [currentPage, setCurrentPage] = useQueryParam("pagina", withDefault(NumberParam, 0))
  const [totalItems, setTotalItems] = useState(0)
  const [ufs, setUfs] = useState<string[]>([])
  const [querySelectedUfs, setSelectedUfs] = useQueryParam("uf", withDefault(ArrayParam, []))
  const selectedUfs = useMemo<string[]>(() => querySelectedUfs.filter(uf => uf !== null) as string[], [querySelectedUfs])
  const [tiposGeracao, setTiposGeracao] = useState<string[]>([])
  const [querySelectedTiposGeracao, setSelectedTiposGeracao] = useQueryParam("tipoGeracao", withDefault(ArrayParam, []))
  const selectedTiposGeracao = useMemo<string[]>(() => querySelectedTiposGeracao.filter(tipo => tipo !== null) as string[], [querySelectedTiposGeracao])
  const [fasesUsina, setFasesUsina] = useState<string[]>([])
  const [querySelectedFasesUsina, setSelectedFasesUsina] = useQueryParam("faseUsina", withDefault(ArrayParam, []))
  const selectedFasesUsina = useMemo<string[]>(() => querySelectedFasesUsina.filter(fase => fase !== null) as string[], [querySelectedFasesUsina])
  const [origensCombustivel, setOrigensCombustivel] = useState<string[]>([])
  const [querySelectedOrigensCombustivel, setSelectedOrigensCombustivel] = useQueryParam("origemCombustivel", withDefault(ArrayParam, []))
  const selectedOrigensCombustivel = useMemo<string[]>(() => querySelectedOrigensCombustivel.filter(origem => origem !== null) as string[], [querySelectedOrigensCombustivel])
  const [fontesCombustivel, setFontesCombustivel] = useState<string[]>([])
  const [querySelectedFontesCombustivel, setSelectedFontesCombustivel] = useQueryParam("fonteCombustivel", withDefault(ArrayParam, []))
  const selectedFontesCombustivel = useMemo<string[]>(() => querySelectedFontesCombustivel.filter(font => font !== null) as string[], [querySelectedFontesCombustivel])
  const [municios, setMunicipios] = useState<string[]>([])
  const [querySelectedMunicipios, setSelectedMunicipios] = useQueryParam("municipio", withDefault(ArrayParam, []))
  const selectedMunicipios = useMemo<string[]>(() => querySelectedMunicipios.filter(municipio => municipio !== null) as string[], [querySelectedMunicipios])
  const [eSelected, setESelected] = useState(false)
  const [eSelected2, setESelected2] = useState(false)
  const [eSelected3, setESelected3] = useState(false)
  const [open, setOpen] = useState(false)
  const [open2, setOpen2] = useState(false)
  const [graphData, setGraphData] = useState<never[][]>([])

  const [querySelectedColumns, setSelectedColumns] = useQueryParam("coluna", withDefault(ArrayParam, []))
  const selectedColumns = useMemo<string[]>(() => querySelectedColumns.filter(column => column !== null) as string[], [querySelectedColumns])

  useEffect(() => {
    (async () => {
      await db.setData(loadedData)
      setTotalItems(await db.getTotal({}))
      setData(await db.get(currentPage, pageSize, {}))
      db.getGraph("RN").then(setGraphData)
      setLoading(false)
      db.getUfs().then(setUfs)
      db.getTiposGeracao().then(setTiposGeracao)
      db.getFasesUsina().then(setFasesUsina)
      db.getOrigensCombustivel().then(setOrigensCombustivel)
      db.getFontesCombustivel().then(setFontesCombustivel)
    })()
  }, [])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      pageSize: 10
    }
  })

  useEffect(() => {
    const subscription = form.watch(({ pageSize }) => {
      let pageIndex = currentPage

      if (data.length / (pageSize ?? 10) < currentPage) {
        pageIndex = Math.floor(data.length / (pageSize ?? 10))
      }

      setPageSize(pageSize ?? 10)
      setCurrentPage(pageIndex)
    })

    return () => subscription.unsubscribe()
  }, [form.watch])

  useEffect(() => {
    const filters: Record<string, unknown> = {}

    if (selectedUfs.length > 0) {
      filters["SigUFPrincipal"] = { $in: selectedUfs }
    }

    if (selectedTiposGeracao.length > 0) {
      filters["SigTipoGeracao"] = { $in: selectedTiposGeracao }
    }

    if (selectedFasesUsina.length > 0) {
      filters["DscFaseUsina"] = { $in: selectedFasesUsina }
    }

    if (selectedOrigensCombustivel.length > 0) {
      filters["DscOrigemCombustivel"] = { $in: selectedOrigensCombustivel }
    }

    if (selectedFontesCombustivel.length > 0) {
      filters["DscFonteCombustivel"] = { $in: selectedFontesCombustivel }
    }

    if (selectedMunicipios.length > 0) {
      filters["DscMuninicpios"] = { $in: selectedMunicipios }
    }

    db.getTotal(filters).then(setTotalItems)
    db.get(currentPage, pageSize, filters)
      .then(setData)
  }, [
    currentPage,
    pageSize,
    selectedUfs,
    selectedMunicipios,
    selectedTiposGeracao,
    selectedOrigensCombustivel,
    selectedFontesCombustivel,
    selectedFasesUsina
  ])

  useEffect(() => {
    db.getMunicipios(selectedUfs).then(setMunicipios)
  }, [selectedUfs])

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
      <Form {...form}>
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
                entries={ufs.map(uf => ({ label: uf, value: uf }))}
                selected={selectedUfs}
                onChange={setSelectedUfs}
                placeholder="UFs"
              />
            </div>
            <div>
              <Label>Municípios</Label>
              <MultiSelect
                entries={municios.map(municipio => ({ label: municipio, value: municipio }))}
                selected={selectedMunicipios}
                onChange={setSelectedMunicipios}
                disabled={selectedUfs.length === 0}
                placeholder="Municípios"
              />
            </div>
            <div>
              <Label>Tipos de Geração</Label>
              <MultiSelect
                entries={tiposGeracao.map(tipo => ({ label: tipo, value: tipo }))}
                selected={selectedTiposGeracao}
                onChange={setSelectedTiposGeracao}
                placeholder="Tipos de Geração"
              />
            </div>
            <div>
              <Label>Fases da Usina</Label>
              <MultiSelect
                entries={fasesUsina.map(fase => ({ label: fase, value: fase }))}
                selected={selectedFasesUsina}
                onChange={setSelectedFasesUsina}
                placeholder="Fases da Usina"
              />
            </div>
            <div>
              <Label>Origens do Combustível</Label>
              <MultiSelect
                entries={origensCombustivel.map(origem => ({ label: origem, value: origem }))}
                selected={selectedOrigensCombustivel}
                onChange={setSelectedOrigensCombustivel}
                placeholder="Origens do Combustível"
              />
            </div>
            <div>
              <Label>Fontes do Combustível</Label>
              <MultiSelect
                entries={fontesCombustivel.map(font => ({ label: font, value: font }))}
                selected={selectedFontesCombustivel}
                onChange={setSelectedFontesCombustivel}
                placeholder="Fontes do Combustível"
              />
            </div>
          </div>
          <div className="flex items-center pb-4 mt-4">
            <FormField
              control={form.control}
              name="pageSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade de linhas</FormLabel>
                  <Select onValueChange={data => field.onChange(Number(data))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={String(10)}>10</SelectItem>
                      <SelectItem value={String(20)}>20</SelectItem>
                      <SelectItem value={String(50)}>50</SelectItem>
                      <SelectItem value={String(100)}>100</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                          {loading ? "Carregando..." : "Nenhum resultado encontrado."}
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
                disabled={currentPage === 0}
              >
                <ArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === Math.floor(totalItems / pageSize)}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-4 mb-2">Gráficos</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setOpen(true)}>Adicionar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar gráfico</DialogTitle>
              </DialogHeader>
              <Label>Tipo de gráfico</Label>
              <Select onValueChange={() => setESelected(true)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar tipo de gráfico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qtd_potencia_empreendimentos">Potência e quantitativo dos empreendimentos</SelectItem>
                  <SelectItem value="fases_empreendimentos">Fases dos empreendimentos</SelectItem>
                  <SelectItem value="fim_vigencia">Fim da vigência dos empreendimentos</SelectItem>
                  <SelectItem value="qtv_empreendimentos_investidor">Quantitativo de empreendimentos por investidor</SelectItem>
                  <SelectItem value="potencia_investidor">Potência (MW) instalada por investidor</SelectItem>
                  <SelectItem value="potencia_tipo_geracao">Potência (MW) instalada por tipo de geração</SelectItem>
                  <SelectItem value="qtd_aerogeradores_fabricante">Quantidade de aerogeradores instalados por fabricante</SelectItem>
                  <SelectItem value="qtd_aerogeradores_modelo">Quantidade de aerogeradores instalados por modelo</SelectItem>
                  <SelectItem value="modelo_qtd_aerogeradores">Modelo e quantidade de aerogeradores instalados</SelectItem>
                  <SelectItem value="qtd_torres">Quantitativo de torres eólicas em operação por municípios</SelectItem>
                </SelectContent>
              </Select>
              {eSelected && (
                <Select onValueChange={() => setESelected2(true)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ufs.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!eSelected2}
                  onClick={() => {
                    setESelected3(true)
                    setOpen(false)
                  }}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {eSelected3 && (
            <Chart
              chartType="BarChart"
              width="100%"
              data={[[
                "Cidade",
                "Em operação",
                "Em construção",
                "Construção não iniciada"
              ], ...graphData]}
              options={options}
            />
          )}
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
      </Form>
    </DefaultLayout>
  )
}
