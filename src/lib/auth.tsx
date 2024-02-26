/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react"
import { useLocalStorage } from "@uidotdev/usehooks"

export interface User {
  nome: string
  email: string
  cpf: string
  tipo: number
  admin: boolean
  ultimo_acesso: string
}

const UserContext = createContext<{
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}>({
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {}
})

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useLocalStorage<string>("token")

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

export default UserContext
