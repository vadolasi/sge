/* eslint-disable react-refresh/only-export-components */
import React from "react"
import ReactDOM from "react-dom/client"
import { Suspense } from "react"
import {
  BrowserRouter as Router,
  useRoutes,
} from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { QueryParamProvider } from "use-query-params"
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6"
import { Toaster } from "@/components/ui/sonner"

import "./index.css"
import routes from "~react-pages"
import { UserProvider } from "./lib/auth"

const queryClient = new QueryClient()

function App() {
  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <Suspense
            fallback={(
              <div className="w-screen h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            )}
          >
            {useRoutes(routes)}
          </Suspense>
        </QueryParamProvider>
        <Toaster />
      </QueryClientProvider>
    </UserProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
)
