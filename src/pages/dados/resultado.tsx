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
import { PieChart } from "@mui/x-charts"
import { Table } from "@/components/Table"
import { unpack } from "msgpackr"
import { wrap } from "comlink"
import type { DbWorker, Dado } from "../../worker"
import { useSuspenseQuery } from "@tanstack/react-query"
import MultiSelect from "@/components/MultiSelect"

const FormSchema = z.object({
  pageSize: z.number().min(1).max(1000).default(10),
  filters: z.array(z.object({
    key: z.string(),
    action: z.union([z.literal("eq"), z.literal("neq"), z.literal("gt"), z.literal("lt"), z.literal("gte"), z.literal("lte"), z.literal("in"), z.literal("nin"), z.literal("contains"), z.literal("ncontains"), z.literal("fulltext")]),
    value: z.array(z.union([z.string(), z.number(), z.boolean()])).default([]),
  })).default([]),
})

export default () => {
  const db = useMemo(
    () => wrap<typeof DbWorker>(new Worker(new URL("../../worker", import.meta.url), { type: "module" })),
    []
  )

  const { data: loadedData } = useSuspenseQuery({
    queryKey: ["dados"],
    queryFn: async () =>
      unpack(
        new Uint8Array(
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/dados/`).then(res => res.arrayBuffer()) as ArrayBufferLike
        )
      )
  })

  const [loading, setLoading] = useState(true)

  const [data, setData] = useState<Dado[]>([])
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [ufs, setUfs] = useState<string[]>([])
  const [selectedUfs, setSelectedUfs] = useState<string[]>([])
  const [municios, setMunicipios] = useState<string[]>([])
  const [selectedMunicipios, setSelectedMunicipios] = useState<string[]>([])
  const [tiposGeracao, setTiposGeracao] = useState<string[]>([])
  const [selectedTiposGeracao, setSelectedTiposGeracao] = useState<string[]>([])
  const [origensCombustivel, setOrigensCombustivel] = useState<string[]>([])
  const [selectedOrigensCombustivel, setSelectedOrigensCombustivel] = useState<string[]>([])
  const [fontsCombustivel, setFontsCombustivel] = useState<string[]>([])
  const [selectedFontsCombustivel, setSelectedFontsCombustivel] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      await db.setData(loadedData)
      setTotalItems(await db.getTotal({}))
      setData(await db.get(currentPage, pageSize, {}))
      setLoading(false)
      db.getUfs().then(setUfs)
      db.getTiposGeracao().then(setTiposGeracao)
      db.getOrigensCombustivel().then(setOrigensCombustivel)
      db.getFontesCombustivel().then(setFontsCombustivel)
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

    if (selectedMunicipios.length > 0) {
      filters["DscMuninicpios"] = { $in: selectedMunicipios }
    }

    if (selectedTiposGeracao.length > 0) {
      filters["SigTipoGeracao"] = { $in: selectedTiposGeracao }
    }

    if (selectedOrigensCombustivel.length > 0) {
      filters["DscOrigemCombustivel"] = { $in: selectedOrigensCombustivel }
    }

    if (selectedFontsCombustivel.length > 0) {
      filters["DscFonteCombustivel"] = { $in: selectedFontsCombustivel }
    }

    db.getTotal(filters).then(setTotalItems)
    db.get(currentPage, pageSize, filters)
      .then(setData)
  }, [currentPage, pageSize, selectedUfs, selectedMunicipios, selectedTiposGeracao, selectedOrigensCombustivel, selectedFontsCombustivel])

  useEffect(() => {
    db.getMunicipios(selectedUfs).then(setMunicipios)
  }, [selectedUfs])

  return (
    <DefaultLayout>
      <Form {...form}>
        <div className="p-10">
          <h1 className="text-2xl font-bold mb-4">Resultados</h1>
          <h2 className="text-xl font-bold">Filtros</h2>
          <div className="flex flex-wrap gap-4">
            <MultiSelect
              entries={ufs.map(uf => ({ label: uf, value: uf }))}
              selected={selectedUfs}
              onChange={setSelectedUfs}
              placeholder="UFs"
              className="max-w-96"
            />
            <MultiSelect
              entries={municios.map(municipio => ({ label: municipio, value: municipio }))}
              selected={selectedMunicipios}
              onChange={setSelectedMunicipios}
              disabled={selectedUfs.length === 0}
              placeholder="Municípios"
              className="max-w-96"
            />
            <MultiSelect
              entries={tiposGeracao.map(tipo => ({ label: tipo, value: tipo }))}
              selected={selectedTiposGeracao}
              onChange={setSelectedTiposGeracao}
              placeholder="Tipos de Geração"
              className="max-w-96"
            />
            <MultiSelect
              entries={origensCombustivel.map(origem => ({ label: origem, value: origem }))}
              selected={selectedOrigensCombustivel}
              onChange={setSelectedOrigensCombustivel}
              placeholder="Origens do Combustível"
              className="max-w-96"
            />
            <MultiSelect
              entries={fontsCombustivel.map(font => ({ label: font, value: font }))}
              selected={selectedFontsCombustivel}
              onChange={setSelectedFontsCombustivel}
              placeholder="Fontes do Combustível"
              className="max-w-96"
            />
          </div>
          <div className="flex items-center pb-4">
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
                      <TableHead>ID</TableHead>
                      <TableHead>Nome do Empreendimento</TableHead>
                      <TableHead>Núcleo CEG</TableHead>
                      <TableHead>Código CEG</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Tipo de Geração</TableHead>
                      <TableHead>Fase da Usina</TableHead>
                      <TableHead>Origem do Combustível</TableHead>
                      <TableHead>Fonte do Combustível</TableHead>
                      <TableHead>Tipo de Outorga</TableHead>
                      <TableHead>Nome da Fonte do Combustível</TableHead>
                      <TableHead>Data de Entrada em Operação</TableHead>
                      <TableHead>Potência Outorgada (kW)</TableHead>
                      <TableHead>Potência Fiscalizada (kW)</TableHead>
                      <TableHead>Garantia Física (kW)</TableHead>
                      <TableHead>Geração Qualificada</TableHead>
                      <TableHead>Coordenada N do Empreendimento</TableHead>
                      <TableHead>Coordenada E do Empreendimento</TableHead>
                      <TableHead>Início da Vigência</TableHead>
                      <TableHead>Fim da Vigência</TableHead>
                      <TableHead>Proprietário do Regime de Participação</TableHead>
                      <TableHead>Sub-Bacia</TableHead>
                      <TableHead>Municípios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length > 0 ? (
                      data.map((row) => (
                        <TableRow
                          key={row._id}
                        >
                          <TableCell>{row._id}</TableCell>
                          <TableCell>{row.NomEmpreendimento}</TableCell>
                          <TableCell>{row.IdeNucleoCEG}</TableCell>
                          <TableCell>{row.CodCEG}</TableCell>
                          <TableCell>{row.SigUFPrincipal}</TableCell>
                          <TableCell>{row.SigTipoGeracao}</TableCell>
                          <TableCell>{row.DscFaseUsina}</TableCell>
                          <TableCell>{row.DscOrigemCombustivel}</TableCell>
                          <TableCell>{row.DscFonteCombustivel}</TableCell>
                          <TableCell>{row.DscTipoOutorga}</TableCell>
                          <TableCell>{row.NomFonteCombustivel}</TableCell>
                          <TableCell>{moment(row.DatEntradaOperacao).format("L")}</TableCell>
                          <TableCell>{row.MdaPotenciaOutorgadaKw}</TableCell>
                          <TableCell>{row.MdaPotenciaFiscalizadaKw}</TableCell>
                          <TableCell>{row.MdaGarantiaFisicaKw}</TableCell>
                          <TableCell>{row.IdcGeracaoQualificada ? "Sim" : "Não"}</TableCell>
                          <TableCell>{row.NumCoordNEmpreendimento}</TableCell>
                          <TableCell>{row.NumCoordEEmpreendimento}</TableCell>
                          <TableCell>{moment(row.DatInicioVigencia).format("L")}</TableCell>
                          <TableCell>{moment(row.DatFimVigencia).format("L")}</TableCell>
                          <TableCell>{row.DscPropriRegimePariticipacao}</TableCell>
                          <TableCell>{row.DscSubBacia}</TableCell>
                          <TableCell>{row.DscMuninicpios}</TableCell>
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
                onClick={() => setCurrentPage(state => state - 1)}
                disabled={currentPage === 0}
              >
                <ArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(state => state + 1)}
                disabled={currentPage === Math.floor(totalItems / pageSize)}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>
          <h1 className="text-2xl font-bold mt-4 mb-2">Gráficos</h1>
          <FormLabel>Selecione os dados a serem exibidos:</FormLabel>
          <MultiSelect
            selected={["red"]}
            entries={[{ label: "Cenário Nacional - Geração Distribuída", value: "red" }, { label: "Empreendimentos Eólicos", value: "blue" }, { label: "Todas as fases dos empreendimentos eólicos do RN", value: "green" }]}
            onChange={() => { }}
          />
          <h2 className="mt-4">Cenário Nacional - Geração Distribuída</h2>
          <PieChart
            skipAnimation={true}
            title="Cenário Nacional - Geração Distribuída"
            series={[
              {
                data: [
                  { id: 0, value: 73.4, label: "Brasil" },
                  { id: 1, value: 26.6, label: "RN" }
                ]
              }
            ]}
            width={400}
            height={200}
          />
        </div>
      </Form>
    </DefaultLayout>
  )
}
