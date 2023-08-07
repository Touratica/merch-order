import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/Toaster";
import "@/styles/globals.css";

export const metadata = {
  title: "KLX | Clube Korfball de Lisboa - Equipamentos",
  description: "Encomenda de equipamentos do Clube Korfball de Lisboa - KLX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>
        <Providers>
          <header>
            <NavBar />
          </header>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
