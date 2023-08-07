import Image from "next/image";
import type { ReactElement } from "react";

export default function NavBar(): ReactElement {
  return (
    <div className="bg-green-800 text-white text-2xl font-semibold p-3 mb-3 inline-flex w-full items-center">
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
