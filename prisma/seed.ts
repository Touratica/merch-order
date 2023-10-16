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
    isPersonalizable: false,
    basePrice: 33,
    memberDiscount: 0.25,
    athleteDiscount: 0.5,
    personalizationPrice: 0,
  },
  {
    name: "Saia de jogo",
    sizes: ["S", "M", "L", "XL"],
    isPersonalizable: false,
    basePrice: 33,
    memberDiscount: 0.25,
    athleteDiscount: 0.5,
    personalizationPrice: 0,
  },
  {
    name: "Casaco de fato de treino",
    sizes: ["13/14", "S", "M", "L", "XL", "2XL", "3XL"],
    isPersonalizable: false,
    basePrice: 52,
    memberDiscount: 0.25,
    athleteDiscount: 0.36,
    personalizationPrice: 0,
  },
  {
    name: "Calças de fato de treino",
    sizes: ["164", "S", "M", "L", "XL", "2XL", "3XL"],
    isPersonalizable: false,
    basePrice: 36,
    memberDiscount: 0.25,
    athleteDiscount: 0.36,
    personalizationPrice: 0,
  },
  {
    name: "Mochila",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 42,
    memberDiscount: 0.23,
    athleteDiscount: 0.38,
    personalizationPrice: 0,
  },
  {
    name: "T-shirt de treino/aquecimento",
    sizes: ["8 anos", "12 anos", "16 anos", "S", "M", "L", "XL", "2XL"],
    isPersonalizable: false,
    basePrice: 14,
    memberDiscount: 0.21,
    athleteDiscount: 0.35,
    personalizationPrice: 0,
  },
  {
    name: "Porta-chaves (Jacaré vermelho)",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 6,
    memberDiscount: 0.16,
    athleteDiscount: 0.16,
    personalizationPrice: 0,
  },
  {
    name: "Porta-chaves (Jacaré rosa)",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 6,
    memberDiscount: 0.16,
    athleteDiscount: 0.16,
    personalizationPrice: 0,
  },
  {
    name: "Porta-chaves (Jacaré laranja)",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 6,
    memberDiscount: 0.16,
    athleteDiscount: 0.16,
    personalizationPrice: 0,
  },
  {
    name: "Porta-chaves (Jacaré amarelo)",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 6,
    memberDiscount: 0.16,
    athleteDiscount: 0.16,
    personalizationPrice: 0,
  },
  {
    name: "Porta-chaves (Jacaré verde)",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 6,
    memberDiscount: 0.16,
    athleteDiscount: 0.16,
    personalizationPrice: 0,
  },
  {
    name: "Porta-chaves (Jacaré azul claro)",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 6,
    memberDiscount: 0.16,
    athleteDiscount: 0.16,
    personalizationPrice: 0,
  },
  {
    name: "Porta-chaves (Jacaré azul escuro)",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 6,
    memberDiscount: 0.16,
    athleteDiscount: 0.16,
    personalizationPrice: 0,
  },
  {
    name: "Crachá (KLX)",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 1.5,
    memberDiscount: 0.33,
    athleteDiscount: 0.33,
    personalizationPrice: 0,
  },
  {
    name: "Crachá (Bola c/ número)",
    sizes: ["Único"],
    isPersonalizable: true,
    basePrice: 1.5,
    memberDiscount: 0.33,
    athleteDiscount: 0.33,
    personalizationPrice: 0,
  },
  {
    name: "Lanyard",
    sizes: ["Único"],
    isPersonalizable: false,
    basePrice: 2.5,
    memberDiscount: 0.4,
    athleteDiscount: 0.4,
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
