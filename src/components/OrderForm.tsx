"use client";

import { toast } from "@/hooks/use-toast";
import { OrderPlacementPayload, OrderValidator } from "@/lib/validators/order";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Order, Product } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/Form";
import { RadioGroup, RadioGroupItem } from "./ui/RadioGroup";
import { Separator } from "./ui/Separator";

export default function OrderForm({ products }: { products: Product[] }) {
  const form = useForm<OrderPlacementPayload>({
    resolver: zodResolver(OrderValidator),
    defaultValues: {
      buyerFirstName: "",
      buyerLastName: "",
      buyerVatId: "",
      buyerEmail: "",
      buyerMobilePhone: undefined,
      buyerType: "GUEST",
      productId: "",
      productSize: "",
      productPersonalizedName: undefined,
      productPersonalizedNumber: undefined,
      productQuantity: 1,
    },
  });
  const watchProductId = form.watch("productId");
  const watchBuyerType = form.watch("buyerType");

  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [isPersonalizable, setIsPersonalizable] = useState<boolean>(false);
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [price, setPrice] = useState<number>(0);

  const { mutate: placeOrder, isLoading } = useMutation({
    mutationFn: async ({
      buyerFirstName,
      buyerLastName,
      buyerVatId,
      buyerEmail,
      buyerMobilePhone,
      buyerType,
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
        buyerType,
        productId,
        productSize,
        productPersonalizedName,
        productPersonalizedNumber,
        productQuantity,
      };

      const { data } = await axios.post("/api/orders", payload);

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
      form.reset();
      form.control._resetDefaultValues();
      return toast({
        title: `Encomenda #${data.id}!`,
        description:
          "A sua encomenda foi feita com sucesso! Receberá informações sobre o pagamento após a validação da mesma.",
      });
    },
  });

  useEffect(() => {
    setProduct(products.find((product) => product.id === watchProductId));

    if (!product) {
      // No product selected
      setPrice(0);
      return;
    }

    setAvailableSizes(product.sizes);
    setIsPersonalizable(product.isPersonalizable);

    const disccount = {
      GUEST: 0,
      MEMBER: product?.memberDiscount || 0,
      ATHLETE: product?.athleteDiscount || 0,
    };

    setPrice(product.basePrice * (1 - disccount[watchBuyerType]));

    if (!product.isPersonalizable) {
      form.resetField("productPersonalizedName");
      form.resetField("productPersonalizedNumber");
    }
  }, [products, product, watchProductId, form, watchBuyerType]);

  useEffect(() => {}, [watchBuyerType, product]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((e) => placeOrder(e))}>
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 dark:bg-gray-800 sm:p-6">
            <section id="personal-info">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Informação pessoal
              </h3>
              <div className="mt-3 grid grid-cols-12 gap-6">
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
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    required
                    {...form.register("buyerFirstName")}
                  />
                  {form.formState.errors?.buyerFirstName && (
                    <p className="px-1 text-xs text-red-600">
                      {form.formState.errors.buyerFirstName.message}
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
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    required
                    {...form.register("buyerLastName")}
                  />
                  {form.formState.errors?.buyerLastName && (
                    <p className="px-1 text-xs text-red-600">
                      {form.formState.errors.buyerLastName.message}
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
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    required
                    {...form.register("buyerVatId")}
                  />
                  {form.formState.errors?.buyerVatId && (
                    <p className="px-1 text-xs text-red-600">
                      {form.formState.errors.buyerVatId.message}
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
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    required
                    {...form.register("buyerEmail")}
                  />
                  {form.formState.errors?.buyerEmail && (
                    <p className="px-1 text-xs text-red-600">
                      {form.formState.errors.buyerEmail.message}
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
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    {...form.register("buyerMobilePhone")}
                  />
                  {form.formState.errors?.buyerMobilePhone && (
                    <p className="px-1 text-xs text-red-600">
                      {form.formState.errors.buyerMobilePhone.message}
                    </p>
                  )}
                </div>
                {/* <div className="hidden lg:col-span-8 lg:block" /> */}
              </div>
            </section>
            <Separator className="my-5 bg-gray-200" />
            <section id="order">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Encomenda
              </h3>
              <div className="mt-3 grid grid-cols-12 gap-6">
                <div className="col-span-12 sm:col-span-5 lg:col-span-3">
                  <label
                    htmlFor="product-id"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Produto: <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="product-id"
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    required
                    {...form.register("productId")}
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
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    required
                    {...form.register("productSize")}
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
                    <div className="hidden sm:col-span-6 sm:block md:hidden" />
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
                        className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        {...form.register("productPersonalizedName")}
                      />
                      {form.formState.errors?.productPersonalizedName && (
                        <p className="px-1 text-xs text-red-600">
                          {
                            form.formState.errors.productPersonalizedName
                              .message
                          }
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
                        className="mt-2 block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                        {...form.register("productPersonalizedNumber")}
                      />
                      {form.formState.errors?.productPersonalizedNumber && (
                        <p className="px-1 text-xs text-red-600">
                          {
                            form.formState.errors.productPersonalizedNumber
                              .message
                          }
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
                    className="mt-2 block w-full rounded-md border-0 p-1.5 text-right text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    required
                    {...form.register("productQuantity")}
                  />
                  {form.formState.errors?.productQuantity && (
                    <p className="px-1 text-xs text-red-600">
                      {form.formState.errors.productQuantity.message}
                    </p>
                  )}
                </div>
              </div>
            </section>
            <Separator className="my-5 bg-gray-200" />
            <section id="price" className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="buyerType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Eu...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="GUEST" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Não sou sócio
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="MEMBER" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Sou sócio
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ATHLETE" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Sou atleta
                          </FormLabel>
                        </FormItem>
                        <FormDescription>
                          Esta informação é não vinculativa.
                        </FormDescription>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mr-6 text-4xl sm:text-6xl">
                {price.toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                  useGrouping: true,
                })}
              </div>
            </section>
          </div>

          <div className="flex items-center justify-end space-x-3 bg-gray-50 px-4 py-3 dark:bg-gray-900 sm:px-6">
            <p className="text-sm text-muted-foreground">
              O seu pedido será submetido para validação interna.
            </p>
            <Button
              isLoading={isLoading}
              className="bg-green-600 text-white hover:bg-green-500 focus-visible:outline-green-500"
            >
              Submeter
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
