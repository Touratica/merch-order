import Image from "next/image";
import type { ReactElement } from "react";

export default function NavBar(): ReactElement {
  return (
    <div className="mb-3 inline-flex w-full items-center bg-green-800 p-3 text-2xl font-semibold text-white">
      <Image
        src="/klx.svg"
        alt="Logo"
        width={75}
        height={75}
        className="mr-2"
      />
      <h1>Clube Korfball de Lisboa</h1>
    </div>
  );
}
