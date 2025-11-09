 'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ThemeSelector from '../../components/ThemeSelector'

type Author = {
  id: string
  name: string
  email: string
  bio?: string | null
  nationality?: string | null
  birthYear?: number | null
}

type Stats = {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: { title: string; year: number | null } | null
  latestBook: { title: string; year: number | null } | null
  averagePages: number
  genres: string[]
  longestBook: { title: string; pages: number } | null
  shortestBook: { title: string; pages: number } | null
}

type Book = {
  id: string
  title: string
  publishedYear?: number | null
  genre?: string | null
  pages?: number | null
}

export default function AuthorDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    nationality: '',
    birthYear: '',
  })
  const [saving, setSaving] = useState(false)

  async function loadAll() {
    setLoading(true)
    const [aRes, sRes, bRes] = await Promise.all([
      fetch(`/api/authors/${id}`, { cache: 'no-store' }),
      fetch(`/api/authors/${id}/stats`, { cache: 'no-store' }),
      fetch(`/api/authors/${id}/books`, { cache: 'no-store' }),
    ])
    const a = await aRes.json()
    const s = await sRes.json()
    const b = await bRes.json()

    setAuthor(a)
    setStats(s)
    setBooks(b?.books || [])
    setForm({
      name: a?.name || '',
      email: a?.email || '',
      bio: a?.bio || '',
      nationality: a?.nationality || '',
      birthYear: a?.birthYear ? String(a.birthYear) : '',
    })
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function saveAuthor(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/authors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        birthYear: form.birthYear || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      loadAll()
    } else {
      const err = await res.json()
      alert(err?.error || 'No se pudo actualizar')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Autor</h1>
        <div className="flex items-center gap-3">
          <ThemeSelector />
          <button onClick={() => router.push('/')} className="text-blue-600">
            ← Volver
          </button>
        </div>
      </div>

      {loading ? (
        <div>Cargando…</div>
      ) : (
        <>
          {/* Info autor + edición */}
          <section className="p-4 rounded-xl border">
            <h2 className="font-semibold mb-4">Información</h2>
            <form onSubmit={saveAuthor} className="grid gap-3 md:grid-cols-2">
              <input
                className="border rounded p-2"
                placeholder="Nombre"
                value={form.name}
                onChange={e => setForm(s => ({ ...s, name: e.target.value }))}
              />
              <input
                className="border rounded p-2"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
              />
              <input
                className="border rounded p-2"
                placeholder="Nacionalidad"
                value={form.nationality}
                onChange={e =>
                  setForm(s => ({ ...s, nationality: e.target.value }))
                }
              />
              <input
                className="border rounded p-2"
                placeholder="Año de nacimiento"
                value={form.birthYear}
                onChange={e =>
                  setForm(s => ({ ...s, birthYear: e.target.value }))
                }
              />
              <textarea
                className="border rounded p-2 md:col-span-2"
                placeholder="Bio"
                value={form.bio}
                onChange={e => setForm(s => ({ ...s, bio: e.target.value }))}
              />
              <button
                disabled={saving}
                className="rounded bg-black text-white py-2 px-4 md:col-span-2"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </form>
          </section>

          {/* Stats */}
          <section className="p-4 rounded-xl border">
            <h2 className="font-semibold mb-4">Estadísticas</h2>
            {stats ? (
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded border">
                  <div className="text-gray-500">Total libros</div>
                  <div className="text-xl font-semibold">{stats.totalBooks}</div>
                </div>
                <div className="p-3 rounded border">
                  <div className="text-gray-500">Promedio páginas</div>
                  <div className="text-xl font-semibold">
                    {stats.averagePages}
                  </div>
                </div>
                <div className="p-3 rounded border">
                  <div className="text-gray-500">Géneros</div>
                  <div>{stats.genres.join(', ') || '—'}</div>
                </div>
                <div className="p-3 rounded border md:col-span-3 grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-500">Primer libro</div>
                    <div>{stats.firstBook ? `${stats.firstBook.title} (${stats.firstBook.year ?? '—'})` : '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Último libro</div>
                    <div>{stats.latestBook ? `${stats.latestBook.title} (${stats.latestBook.year ?? '—'})` : '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Más páginas</div>
                    <div>{stats.longestBook ? `${stats.longestBook.title} (${stats.longestBook.pages})` : '—'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Menos páginas</div>
                    <div>{stats.shortestBook ? `${stats.shortestBook.title} (${stats.shortestBook.pages})` : '—'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>Sin datos</div>
            )}
          </section>

          {/* Libros */}
          <section className="p-4 rounded-xl border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Libros del autor</h2>
              <a
                href="/books"
                className="px-3 py-1 rounded border text-sm"
              >
                + Agregar libro
              </a>
            </div>
            <ul className="divide-y">
              {books.map(b => (
                <li key={b.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.title}</div>
                    <div className="text-sm text-gray-600">
                      {b.genre || '—'} · {b.publishedYear ?? '—'} ·{' '}
                      {typeof b.pages === 'number' ? `${b.pages} págs.` : '—'}
                    </div>
                  </div>
                  <a className="text-xs text-blue-600" href="/books">
                    Editar en Libros →
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
