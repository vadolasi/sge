async function request(url: string, options: RequestInit = {}): Promise<Response> {
  options.headers = {
    ...options.headers,
    "Authorization": `Bearer ${JSON.parse(localStorage.getItem("token"))}`
  }

  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, options)

  if (res.status === 401) {
    const refreshTokenRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ refresh: JSON.parse(localStorage.getItem("refreshToken")) ?? "fake" })
    })

    if (refreshTokenRes.ok) {
      const data = await refreshTokenRes.json() as { access: string }
      localStorage.setItem("token", JSON.stringify(data.access))

      options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${data.access}`
      }

      return await fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, options)
    }
  }

  return res
}

export default request
