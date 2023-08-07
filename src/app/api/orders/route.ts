import { prisma } from "@/lib/prisma";
import { OrderValidator } from "@/lib/validators/order";
import { NextResponse } from "next/server";
import { z } from "zod";

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

    let buyer = await prisma.buyer.findUnique({
      where: {
        firstName_lastName_vatId_email: {
          firstName: buyerFirstName,
          lastName: buyerLastName,
          vatId: buyerVatId,
          email: buyerEmail,
        },
      },
    });

    if (buyer && buyer.phone !== buyerMobilePhone)
      buyer = await prisma.buyer.update({
        where: {
          firstName_lastName_vatId_email: {
            firstName: buyerFirstName,
            lastName: buyerLastName,
            vatId: buyerVatId,
            email: buyerEmail,
          },
        },
        data: {
          phone: buyerMobilePhone,
        },
      });

    if (!buyer)
      buyer = await prisma.buyer.create({
        data: {
          firstName: buyerFirstName,
          lastName: buyerLastName,
          vatId: buyerVatId,
          email: buyerEmail,
          phone: buyerMobilePhone,
        },
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
