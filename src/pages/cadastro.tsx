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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

const formSchema = z.object({
  nome: z.string({ required_error: "Este campo é obrigatório" }),
  email: z.string({ required_error: "Este campo é obrigatório" }),
  cpf: z.string({ required_error: "Este campo é obrigatório" }),
  password: z.string({ required_error: "Este campo é obrigatório" }),
  passwordConfirmation: z.string({ required_error: "Este campo é obrigatório" }),
  role: z.enum(["Empresa", "Estudante", "Professor", "Secretária"])
})
  .refine(data => data.password === data.passwordConfirmation, {
    message: "As senhas não conferem",
    path: ["passwordConfirmation"]
  })

export default () => {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const navigate = useNavigate()

  const { mutateAsync: register } = useMutation<{ token?: string, non_field_errors?: string[] }, never, Omit<z.infer<typeof formSchema>, "passwordConfirmation">>({
    mutationFn: async ({ email, nome, cpf, role, password }) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: email,
          email,
          nome,
          cpf,
          role,
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

  const onSubmit = form.handleSubmit(async ({ email, nome, cpf, role, password }) => {
    setLoading(true)

    try {
      const res = await register({ email, nome, cpf, role, password })

      const token = res.token
      localStorage.setItem("token", token!)
    } catch (err) {
      // @ts-expect-error toast type
      toast.error(err?.message)
      setLoading(false)
      return
    }

    toast.success("Cadastro efetuado com sucesso! Faça login para continuar.")
    navigate("/login")
  })

  return (
    <Form {...form}>
      <div className="w-screeen min-h-screen flex items-center justify-center">
        <form onSubmit={onSubmit} className="space-y-4 w-full p-10 md:p-0 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <h1 className="text-3xl font-bold text-center">Cadastro</h1>
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
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
          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipode usuário</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Empresa">Empresa</SelectItem>
                    <SelectItem value="Estudante">Estudante</SelectItem>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Secretária">Secretária</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full mt-2" disabled={loading}>Cadastrar</Button>
          <p className="w-full text-center text-sm">Já tem uma conta? <Link to="/login" className="text-blue-500">Entrar</Link></p>
        </form>
      </div>
    </Form>
  )
}
