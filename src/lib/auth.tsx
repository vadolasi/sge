/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react"

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
  setUser: (user: User | null) => void
}>({
  user: null,
  setUser: () => {}
})

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

export default UserContext
