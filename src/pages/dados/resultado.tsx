import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
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
import { useSuspenseQuery } from "@tanstack/react-query"
import { unpack } from "msgpackr"
import { useEffect, useMemo, useState } from "react"
import { Table } from "@/components/Table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

const FormSchema = z.object({
  pageSize: z.number().min(1).max(1000).default(10)
})

type Dado = {
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
  DatEntradaOperacao: Date
  MdaPotenciaOutorgadaKw: number
  MdaPotenciaFiscalizadaKw: number
  MdaGarantiaFisicaKw: number
  IdcGeracaoQualificada: string
  NumCoordNEmpreendimento: number
  NumCoordEEmpreendimento: number
  DatInicioVigencia: Date
  DatFimVigencia: Date
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

export const columns: ColumnDef<Dado>[] = [
  {
    accessorKey: "_id",
    header: "ID",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("_id")}</div>
  },
  {
    accessorKey: "NomEmpreendimento",
    header: "Nome do Empreendimento",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("NomEmpreendimento")}</div>
  },
  {
    accessorKey: "IdeNucleoCEG",
    header: "Núcleo CEG",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("IdeNucleoCEG")}</div>
  },
  {
    accessorKey: "CodCEG",
    header: "Código CEG",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("CodCEG")}</div>
  },
  {
    accessorKey: "SigUFPrincipal",
    header: "UF",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("SigUFPrincipal")}</div>
  },
  {
    accessorKey: "SigTipoGeracao",
    header: "Tipo de Geração",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("SigTipoGeracao")}</div>
  },
  {
    accessorKey: "DscFaseUsina",
    header: "Fase da Usina",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("DscFaseUsina")}</div>
  },
  {
    accessorKey: "DscOrigemCombustivel",
    header: "Origem do Combustível",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("DscOrigemCombustivel")}</div>
  },
  {
    accessorKey: "DscFonteCombustivel",
    header: "Fonte do Combustível",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("DscFonteCombustivel")}</div>
  },
  {
    accessorKey: "DscTipoOutorga",
    header: "Tipo de Outorga",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("DscTipoOutorga")}</div>
  },
  {
    accessorKey: "NomFonteCombustivel",
    header: "Nome da Fonte do Combustível",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("NomFonteCombustivel")}</div>
  },
  {
    accessorKey: "DatEntradaOperacao",
    header: "Data de Entrada em Operação",
    cell: ({ row }) => {
      const date = row.getValue<Date>("DatEntradaOperacao")

      return <div className="w-max">{moment(date).format("L")}</div>
    },
  },
  {
    accessorKey: "MdaPotenciaOutorgadaKw",
    header: "Potência Outorgada (kW)",
    cell: ({ row }) => <div className="w-max">{row.getValue<number>("MdaPotenciaOutorgadaKw")}</div>
  },
  {
    accessorKey: "MdaPotenciaFiscalizadaKw",
    header: "Potência Fiscalizada (kW)",
    cell: ({ row }) => <div className="w-max">{row.getValue<number>("MdaPotenciaFiscalizadaKw")}</div>
  },
  {
    accessorKey: "MdaGarantiaFisicaKw",
    header: "Garantia Física (kW)",
    cell: ({ row }) => <div className="w-max">{row.getValue<number>("MdaGarantiaFisicaKw")}</div>
  },
  {
    accessorKey: "IdcGeracaoQualificada",
    header: "Geração Qualificada",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("IdcGeracaoQualificada")}</div>
  },
  {
    accessorKey: "NumCoordNEmpreendimento",
    header: "Coordenada N do Empreendimento",
    cell: ({ row }) => <div className="w-max">{row.getValue<number>("NumCoordNEmpreendimento")}</div>
  },
  {
    accessorKey: "NumCoordEEmpreendimento",
    header: "Coordenada E do Empreendimento",
    cell: ({ row }) => <div className="w-max">{row.getValue<number>("NumCoordEEmpreendimento")}</div>
  },
  {
    accessorKey: "DatInicioVigencia",
    header: "Início da Vigência",
    cell: ({ row }) => {
      const date = row.getValue<Date>("DatInicioVigencia")

      return <div className="w-max">{moment(date).format("L")}</div>
    },
  },
  {
    accessorKey: "DatFimVigencia",
    header: "Fim da Vigência",
    cell: ({ row }) => {
      const date = row.getValue<Date>("DatFimVigencia")

      return <div className="w-max">{moment(date).format("L")}</div>
    },
  },
  {
    accessorKey: "DscPropriRegimePariticipacao",
    header: "Proprietário do Regime de Participação",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("DscPropriRegimePariticipacao")}</div>
  },
  {
    accessorKey: "DscSubBacia",
    header: "Sub-Bacia",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("DscSubBacia")}</div>
  },
  {
    accessorKey: "DscMuninicpios",
    header: "Municípios",
    cell: ({ row }) => <div className="w-max">{row.getValue<string>("DscMuninicpios")}</div>
  }
]

export default () => {
  const { data } = useSuspenseQuery<Dado[]>({
    queryKey: ["dados"],
    queryFn: async () => {
      return unpack(new Uint8Array(await fetch(`${import.meta.env.VITE_BACKEND_URL}/dados/`).then(res => res.arrayBuffer()) as ArrayBufferLike))
        .map((row: any) => {
          const obj: Dado = {} as Dado

          Object.entries(row).forEach(([key, value]) => {
            // @ts-ignore
            obj[codMap[Number(key)]] = value
          })

          return obj
        }
      )
    }
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      pageSize: 10
    }
  })

  useEffect(() => {
    const subscription = form.watch(({ pageSize }) => {
      let pageIndex = pagination.pageIndex

      if (data.length / (pageSize ?? 10) < pagination.pageIndex) {
        pageIndex = Math.floor(data.length / (pageSize ?? 10))
      }

      setPagination(state => ({
        ...state,
        pageSize: pageSize ?? state.pageSize,
        pageIndex
      }))
    })

    return () => subscription.unsubscribe()
  }, [form.watch])

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize
    }),
    [pageIndex, pageSize]
  )

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  return (
    <DefaultLayout>
      <Form {...form}>
        <div className="p-8">
          <h1></h1>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Colunas <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Página {pagination.pageIndex + 1} de {table.getPageCount()}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ArrowLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ArrowRight />
              </Button>
            </div>
          </div>

          <h1></h1>
        </div>
      </Form>
    </DefaultLayout>
  )
}
