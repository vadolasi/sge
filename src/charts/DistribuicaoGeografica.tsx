/* eslint-disable react-refresh/only-export-components */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type IChart from "./charts"
import Chart from "react-google-charts"

const DistribuicaoGeografica: IChart<{ uf: string }, [number, number][]> = {
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
  getGraph: (data, args) => {
    return (
      <Chart
        chartType="GeoChart"
        width="100%"
        data={[["Lat", "Lon"], ...data]}
        options={{
          title: `Distribuição geográfica dos empreendimentos no ${args.uf}`,
          region: "BR",
          resolution: "provinces",
          displayMode: "markers",
          dataMode: "regions",
          fontSize: 12,
          enableInteractivity: false,
          async: true
        }}
      />
    )
  },
}

export default DistribuicaoGeografica
