import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();
  try {
    const brandCount = await prisma.marque.count();
    const productCount = await prisma.produit.count();
    console.log('Brands:', brandCount);
    console.log('Products:', productCount);

    const products = await prisma.produit.findMany({
      where: { isDeleted: false },
      orderBy: { viewCount: 'desc' },
      take: 5,
      include: {
        brand: {
          select: { name: true }
        }
      }
    });
    console.log('Top Products found:', products.length);
    products.forEach(p => console.log(`- ${p.name} (Views: ${p.viewCount})`));

    const brands = await prisma.marque.findMany({
      take: 5,
      include: {
        _count: {
          select: { commandes: true }
        }
      }
    });
    console.log('Brands found:', brands.length);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
