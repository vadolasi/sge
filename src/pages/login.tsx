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
import { useNavigate } from "react-router-dom"
import DefaultLayout from "@/layouts/default"

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

  const onSubmit = form.handleSubmit(({ email, password }) => {
    console.log(email, password)

    navigate("/")
  })

  return (
    <DefaultLayout>
      <Form {...form}>
        <div className="w-full h-full flex items-center justify-center flex-grow">
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
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </div>
      </Form>
    </DefaultLayout>
  )
}
