import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // ✅ Patrón: params es (a veces) una Promesa en API Routes
    const { id } = await (ctx as any).params

    // Traemos libros del autor con datos mínimos para calcular
    const books = await prisma.book.findMany({
      where: { authorId: id },
      orderBy: { publishedYear: 'asc' },
      select: {
        id: true,
        title: true,
        pages: true,
        genre: true,
        publishedYear: true,
      },
    })

    // Verificar autor
    const author = await prisma.author.findUnique({
      where: { id },
      select: { id: true, name: true },
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      )
    }

    const totalBooks = books.length

    const firstBook =
      totalBooks > 0
        ? {
            title: books[0].title,
            year: books[0].publishedYear ?? null,
          }
        : null

    const latestBook =
      totalBooks > 0
        ? (() => {
            const last = [...books].sort(
              (a, b) => (b.publishedYear ?? 0) - (a.publishedYear ?? 0)
            )[0]
            return {
              title: last.title,
              year: last.publishedYear ?? null,
            }
          })()
        : null

    // Promedio de páginas (solo libros con pages definido)
    const pageValues = books.map(b => b.pages).filter((p): p is number => !!p)
    const averagePages =
      pageValues.length > 0
        ? Math.round(pageValues.reduce((a, b) => a + b, 0) / pageValues.length)
        : 0

    // Géneros únicos
    const genres = Array.from(
      new Set(books.map(b => b.genre).filter(Boolean))
    ) as string[]

    // Libro con más y menos páginas
    const withPages = books.filter(b => typeof b.pages === 'number') as Array<
      typeof books[number] & { pages: number }
    >

    const longest =
      withPages.length > 0
        ? withPages.reduce((max, cur) => (cur.pages > max.pages ? cur : max))
        : null

    const shortest =
      withPages.length > 0
        ? withPages.reduce((min, cur) => (cur.pages < min.pages ? cur : min))
        : null

    const result = {
      authorId: author.id,
      authorName: author.name,
      totalBooks,
      firstBook,
      latestBook,
      averagePages,
      genres,
      longestBook: longest
        ? { title: longest.title, pages: longest.pages }
        : null,
      shortestBook: shortest
        ? { title: shortest.title, pages: shortest.pages }
        : null,
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del autor' },
      { status: 500 }
    )
  }
}
