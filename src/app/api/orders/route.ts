import { prisma } from "@/lib/prisma";
import { OrderValidator, type PlaceOrderPayload } from "@/lib/validators/order";
import type {
  Buyer,
  Order,
  OrderItem,
  Prisma,
  PrismaClient,
  Product,
} from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Gets the buyer from the database or creates it if it doesn't exist. If the buyer exists but the phone number or type is different, it updates the phone number and type.
 * @param {Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,"$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends">} tx - Transaction client
 * @param {Pick<Buyer, "firstName" | "lastName" | "vatId" | "email" | "phone">} buyer - Buyer details
 * @returns {Promise<Buyer>} The buyer
 * @throws If the buyer could not be retrived/created/updated
 */
async function getOrUpsertBuyer(
  tx: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends"
  >,
  {
    firstName,
    lastName,
    vatId,
    email,
    phone,
    type,
  }: Pick<
    Buyer,
    "firstName" | "lastName" | "vatId" | "email" | "phone" | "type"
  >,
): Promise<Buyer> {
  const buyer = await tx.buyer.findUnique({
    where: {
      firstName_lastName_vatId_email: {
        firstName,
        lastName,
        vatId,
        email,
      },
    },
  });

  if (!buyer || buyer.phone !== phone || buyer.type !== type)
    return await tx.buyer.upsert({
      where: {
        firstName_lastName_vatId_email: {
          firstName,
          lastName,
          vatId,
          email,
        },
      },
      create: {
        firstName,
        lastName,
        vatId,
        email,
        phone,
        type,
      },
      update: {
        phone,
        type,
      },
    });

  return buyer;
}

/**
 * Creates an order in the database and sends an email to the store owner with the order details.
 * @param {PlaceOrderPayload} placeOrderPayload - Order details
 * @returns {Promise<Order & { orderItems: (OrderItem & { product: Product })[] } & { buyer: Buyer; }>} The order
 */
async function placeOrder({
  buyerFirstName,
  buyerLastName,
  buyerVatId,
  buyerEmail,
  buyerMobilePhone,
  buyerType,
  productId,
  productPersonalizedName,
  productPersonalizedNumber,
  productSize,
  productQuantity,
}: PlaceOrderPayload): Promise<
  Order & { orderItems: (OrderItem & { product: Product })[] } & {
    buyer: Buyer;
  }
> {
  return await prisma.$transaction(async (tx) => {
    const buyer = await getOrUpsertBuyer(tx, {
      firstName: buyerFirstName,
      lastName: buyerLastName,
      vatId: buyerVatId,
      email: buyerEmail,
      phone: buyerMobilePhone ?? null,
      type: buyerType,
    });

    const order = await tx.order.create({
      data: {
        buyerId: buyer.id,
        orderItems: {
          create: {
            productId,
            size: productSize,
            personalizedName: productPersonalizedName,
            personalizedNumber: productPersonalizedNumber,
            quantity: productQuantity,
          },
        },
      },
      include: {
        orderItems: { include: { product: true } },
        buyer: true,
      },
    });

    await sendEmail(order);

    return order;
  });
}

/**
 * Sends an email to the store owner with the order details
 * @param {Order & { orderItems: (OrderItem & { product: Product })[] } & { buyer: Buyer; }} order - Details of the order, including the buyer and the order items with the product details
 *
 * @throws If the email could not be sent
 */
async function sendEmail(
  order: Order & { orderItems: (OrderItem & { product: Product })[] } & {
    buyer: Buyer;
  },
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const msg: sgMail.MailDataRequired = {
    from: process.env.SENDGRID_FROM_EMAIL!,
    to: process.env.SENDGRID_TO_EMAIL!,
    subject: `Encomenda #${order.id}`,
    html: `
    <head>
    <style>
      table,
      th,
      td {
        border: 1px solid black;
        border-collapse: collapse;
        padding: 0.25rem 0.5rem;
        min-width: 2.5rem;
        text-align: center;
      }
    </style>
    </head>
    <h1>Encomenda #${order.id}</h1>
    <p><b>Nome:</b> ${order.buyer.firstName} ${order.buyer.lastName}</p>
    <p><b>NIF:</b> ${order.buyer.vatId}</p>
    <p><b>Email:</b> ${order.buyer.email}</p>
    <p><b>Telemóvel:</b> ${order.buyer.phone ?? ""}</p>
    <p><b>Tipo de cliente:</b> ${order.buyer.type}</p>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Tamanho</th>
          <th>Nome</th>
          <th>Número</th>
          <th>Qnt</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${order.orderItems.at(0)?.product.name}</td>
          <td>${order.orderItems.at(0)?.size}</td>
          <td>${order.orderItems.at(0)?.personalizedName ?? ""}</td>
          <td>${order.orderItems.at(0)?.personalizedNumber ?? ""}</td>
          <td>${order.orderItems.at(0)?.quantity}</td>
        </tr>
      </tbody>
    </table>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error: unknown) {
    console.error(error);

    throw new Error("Could not send email", { cause: "SENDGRID_ERROR" });
  }
}

/**
 * Creates an order and sends an email to the store owner with the order details.
 * @endpoint POST /api/orders
 * @async
 * @param {Request} req - The request
 * @returns {Promise<NextResponse>} The response
 * @throws If the request body is invalid or if the order could not be created
 * @throws If the email could not be sent
 * @throws If the request could not be processed
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const placeOrderPayload = OrderValidator.parse(body);

    const order = await placeOrder(placeOrderPayload);

    return new NextResponse<
      Order & { orderItems: (OrderItem & { product: Product })[] } & {
        buyer: Buyer;
      }
    >(JSON.stringify(order), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.error(error);

    return new NextResponse(
      "Could not place order at this time. Please try later",
      { status: 500 },
    );
  }
}
