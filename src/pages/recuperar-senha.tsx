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
// import { useMutation } from "@tanstack/react-query"

const formSchema = z.object({
  email: z.string({ required_error: "Este campo é obrigatório" })
})

export default () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      email: ""
    }
  })

  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  /*
  const { mutateAsync: login } = useMutation<never, never, z.infer<typeof formSchema>>({
    mutationFn: async ({ email, password }) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api-token-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: email,
          password: password
        })
      })

      if (!response.ok) {
        throw new Error("Erro ao fazer login")
      }

      return response.json() as never
    }
  })
  */

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setLoading(true)
    // console.log(await login({ email, password }))
    console.log(email)

    setTimeout(() => {
      navigate("/")
    }, 1000)
  })

  return (
    <Form {...form}>
      <div className="w-full h-screen flex items-center justify-center flex-grow">
        <form onSubmit={onSubmit} className="space-y-8 w-full p-10 md:p-0 md:w-1/2 lg:w-1/3 xl:w-1/4">
          <h1 className="text-3xl font-bold text-center">Redefinir Senha</h1>
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
          <Button type="submit" className="w-full" disabled={loading}>Redefinir senha</Button>
          <p className="w-full text-center text-sm"><Link to="/login" className="text-blue-500">Voltar</Link></p>
        </form>
      </div>
    </Form>
  )
}
