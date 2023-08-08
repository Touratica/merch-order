import { prisma } from "@/lib/prisma";
import { OrderValidator } from "@/lib/validators/order";
import type { Buyer, Order, OrderItem, Product } from "@prisma/client";
import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Gets the buyer from the database or creates it if it doesn't exist. If the buyer exists but the phone number or type is different, it updates the phone number and type.
 * @param {Pick<Buyer, "firstName" | "lastName" | "vatId" | "email" | "phone">} buyer - Buyer details
 * @returns {Promise<Buyer>} The buyer
 * @throws If the buyer could not be retrived/created/updated
 */
async function getOrUpsertBuyer({
  firstName,
  lastName,
  vatId,
  email,
  phone,
  type,
}: Pick<
  Buyer,
  "firstName" | "lastName" | "vatId" | "email" | "phone" | "type"
>): Promise<Buyer> {
  const buyer = await prisma.buyer.findUnique({
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
    return await prisma.buyer.upsert({
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
 * Sends an email to the store owner with the order details
 * @param {Order & { orderItems: (OrderItem & { product: Product })[] } & { buyer: Buyer; }} order - Details of the order, including the buyer and the order items with the product details
 *
 * @throws If the email could not be sent
 */
async function sendEmail(
  order: Order & { orderItems: (OrderItem & { product: Product })[] } & {
    buyer: Buyer;
  }
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const msg: sgMail.MailDataRequired = {
    from: process.env.SENDGRID_FROM_EMAIL!,
    to: process.env.SENDGRID_TO_EMAIL!,
    subject: `Encomenda #${order.id}`,
    html: `<h1>Encomenda #${order.id}</h1>
    <p><b>Nome:</b> ${order.buyer.firstName} ${order.buyer.lastName}</p>
    <p><b>NIF:</b> ${order.buyer.vatId}</p>
    <p><b>Email:</b> ${order.buyer.email}</p>
    <p><b>Telemóvel:</b> ${order.buyer.phone || ""}</p>
    <p><b>Tipo de cliente:</b> ${order.buyer.type}</p>
    <p><b>Produto:</b> ${order.orderItems.at(0)?.product.name}</p>
    <p><b>Tamanho:</b> ${order.orderItems.at(0)?.size}</p>
    <p><b>Nome personalizado:</b> ${
      order.orderItems.at(0)?.personalizedName || ""
    }</p>
    <p><b>Número personalizado:</b> ${
      order.orderItems.at(0)?.personalizedNumber || ""
    }</p>
    <p>Quantidade: ${order.orderItems.at(0)?.quantity}</p>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error: any) {
    console.error(error);

    if (error?.response) {
      console.error(error.response.body);
    }

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
    const body = await req.json();
    const {
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
    } = OrderValidator.parse(body);

    let buyer = await getOrUpsertBuyer({
      firstName: buyerFirstName,
      lastName: buyerLastName,
      vatId: buyerVatId,
      email: buyerEmail,
      phone: buyerMobilePhone || null,
      type: buyerType,
    });

    const order = await prisma.order.create({
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
      { status: 500 }
    );
  }
}
