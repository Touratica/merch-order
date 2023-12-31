import OrderForm from "@/components/OrderForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Home() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="container mx-auto">
      <h1 className="mb-4 text-xl font-semibold sm:text-2xl md:text-3xl">
        Encomenda de equipamentos e merchandise
      </h1>
      <OrderForm products={products} />
    </main>
  );
}
