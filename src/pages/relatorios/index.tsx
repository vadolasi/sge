import DefaultLayout from "@/layouts/default"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowLeft, ArrowRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import "moment/locale/pt-br"
import moment from "moment"
import { Link } from "react-router-dom"

type Payment = {
  id: string
  description: string
  date: Date
  status: "processando" | "sucesso"
  format: "pdf" | "word" | "excel"
}

const data: Payment[] = [
  {
    id: "m5gr84i9",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: new Date("2020-01-24T03:01:12.000Z"),
    status: "processando",
    format: "pdf"
  },
  {
    id: "3u1reuv4",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: new Date("2020-01-24T03:01:12.000Z"),
    status: "processando",
    format: "pdf"
  },
  {
    id: "derv1ws0",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: new Date("2020-01-24T03:01:12.000Z"),
    status: "sucesso",
    format: "pdf"
  },
  {
    id: "5kma53ae",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: new Date("2020-01-24T03:01:12.000Z"),
    status: "sucesso",
    format: "pdf"
  },
  {
    id: "bhqecj4p",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    date: new Date("2020-01-24T03:01:12.000Z"),
    status: "sucesso",
    format: "pdf"
  }
]

const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => <div>{row.getValue<string>("description")}</div>
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue<string>("status")}</div>
    )
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue<Date>("date")

      return <div>{moment(date).format("L")}</div>
    }
  },
  {
    accessorKey: "format",
    header: "Formato",
    cell: ({ row }) => (
      <div className="uppercase">{row.getValue<string>("format")}</div>
    )
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Baixar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Reprocessar
            </DropdownMenuItem>
            <DropdownMenuItem>Excluir</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default () => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  })

  return (
    <DefaultLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <span className="text-sm">
          Lista dos relatórios gerados. Para gerar um novo relatório, clique va em
          <Button variant="link" asChild>
            <Link to="/dados" className="px-1 py-0">Base de dados</Link>
          </Button>.
        </span>
        <div className="rounded-md border mt-8">
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
                    className="h-24 text-center"
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
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
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
      </div>
    </DefaultLayout>
  )
}
