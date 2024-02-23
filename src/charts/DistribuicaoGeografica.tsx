/* eslint-disable react-refresh/only-export-components */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type Chart from "./charts"

const DistribuicaoGeografica: Chart<{ uf: string }, [number, number][]> = {
  name: "Distribuição geográfica",
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
    return await db.getGraph_DistribuicaoGeografica(uf)
  },
  getProps: (data) => {
    return {
      data: [["Lat", "Lon"], ...data],
      options: {
        region: "BR",
        magnifyingGlass: { enable: true, zoomFactor: 20 },
        resolution: "provinces",
        displayMode: "markers",
        dataMode: "regions",
        vAxis: {
          title: "Município",
        },
        hAxis: {
          title: "Quantidade",
        },
        fontSize: 12,
      }
    }
  },
  type: "GeoChart"
}

export default DistribuicaoGeografica
