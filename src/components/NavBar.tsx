import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";

export default function NavBar(): ReactElement {
  return (
    <div className="mb-3 w-full bg-green-800 text-2xl font-semibold text-white">
      <Link
        href="https://korfballx.pt"
        className="inline-flex items-center p-3"
      >
        <Image
          src="/klx.svg"
          alt="Logo"
          width={75}
          height={75}
          className="mr-2"
        />
        <h1>Clube Korfball de Lisboa</h1>
      </Link>
    </div>
  );
}
