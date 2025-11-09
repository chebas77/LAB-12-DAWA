import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// =====================================================
// GET – Obtener todos los autores
// =====================================================
export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      include: {
        _count: { select: { books: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(authors)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener autores' },
      { status: 500 }
    )
  }
}

// =====================================================
// POST – Crear nuevo autor
// =====================================================
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, bio, nationality, birthYear } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y correo son obligatorios' },
        { status: 400 }
      )
    }

    const existing = await prisma.author.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un autor con ese correo' },
        { status: 409 }
      )
    }

    const author = await prisma.author.create({
      data: {
        name,
        email,
        bio,
        nationality,
        birthYear: birthYear ? parseInt(birthYear) : null,
      },
    })

    return NextResponse.json(author, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear autor' },
      { status: 500 }
    )
  }
}
