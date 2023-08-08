import OrderForm from "@/components/OrderForm";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany();

  return (
    <main className="container mx-auto">
      <OrderForm products={products} />
    </main>
  );
}
