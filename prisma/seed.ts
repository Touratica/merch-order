import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productData: Prisma.ProductCreateInput[] = [
  {
    name: "Camisola Principal 2022/23",
    sizes: ["S", "M", "L", "XL"],
    isPersonalizable: true,
    basePrice: 30,
    memberDiscount: 0.25,
    athleteDiscount: 0.5,
    personalizationPrice: 5,
  },
  {
    name: "Camisola Alternativa 2022/23",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 30,
    memberDiscount: 0.25,
    athleteDiscount: 0.5,
    personalizationPrice: 5,
  },
  {
    name: "Camisola de treino 2021/22",
    sizes: ["16", "S", "M", "L", "XL", "2XL"],
    isPersonalizable: false,
    basePrice: 20,
    memberDiscount: 0.25,
    athleteDiscount: 0.5,
    personalizationPrice: 0,
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const p of productData) {
    const product = await prisma.product.create({
      data: p,
    });
    console.log(`Created product with id: ${product.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
