import { prisma } from "@/lib/prisma";
import { OrderValidator } from "@/lib/validators/order";
import type { Buyer, Order, OrderItem, Product } from "@prisma/client";
import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";
import { z } from "zod";

async function getOrUpsertBuyer({
  firstName,
  lastName,
  vatId,
  email,
  phone,
}: Pick<
  Buyer,
  "firstName" | "lastName" | "vatId" | "email" | "phone"
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

  if (!buyer || buyer.phone !== phone)
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
      },
      update: {
        phone,
      },
    });

  return buyer;
}

async function sendMail(
  order: Order & { orderItems: (OrderItem & { product: Product })[] },
  buyer: Buyer
) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const msg: sgMail.MailDataRequired = {
    from: process.env.SENDGRID_FROM_EMAIL!,
    to: process.env.SENDGRID_TO_EMAIL!,
    subject: `Encomenda #${order.id}`,
    html: `<h1>Encomenda #${order.id}</h1>
    <p>Nome: ${buyer.firstName} ${buyer.lastName}</p>
    <p>NIF: ${buyer.vatId}</p>
    <p>Email: ${buyer.email}</p>
    <p>Telemóvel: ${buyer.phone}</p>
    <p>Produto: ${order.orderItems[0].product.name}</p>
    <p>Tamanho: ${order.orderItems[0].size}</p>
    <p>Nome personalizado: ${order.orderItems[0].personalizedName}</p>
    <p>Número personalizado: ${order.orderItems[0].personalizedNumber}</p>
    <p>Quantidade: ${order.orderItems[0].quantity}</p>`,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      buyerFirstName,
      buyerLastName,
      buyerVatId,
      buyerEmail,
      buyerMobilePhone,
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
      },
    });

    await sendMail(order, buyer);

    return new NextResponse(JSON.stringify(order), { status: 201 });
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
