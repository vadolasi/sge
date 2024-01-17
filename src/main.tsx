import React from "react"
import ReactDOM from "react-dom/client"
import { Suspense } from "react"
import {
  BrowserRouter as Router,
  useRoutes,
} from "react-router-dom"
import "./index.css"
import routes from "~react-pages"

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      {useRoutes(routes)}
    </Suspense>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
)
