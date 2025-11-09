import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

type SortBy = 'title' | 'publishedYear' | 'createdAt'
type Order = 'asc' | 'desc'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const sp = url.searchParams

    const searchRaw = sp.get('search') || ''
    const genre = sp.get('genre') || undefined
    const authorNameRaw = sp.get('authorName') || ''

    const page = Math.max(parseInt(sp.get('page') || '1', 10), 1)
    const limitInput = Math.max(parseInt(sp.get('limit') || '10', 10), 1)
    const limit = Math.min(limitInput, 50)

    const sortBy = (sp.get('sortBy') as SortBy) || 'createdAt'
    const order = (sp.get('order') as Order) || 'desc'

    const skip = (page - 1) * limit

    // Filtros — construimos sólo las condiciones presentes para evitar objetos vacíos
    const andFilters: any[] = []

    // título (ilike / contains insensitive)
    if (searchRaw) {
      andFilters.push({ title: { contains: searchRaw, mode: 'insensitive' as const } })
    }

    // género exacto si llega
    if (genre) {
      andFilters.push({ genre })
    }

    // nombre de autor (ilike / contains insensitive)
    if (authorNameRaw) {
      andFilters.push({
        author: {
          name: { contains: authorNameRaw, mode: 'insensitive' as const },
        },
      })
    }

    const where = andFilters.length > 0 ? { AND: andFilters } : {}

    // Orden
    // OrderBy — usar switch para evitar tipos dinámicos problemáticos
    let orderBy: Record<string, 'asc' | 'desc'>
    switch (sortBy) {
      case 'title':
        orderBy = { title: order }
        break
      case 'publishedYear':
        orderBy = { publishedYear: order }
        break
      case 'createdAt':
      default:
        orderBy = { createdAt: order }
        break
    }

    // Total para paginación
    const total = await prisma.book.count({ where })

    // Datos
    const data = await prisma.book.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    const totalPages = Math.max(Math.ceil(total / limit), 1)
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }

    return NextResponse.json({ data, pagination })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en la búsqueda de libros' },
      { status: 500 }
    )
  }
}
