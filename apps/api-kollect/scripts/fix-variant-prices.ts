import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixVariantPrices() {
  console.log('🔧 Correction des prix des variants...');
  
  // Récupérer tous les variants qui ont un prix à 0 ou null
  const variantsWithZeroPrice = await prisma.varianteProduit.findMany({
    where: {
      OR: [
        { price: 0 },
        { price: null }
      ]
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true
        }
      }
    }
  });

  console.log(`📊 Trouvé ${variantsWithZeroPrice.length} variants avec prix à 0/null`);

  for (const variant of variantsWithZeroPrice) {
    console.log(`🔄 Mise à jour du variant ${variant.name} (${variant.sku}) - Prix actuel: ${variant.price} -> Nouveau prix: ${variant.product.price}`);
    
    await prisma.varianteProduit.update({
      where: { id: variant.id },
      data: { 
        price: variant.product.price 
      }
    });
  }

  console.log('✅ Correction terminée !');
}

fixVariantPrices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
