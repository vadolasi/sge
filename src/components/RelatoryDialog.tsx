import { useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { useUser } from "@/lib/auth"

interface Props {
  url: string
  filename: string
  title: string
}

const RelatoryDialog: React.FC<Props> = ({ url, filename, title }) => {
  const [open, setOpen] = useState(false)
  const { token } = useUser()
  const [obs, setObs] = useState("")

  const download = async () => {
    const res = await fetch(`${url}`, {
      headers: {
        Authorization: `Token ${token}`
      }
    })
    setObs("")

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
        <Label>Observação</Label>
        <Textarea value={obs} onChange={e => setObs(e.target.value)} />
        <DialogFooter>
          <Button
            type="submit"
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
