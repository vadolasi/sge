import React from "react"
import logoPpgusrn from "@/assets/logo_ppgusrn.png"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { Link } from "react-router-dom"

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-8 py-4 flex">
        <div className="flex flex-col gap-0">
          <h1 className="font-bold text-xl">Relger</h1>
          <span className="text-sm">Sistema de Relatórios Gerenciais em Energias</span>
        </div>
        <NavigationMenu className="ml-auto">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/dados">
                  Base de dados
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <Link to="/relatorios">
                  Relatórios
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
      <main className="flex flex-col flex-grow">
        {children}
      </main>
      <footer className="w-full flex gap-2 p-2 items-center flex-shrink-0">
        <img src={logoPpgusrn} alt="Logo PPGUSRN" className="w-32 hidden md:block" />
        <span className="text-sm">©2023 | Desenvolvido por Joyce Aline Oliva Rodrigues Alves.</span>
      </footer>
    </div>
  )
}

export default DefaultLayout
