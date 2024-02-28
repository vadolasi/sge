import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { useUser } from "@/lib/auth"
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "./ui/select"

interface Props {
  url: string
  filename: string
  ufs: string[]
  title: string
}

const RelatoryDialog: React.FC<Props> = ({ url, filename, ufs, title }) => {
  const [open, setOpen] = useState(false)
  const [uf, setUf] = useState<string | undefined>(undefined)
  const { token } = useUser()

  const download = async () => {
    const res = await fetch(`${url}?uf=${uf}`, {
      headers: {
        Authorization: `Token ${token}`
      }
    })

    const blob = await res.blob()
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()

    URL.revokeObjectURL(link.href)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>{title}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Emitir relatório</DialogTitle>
        </DialogHeader>
        <Label>UF</Label>
        <Select
          value={uf}
          onValueChange={setUf}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a UF" />
          </SelectTrigger>
          <SelectContent>
            {ufs.map(uf => (
              <SelectItem key={uf} value={uf}>{uf}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label>Observação</Label>
        <Textarea></Textarea>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!uf}
            onClick={() => {
              setOpen(false)
              toast.promise(
                download(),
                {
                  loading: "Gerando relatório...",
                  success: "Relatório gerado com sucesso!",
                  error: "Erro ao gerar relatório!"
                }
              )
            }}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RelatoryDialog
