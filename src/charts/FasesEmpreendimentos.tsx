/* eslint-disable react-refresh/only-export-components */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type IChart from "./charts"

const FasesEmpreendimentos: IChart<{ uf: string }> = {
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
  getUrl: ({ uf }) => {
    return `${import.meta.env.VITE_BACKEND_URL}/dados/centralizada/fases_empreendimentos/?uf=${uf}`
  },
}

export default FasesEmpreendimentos
