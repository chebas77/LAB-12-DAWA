 'use client'

import { useEffect, useMemo, useState } from 'react'
import ThemeSelector from './components/ThemeSelector'

type Author = {
  id: string
  name: string
  email: string
  bio?: string | null
  nationality?: string | null
  birthYear?: number | null
  _count?: { books: number }
}

export default function DashboardPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: '',
  })
  
  

  // Total de libros de todos los autores
  const totalBooks = useMemo(
    () => authors.reduce((acc, a) => acc + (a._count?.books ?? 0), 0),
    [authors]
  )

  // Cargar autores
  async function loadAuthors() {
    setLoading(true)
    try {
      const res = await fetch('/api/authors', { cache: 'no-store' })
      if (!res.ok) throw new Error('Error al obtener autores')
      const data = await res.json()
      setAuthors(data || [])
    } catch (err) {
      console.error(err)
      alert('No se pudieron cargar los autores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuthors()
  }, [])

  // Crear autor
  async function createAuthor(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          birthYear: form.birthYear || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error || 'Error al crear autor')
      }
      setForm({ name: '', email: '', bio: '', nationality: '', birthYear: '' })
      loadAuthors()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  // Eliminar autor
  async function deleteAuthor(id: string) {
    if (!confirm('¿Eliminar autor?')) return
    try {
      const res = await fetch(`/api/authors/${id}`, { method: 'DELETE' })
      if (res.ok) loadAuthors()
      else alert('No se pudo eliminar el autor')
    } catch {
      alert('Error al eliminar autor')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard de Autores</h1>
        <ThemeSelector />
      </div>

      {/* Estadísticas */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500">Autores registrados</div>
          <div className="text-2xl font-semibold">{authors.length}</div>
        </div>
        <div className="p-4 rounded-xl border">
          <div className="text-sm text-gray-500">Total de libros</div>
          <div className="text-2xl font-semibold">{totalBooks}</div>
        </div>
      </section>

      {/* Formulario para crear autor */}
      <section className="p-4 rounded-xl border">
        <h2 className="font-semibold mb-4">Crear nuevo autor</h2>
        <form onSubmit={createAuthor} className="grid gap-3 md:grid-cols-2">
          <input
            className="border rounded p-2"
            placeholder="Nombre"
            value={form.name}
            onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
            required
          />
          <input
            className="border rounded p-2"
            placeholder="Correo"
            value={form.email}
            onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
            required
          />
          <input
            className="border rounded p-2 md:col-span-2"
            placeholder="Biografía"
            value={form.bio}
            onChange={e => setForm(s => ({ ...s, bio: e.target.value }))}
          />
          <input
            className="border rounded p-2"
            placeholder="Nacionalidad"
            value={form.nationality}
            onChange={e => setForm(s => ({ ...s, nationality: e.target.value }))}
          />
          <input
            className="border rounded p-2"
            placeholder="Año de nacimiento"
            value={form.birthYear}
            onChange={e => setForm(s => ({ ...s, birthYear: e.target.value }))}
          />
          <button
            disabled={creating}
            className="rounded bg-black text-white py-2 px-4 md:col-span-2"
          >
            {creating ? 'Creando…' : 'Crear autor'}
          </button>
        </form>
      </section>

      {/* Listado de autores */}
      <section className="p-4 rounded-xl border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Autores</h2>
          <a className="text-blue-600 hover:underline" href="/books">
            Ir a libros →
          </a>
        </div>

        {loading ? (
          <div>Cargando autores...</div>
        ) : (
          <ul className="divide-y">
            {authors.map(a => (
              <li
                key={a.id}
                className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-sm text-gray-600">{a.email}</div>
                  <div className="text-xs text-gray-500">
                    Libros: {a._count?.books ?? 0}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="px-3 py-1 rounded border"
                    href={`/authors/${a.id}`}
                  >
                    Ver / Editar
                  </a>
                  <button
                    onClick={() => deleteAuthor(a.id)}
                    className="px-3 py-1 rounded border border-red-500 text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
