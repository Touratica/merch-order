import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";
import isValidVatId from "../vatId";

export const OrderValidator = z.object({
  buyerFirstName: z
    .string()
    .min(2, {
      message: "O nome próprio deve conter, pelo menos, 2 caracteres.",
    })
    .max(32, {
      message: "O nome próprio não deve conter mais do que 32 caracteres.",
    }),
  buyerLastName: z
    .string()
    .min(2, { message: "O apelido deve conter, pelo menos, 2 caracteres" })
    .max(50, {
      message: "O apelido não deve conter mais do que 50 caracteres.",
    }),
  buyerVatId: z
    .string()
    .length(9, { message: "O NIF deve ter 9 dígitos" })
    .regex(/^\d{9}$/, { message: "O NIF deve conter apenas dígitos." })
    .refine((vatId) => isValidVatId(vatId), {
      message: "NIF inválido.",
    }),
  buyerEmail: z
    .string()
    .email({ message: "Este endereço de e-mail não é válido." }),
  buyerMobilePhone: z
    .string()
    .refine((phone) => isValidPhoneNumber(phone, { defaultCountry: "PT" }), {
      message: "O número de telemóvel não é válido.",
    })
    .optional()
    .or(z.literal(""))
    .transform((e) => (e === "" ? undefined : e)),
  buyerType: z.enum(["GUEST", "MEMBER", "ATHLETE"]),
  productId: z.string().cuid({ message: "Product ID is not valid." }),
  productPersonalizedName: z
    .string()
    .max(15, { message: "O nome não deve conter mais do que 15 caracteres." }) // TODO: check if this is the correct length
    .optional()
    .transform((e) => (e === "" ? undefined : e)),
  productPersonalizedNumber: z.coerce
    .number()
    .int()
    .min(0, { message: "O número deve estar entre 0 e 99." })
    .max(99, { message: "O número deve estar entre 0 e 99." })
    .optional(),
  productSize: z
    .string()
    .min(1, { message: "Size must be at least 1 character long." }),
  productQuantity: z.coerce
    .number()
    .int()
    .min(1, { message: "A quantidade deve ser maior que 0." }),
});

export type OrderPlacementPayload = z.infer<typeof OrderValidator>;
