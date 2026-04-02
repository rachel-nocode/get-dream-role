import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const demo = searchParams.get("demo");

  // Demo mode
  if (demo === "true") {
    return NextResponse.json({ paid: true, demo: true });
  }

  if (!sessionId) {
    return NextResponse.json({ paid: false }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { paid: false, error: "No Stripe key configured" },
      { status: 500 },
    );
  }

  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    return NextResponse.json({ paid });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
