import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const eventId = event.id;

    // Check if this event was already processed
    const alreadyProcessed = await prisma.stripeWebhookEvent.findUnique({
      where: { id: eventId }
    });

    if (alreadyProcessed) {
      // Idempotency: already handled
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    // Grant credits (e.g., +5 credits per purchase)
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 5 } }, // Adjust as needed
      });
    }

    // Record this event as processed
    await prisma.stripeWebhookEvent.create({
      data: { id: eventId }
    });
  }

  return NextResponse.json({ received: true });
}
