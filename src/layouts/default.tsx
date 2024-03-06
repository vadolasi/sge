/* eslint-disable react-hooks/exhaustive-deps */
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
import { useSuspenseQuery } from "@tanstack/react-query"
import { User, useUser } from "@/lib/auth"
import request from "@/lib/request"

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useSuspenseQuery<{ result?: Omit<User, "admin">, error: boolean }>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await request(`/auth/profile/`)

      return { result: await res.json(), error: !res.ok }
    }
  })

  useEffect(() => {
    if (data?.result?.nome) {
      setUser({ ...data.result, admin: data.result.tipo === 1 })
    } else {
      setUser(null)
      setToken(null)
      setRefreshToken(null)
      navigate("/login")
    }
  }, [data])

  const navigate = useNavigate()
  const { user, setUser, setToken, setRefreshToken } = useUser()

  const logout = async () => {
    setUser(null)
    setToken(null)
    setRefreshToken(null)
    navigate("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-8 py-4 flex bg-gray-100 sticky top-0 z-10">
        <Link to="/" className="flex flex-col gap-0">
          <h1 className="font-bold text-xl">SGE</h1>
          <span className="text-sm">Sistema de Gerenciamento em Energias</span>
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
        <span className="text-sm">©2024</span>
      </footer>
    </div>
  )
}

export default DefaultLayout
