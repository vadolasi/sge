import React, { useEffect } from "react"
import logoPpgusrn from "@/assets/logo_ppgusrn.png"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { Link, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { User, useUser } from "@/lib/auth"

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useSuspenseQuery<{ result?: Omit<User, "admin">, error: boolean }>({
    queryKey: ["me"],

    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/profile/`, {
        credentials: "include"
      })

      return { result: await res.json(), error: !res.ok }
    }
  })

  const { mutateAsync: logoutMutation } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/csrf/`, { credentials: "include" })
      const token = res.headers.get("X-CSRFToken")

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": token!
        }
      })
    }
  })

  const { user, setUser } = useUser()

  const navigate = useNavigate()

  useEffect(() => {
    if (data.result) {
      setUser({ ...data.result, admin: data.result.tipo === 1 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.result])


  if (data.error) {
    navigate("/login")
  }

  const logout = async () => {
    await logoutMutation()
    navigate("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-8 py-4 flex bg-gray-100 sticky top-0 z-10">
        <Link to="/" className="flex flex-col gap-0">
          <h1 className="font-bold text-xl">Relger</h1>
          <span className="text-sm">Sistema de Relatórios Gerenciais em Energias</span>
        </Link>
        <NavigationMenu className="ml-auto">
          <NavigationMenuList>
            <NavigationMenuItem >
              <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-gray-100 hover:bg-gray-200")}>
                <Link to="/dados">
                  Base de dados
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {user?.admin && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-gray-100 hover:bg-gray-200")}>
                  <Link to="/usuarios">
                    Usuários
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem>
              <NavigationMenuLink onClick={logout} className={cn(navigationMenuTriggerStyle(), "bg-gray-100 hover:bg-gray-200 cursor-pointer")}>
                Sair
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <main className="flex flex-col flex-grow">
        {children}
      </main>
      <footer className="w-full flex gap-2 p-2 items-center flex-shrink-0 border-t">
        <img src={logoPpgusrn} alt="Logo PPGUSRN" className="w-32 hidden md:block" />
        <span className="text-sm">©2023 | Desenvolvido por Joyce Aline Oliva Rodrigues Alves.</span>
      </footer>
    </div>
  )
}

export default DefaultLayout
