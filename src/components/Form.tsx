"use client";

import { toast } from "@/hooks/use-toast";
import { OrderPlacementPayload, OrderValidator } from "@/lib/validators/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { Order, Product } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/Button";

export default function Form({ products }: { products: Product[] }) {
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
    reset,
    resetField,
  } = useForm<OrderPlacementPayload>({
    resolver: zodResolver(OrderValidator),
    defaultValues: {
      buyerFirstName: "",
      buyerLastName: "",
      buyerVatId: "",
      buyerEmail: "",
      buyerMobilePhone: undefined,
      productId: "",
      productSize: "",
      productPersonalizedName: undefined,
      productPersonalizedNumber: undefined,
      productQuantity: 1,
    },
  });
  const watchProductId = watch("productId");

  const router = useRouter();

  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [isPersonalizable, setIsPersonalizable] = useState<boolean>(false);

  const { mutate: placeOrder, isLoading } = useMutation({
    mutationFn: async ({
      buyerFirstName,
      buyerLastName,
      buyerVatId,
      buyerEmail,
      buyerMobilePhone,
      productId,
      productSize,
      productPersonalizedName,
      productPersonalizedNumber,
      productQuantity,
    }: OrderPlacementPayload): Promise<Order> => {
      const payload: OrderPlacementPayload = {
        buyerFirstName,
        buyerLastName,
        buyerVatId,
        buyerEmail,
        buyerMobilePhone,
        productId,
        productSize,
        productPersonalizedName,
        productPersonalizedNumber,
        productQuantity,
      };

      const { data } = await axios.post("/api/orders/", payload);

      return data;
    },
    onError: () => {
      return toast({
        title: "Algo correu mal...",
        description:
          "A sua encomenda não foi feita. Por favor, tente mais tarde.",
        variant: "destructive",
      });
    },
    onSuccess: (data: Order) => {
      reset();
      return toast({
        title: `Encomenda #${data.id}!`,
        description: "A sua encomenda foi feita com sucesso!",
      });
    },
  });

  useEffect(() => {
    const product = products.find((product) => product.id === watchProductId);

    if (!product) return; // No product selected

    setAvailableSizes(product.sizes);
    setIsPersonalizable(product.isPersonalizable);

    resetField("productSize");
    resetField("productPersonalizedName");
    resetField("productPersonalizedNumber");
  }, [products, watchProductId, resetField]);

  return (
    <>
      <form onSubmit={handleSubmit((e) => placeOrder(e))}>
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:p-6">
            <section id="personal-info">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Informação pessoal
              </h3>
              <div className="grid grid-cols-12 gap-6 mt-3">
                <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Nome(s) próprio(s): <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    autoComplete="section-personal given-name"
                    placeholder="Jacaré"
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                    required
                    {...register("buyerFirstName")}
                  />
                  {errors?.buyerFirstName && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.buyerFirstName.message}
                    </p>
                  )}
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-5">
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Apelido(s): <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    autoComplete="section-personal family-name"
                    placeholder="Quim"
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                    required
                    {...register("buyerLastName")}
                  />
                  {errors?.buyerLastName && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.buyerLastName.message}
                    </p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                  <label
                    htmlFor="vat-id"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    NIF: <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="vat-id"
                    placeholder="999999990"
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                    required
                    {...register("buyerVatId")}
                  />
                  {errors?.buyerVatId && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.buyerVatId.message}
                    </p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-6">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    E-mail: <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    autoComplete="section-personal email"
                    placeholder="quim@korfballx.pt"
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                    required
                    {...register("buyerEmail")}
                  />
                  {errors?.buyerEmail && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.buyerEmail.message}
                    </p>
                  )}
                </div>
                <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                  <label
                    htmlFor="mobile-phone"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Telemóvel:
                  </label>
                  <input
                    type="tel"
                    id="mobile-phone"
                    autoComplete="section-personal mobile tel-national"
                    placeholder="935018626"
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                    {...register("buyerMobilePhone")}
                  />
                  {errors?.buyerMobilePhone && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.buyerMobilePhone.message}
                    </p>
                  )}
                </div>
                {/* <div className="hidden lg:col-span-8 lg:block" /> */}
              </div>
            </section>
            <div className="hidden sm:block" aria-hidden="true">
              <div className="py-5">
                <div className="border-t border-gray-200" />
              </div>
            </div>
            <section id="order">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Encomenda
              </h3>
              <div className="grid grid-cols-12 gap-6 mt-3">
                <div className="col-span-12 sm:col-span-5 lg:col-span-3">
                  <label
                    htmlFor="product-id"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Produto: <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="product-id"
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                    required
                    {...register("productId")}
                  >
                    <option value="" disabled hidden>
                      Escolha um
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4 sm:col-span-3 lg:col-span-2 2xl:col-span-1">
                  <label
                    htmlFor="size"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Tamanho: <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="size"
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                    required
                    {...register("productSize")}
                  >
                    <option value="" disabled hidden>
                      Escolha um
                    </option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                {isPersonalizable && (
                  <>
                    <div className="hidden sm:block sm:col-span-6 md:hidden" />
                    <div className="col-span-8 sm:col-span-7 lg:col-span-4">
                      <label
                        htmlFor="personalized-name"
                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                      >
                        Nome na camisola:
                      </label>
                      <input
                        type="text"
                        id="personalized-name"
                        className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                        {...register("productPersonalizedName")}
                      />
                      {errors?.productPersonalizedName && (
                        <p className="px-1 text-xs text-red-600">
                          {errors.productPersonalizedName.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-4 sm:col-span-2 lg:col-span-1">
                      <label
                        htmlFor="personalized-number"
                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                      >
                        Número:
                      </label>
                      <input
                        type="number"
                        id="personalized-number"
                        min={0}
                        max={99}
                        className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                        {...register("productPersonalizedNumber")}
                      />
                      {errors?.productPersonalizedNumber && (
                        <p className="px-1 text-xs text-red-600">
                          {errors.productPersonalizedNumber.message}
                        </p>
                      )}
                    </div>
                  </>
                )}
                <div className="col-span-8 sm:col-span-3 md:col-span-2">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Quantidade: <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min={0}
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-right text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-white"
                    required
                    {...register("productQuantity")}
                  />
                  {errors?.productQuantity && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.productQuantity.message}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 text-right sm:px-6">
            <Button
              isLoading={isLoading}
              className="bg-green-600 text-white hover:bg-green-500 focus-visible:outline-green-500"
            >
              Submeter
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
