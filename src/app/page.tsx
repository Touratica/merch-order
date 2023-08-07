import Form from "@/components/Form";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const products = await prisma.product.findMany();

  return (
    <main className="container mx-auto">
      <Form products={products} />
    </main>
  );
}
