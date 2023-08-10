import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productData: Prisma.ProductCreateInput[] = [
  {
    name: "Camisola de jogo (verde) Masculina",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 26,
    memberDiscount: 0.23,
    athleteDiscount: 0.38,
    personalizationPrice: 0,
  },
  {
    name: "Camisola de jogo (verde) Feminina",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 26,
    memberDiscount: 0.23,
    athleteDiscount: 0.38,
    personalizationPrice: 0,
  },
  {
    name: "Camisola de jogo (preta) Masculina",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 26,
    memberDiscount: 0.23,
    athleteDiscount: 0.38,
    personalizationPrice: 0,
  },
  {
    name: "Camisola de jogo (preta) Feminina",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 26,
    memberDiscount: 0.23,
    athleteDiscount: 0.38,
    personalizationPrice: 0,
  },
  {
    name: "Calções de jogo",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 20,
    memberDiscount: 0.25,
    athleteDiscount: 0.35,
    personalizationPrice: 0,
  },
  {
    name: "Saia de jogo",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 32,
    memberDiscount: 0.25,
    athleteDiscount: 0.37,
    personalizationPrice: 0,
  },
  {
    name: "Casaco de fato de treino",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 52,
    memberDiscount: 0.25,
    athleteDiscount: 0.37,
    personalizationPrice: 0,
  },
  {
    name: "Calças de fato de treino",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 36,
    memberDiscount: 0.25,
    athleteDiscount: 0.36,
    personalizationPrice: 0,
  },
  {
    name: "Mochila",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 42,
    memberDiscount: 0.24,
    athleteDiscount: 0.38,
    personalizationPrice: 0,
  },
  {
    name: "T-shirt de treino/aquecimento",
    sizes: ["S", "M", "L", "XL", "2XL"],
    isPersonalizable: true,
    basePrice: 14,
    memberDiscount: 0.21,
    athleteDiscount: 0.36,
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
