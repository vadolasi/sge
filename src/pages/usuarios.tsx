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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
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
import { useSuspenseQuery } from "@tanstack/react-query"

interface User {
  name: string
  cpf: string
  lastAccess: string
  role: string
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="capitalize text-left">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("cpf")}</div>
    ),
  },
  {
    accessorKey: "lastAccess",
    header: "Último acesso",
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("lastAccess")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: () => (
      <div className="text-left">Tipo de usuário</div>
    ),
    cell: ({ row }) => (
      <div className="text-left">{row.getValue("role")}</div>
    ),
  },
  {
    id: "actions",
    header: "Ações",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem>Excluir</DropdownMenuItem>
            <DropdownMenuItem>Bloquear</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function Page() {
   const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const { data } = useSuspenseQuery({
    queryKey: ["users"],
    networkMode: "online",
    queryFn: async () => {
      return await new Promise<User[]>((resolve) => {
        setTimeout(() => {
          console.log("fetching users")
          resolve([{ name: "Vitor", cpf: "000.000.00-00", lastAccess: "19/02/2024", role: "Estudante" }] as User[])
        }, 2000)
      })
    }
  })

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
      rowSelection,
    },
  })

  return (
    <DefaultLayout>
      <div className="w-2/3 mx-auto h-full flex flex-col items-center justify-center">
        <div className="flex flex-col gap-4 p-8 items-center justify-center text-center h-full">
          <h1 className="text-2xl font-bold text-left">Usuários</h1>
          <Table className="border">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-secondary">
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
                    Nenhum resultado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end space-x-2 py-4 w-full">
            <div className="flex-1 text-sm text-muted-foreground">
              página {table.getFilteredSelectedRowModel().rows.length + 1} de{" "}
              {table.getFilteredRowModel().rows.length}
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
          <div className="flex gap-2">
            <Button>Gerar relatório em PDF</Button>
            <Button>Gerar relatório em XLSX</Button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}
