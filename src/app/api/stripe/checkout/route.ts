import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId } = await request.json();

  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  // Optionally: Look up user in DB for email, etc.
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Create Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price: priceId, // Stripe Price ID for your credits product
        quantity: 1,
      },
    ],
    customer_email: user?.email ?? undefined,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe/cancel`,
    metadata: {
      userId: session.user.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
