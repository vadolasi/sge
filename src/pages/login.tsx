/* eslint-disable react-refresh/only-export-components */
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { useUser } from "@/lib/auth"

const formSchema = z.object({
  email: z.string({ required_error: "Este campo é obrigatório" }),
  password: z.string({ required_error: "Este campo é obrigatório" })
})

export default () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const { mutateAsync: login } = useMutation<{ token?: string, non_field_errors?: string[] }, never, z.infer<typeof formSchema>>({
    mutationFn: async ({ email, password }) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: email,
          password
        })
      })

      const data = await response.json() as { token?: string, non_field_errors?: string[] }

      if (!response.ok) {
        throw new Error(data.non_field_errors?.[0] ?? "Erro ao efetuar login")
      }

      return data
    }
  })

  const { setToken } = useUser()

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setLoading(true)
    try {
      const { token } = await login({ email, password })

      if (token) {
        setToken(token)
      }
    } catch (err) {
      toast.error(err?.message)
      setLoading(false)
      return
    }

    toast.success("Login efetuado com sucesso")
    navigate("/")
  })

  return (
    <Form {...form}>
      <div className="w-full h-screen flex items-center justify-center flex-grow">
        <form onSubmit={onSubmit} className="space-y-8 w-full p-10 md:p-0 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <h1 className="text-3xl font-bold text-center">Entrar</h1>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>Entrar</Button>
          <p className="w-full text-center text-sm">Não tem uma conta? <Link to="/cadastro" className="text-blue-500">Cadastrar-se</Link></p>
          <p className="w-full text-center text-sm -mt-8"><Link to="/recuperar-senha" className="text-blue-500">Esqueci minha senha</Link></p>
        </form>
      </div>
    </Form>
  )
}
