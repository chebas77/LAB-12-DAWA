'use client'

import { useEffect, useState } from 'react'

export default function ThemeSelector() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    if (stored === 'dark' || stored === 'light') setTheme(stored as 'dark' | 'light')
    else setTheme('system')
  }, [])

  function applyTheme(mode: 'system' | 'light' | 'dark') {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-light')
    if (mode === 'dark') {
      root.classList.add('theme-dark')
      localStorage.setItem('theme', 'dark')
    } else if (mode === 'light') {
      root.classList.add('theme-light')
      localStorage.setItem('theme', 'light')
    } else {
      localStorage.removeItem('theme')
    }
    setTheme(mode)
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">Tema</label>
      <select
        value={theme}
        onChange={e => applyTheme(e.target.value as 'system' | 'light' | 'dark')}
        className="border rounded p-2"
      >
        <option value="system">Sistema</option>
        <option value="dark">Oscuro</option>
        <option value="light">Claro</option>
      </select>
    </div>
  )
}
