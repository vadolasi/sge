/* eslint-disable react-refresh/only-export-components */
import React from "react"
import Chart, { Data } from "./charts"

const Chart: React.FC<Data> = ({ ufs }) => {
  return (
    <div>
      <h1>Chart</h1>
    </div>
  )
}

const QtdPotenciaEmpreendimentos: Chart<{ uf: string }, never[]> = {

}
