import React from "react"
import logoPpgusrn from "@/assets/logo_ppgusrn.png"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("token")
  const userType = localStorage.getItem("userType") as "user" | "admin"

  const navigate = useNavigate()

  if (!token) {
    return <Navigate to="/login" />
  }

  const logout = () => {
    localStorage.removeItem("token")

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
            {userType === "admin" && (
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
