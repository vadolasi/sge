/* eslint-disable react-refresh/only-export-components */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type Chart from "./charts"

const FasesEmpreendimentos: Chart<{ uf: string }, [string, number, number, number][]> = {
  name: "Fases dos empreendimentos",
  getArgs: ({ ufs, onComplete }) => {
    return (
      <>
        <Label>Selecione a UF:</Label>
        <Select onValueChange={value => onComplete({ uf: value })}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ufs.map(uf => (
              <SelectItem key={uf} value={uf}>
                {uf}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </>
    )
  },
  getData: async (db, { uf }) => {
    return await db.getGraph_FasesEmpreendimentos(uf)
  },
  getProps: (data, args) => {
    return {
      data: [[
        "Cidade",
        "Em operação",
        "Em construção",
        "Construção não iniciada"
      ], ...data] as [string, number, number, number][],
      options: {
        seriesType: "bars",
        title: `Todas as fases dos empreendimentos eólicos do ${args.uf}`,
        vAxis: {
          title: "Município",
        },
        hAxis: {
          title: "Quantidade",
        },
        fontSize: 12,
      },
      height: `${data.length * 25}px`
    }
  },
  type: "BarChart"
}

export default FasesEmpreendimentos
