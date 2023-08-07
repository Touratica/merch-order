import { prisma } from "@/lib/prisma";
import { OrderValidator } from "@/lib/validators/order";
import { Buyer } from "@prisma/client";
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
        OrderItem: {
          create: {
            productId,
            size: productSize,
            personalizedName: productPersonalizedName,
            personalizedNumber: productPersonalizedNumber,
            quantity: productQuantity,
          },
        },
      },
    });

    return new NextResponse(JSON.stringify(order), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }

    return new NextResponse(
      "Could not place order at this time. Please try later",
      { status: 500 }
    );
  }
}
