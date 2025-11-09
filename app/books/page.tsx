 'use client'

import { useEffect, useMemo, useState } from 'react'
import ThemeSelector from '../components/ThemeSelector'

type Author = { id: string; name: string }
type Book = {
  id: string
  title: string
  description?: string | null
  isbn?: string | null
  publishedYear?: number | null
  genre?: string | null
  pages?: number | null
  createdAt: string
  author: { id: string; name: string; email: string }
}

type SearchResponse = {
  data: Book[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const SORT_FIELDS = [
  { value: 'createdAt', label: 'Fecha de creación' },
  { value: 'title', label: 'Título' },
  { value: 'publishedYear', label: 'Año de publicación' },
] as const

export default function BooksPage() {
  // filtros
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'publishedYear'>(
    'createdAt'
  )
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // datos
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [data, setData] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // form create
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    isbn: '',
    publishedYear: '',
    genre: '',
    pages: '',
    authorId: '',
  })

  // helpers
  async function loadAuthors() {
    const res = await fetch('/api/authors', { cache: 'no-store' })
    const authors = await res.json()
    setAuthors(
      (authors || []).map((a: any) => ({ id: a.id, name: a.name })) as Author[]
    )
  }

  // pequeño endpoint inline para géneros distintos (sin crear ruta extra)
  async function loadGenres() {
    const res = await fetch('/api/books/search?limit=50&page=1&sortBy=createdAt&order=desc', { cache: 'no-store' })
    const json: SearchResponse = await res.json()
    const gset = new Set(json.data.map(b => b.genre).filter(Boolean) as string[])
    setGenres(Array.from(gset))
  }

  async function searchBooks() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (genre) params.set('genre', genre)
    if (authorId) params.set('authorId', authorId)
    if (authorName) params.set('authorName', authorName)
    params.set('page', String(page))
    params.set('limit', String(limit))
    params.set('sortBy', sortBy)
    params.set('order', order)

    const res = await fetch(`/api/books/search?${params.toString()}`, {
      cache: 'no-store',
    })
    const json = (await res.json()) as SearchResponse
    setData(json)
    setLoading(false)
  }

  useEffect(() => {
    loadAuthors()
    loadGenres()
  }, [])

  useEffect(() => {
    searchBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, genre, authorId, authorName, sortBy, order, page, limit])

  async function createBook(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        pages: form.pages ? Number(form.pages) : null,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      }),
    })
    setCreating(false)
    if (res.ok) {
      setForm({
        title: '',
        description: '',
        isbn: '',
        publishedYear: '',
        genre: '',
        pages: '',
        authorId: '',
      })
      searchBooks()
    } else {
      const err = await res.json()
      alert(err?.error || 'Error al crear libro')
    }
  }

  async function deleteBook(id: string) {
    if (!confirm('¿Eliminar libro?')) return
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
    if (res.ok) searchBooks()
    else alert('No se pudo eliminar')
  }

  const total = data?.pagination.total ?? 0

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Libros</h1>
        <ThemeSelector />
      </div>

      {/* Crear libro */}
      <section className="p-4 rounded-xl border">
        <h2 className="font-semibold mb-4">Crear libro</h2>
        <form onSubmit={createBook} className="grid gap-3 md:grid-cols-2">
          <input
            className="border rounded p-2"
            placeholder="Título"
            value={form.title}
            onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
            required
          />
          <input
            className="border rounded p-2"
            placeholder="ISBN"
            value={form.isbn}
            onChange={e => setForm(s => ({ ...s, isbn: e.target.value }))}
          />
          <input
            className="border rounded p-2"
            placeholder="Año de publicación"
            value={form.publishedYear}
            onChange={e =>
              setForm(s => ({ ...s, publishedYear: e.target.value }))
            }
          />
          <input
            className="border rounded p-2"
            placeholder="Género"
            value={form.genre}
            onChange={e => setForm(s => ({ ...s, genre: e.target.value }))}
          />
          <input
            className="border rounded p-2"
            placeholder="Páginas"
            value={form.pages}
            onChange={e => setForm(s => ({ ...s, pages: e.target.value }))}
          />
          <select
            className="border rounded p-2"
            value={form.authorId}
            onChange={e => setForm(s => ({ ...s, authorId: e.target.value }))}
            required
          >
            <option value="">Selecciona autor</option>
            {authors.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <textarea
            className="border rounded p-2 md:col-span-2"
            placeholder="Descripción"
            value={form.description}
            onChange={e =>
              setForm(s => ({ ...s, description: e.target.value }))
            }
          />
          <button
            disabled={creating}
            className="rounded bg-black text-white py-2 px-4 md:col-span-2"
          >
            {creating ? 'Creando…' : 'Crear libro'}
          </button>
        </form>
      </section>

      {/* Filtros / búsqueda */}
      <section className="p-4 rounded-xl border space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="border rounded p-2"
            placeholder="Buscar por título…"
            value={search}
            onChange={e => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />
          <input
            className="border rounded p-2"
            placeholder="Buscar por autor (nombre)…"
            value={authorName}
            onChange={e => {
              setPage(1)
              setAuthorName(e.target.value)
            }}
          />
          <select
            className="border rounded p-2"
            value={authorId}
            onChange={e => {
              setPage(1)
              setAuthorId(e.target.value)
            }}
          >
            <option value="">Autor (filtro)</option>
            {authors.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={genre}
            onChange={e => {
              setPage(1)
              setGenre(e.target.value)
            }}
          >
            <option value="">Género (filtro)</option>
            {genres.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            {SORT_FIELDS.map(s => (
              <option key={s.value} value={s.value}>
                Ordenar por: {s.label}
              </option>
            ))}
          </select>
          <select
            className="border rounded p-2"
            value={order}
            onChange={e => setOrder(e.target.value as any)}
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Por página</label>
          <select
            className="border rounded p-2"
            value={limit}
            onChange={e => {
              setPage(1)
              setLimit(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50].map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <div className="ml-auto text-sm text-gray-600">
            {loading ? 'Buscando…' : `Resultados: ${total}`}
          </div>
        </div>
      </section>

      {/* Lista */}
      <section className="p-4 rounded-xl border">
        {loading ? (
          <div>Cargando…</div>
        ) : (
          <ul className="divide-y">
            {data?.data.map(b => (
              <li key={b.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-sm text-gray-600">
                    {b.author?.name} · {b.genre || 'Sin género'} ·{' '}
                    {b.publishedYear ?? '—'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="px-3 py-1 rounded border"
                    href={`/authors/${b.author.id}`}
                  >
                    Autor
                  </a>
                  <button
                    onClick={() => deleteBook(b.id)}
                    className="px-3 py-1 rounded border border-red-500 text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Paginación */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            disabled={!data?.pagination.hasPrev}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            ← Anterior
          </button>
          <div className="text-sm">
            Página {data?.pagination.page ?? 1} de{' '}
            {data?.pagination.totalPages ?? 1}
          </div>
          <button
            disabled={!data?.pagination.hasNext}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      </section>
    </div>
  )
}
