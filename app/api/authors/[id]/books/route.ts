import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// =====================================================
// GET – Obtener todos los libros de un autor específico
// =====================================================
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authorId = (await params).id

    // Verifica que el autor exista
    const author = await prisma.author.findUnique({
      where: { id: authorId },
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      )
    }

    // Obtener los libros del autor
    const books = await prisma.book.findMany({
      where: { authorId: authorId },
      orderBy: {
        publishedYear: 'desc',
      },
    })

    // Respuesta estructurada con datos del autor
    return NextResponse.json({
      author: {
        id: author.id,
        name: author.name,
      },
      totalBooks: books.length,
      books,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener libros del autor' },
      { status: 500 }
    )
  }
}
