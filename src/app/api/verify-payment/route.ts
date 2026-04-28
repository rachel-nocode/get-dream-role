import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const demo = searchParams.get("demo");

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

    if (paid && process.env.NEXT_PUBLIC_CONVEX_URL) {
      const email = session.customer_details?.email;
      if (email) {
        try {
          const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
          await convex.mutation(api.purchases.recordPurchase, {
            stripeSessionId: sessionId,
            email,
            product: String(session.metadata?.product ?? "ats-forge-access"),
          });
          console.log("[verify-payment] Recorded purchase for:", email);
        } catch (err) {
          console.error("[verify-payment] Convex error:", err);
        }
      } else {
        console.warn("[verify-payment] No email on Stripe session:", sessionId);
      }
    }

    return NextResponse.json({ paid });
  } catch (error) {
    console.error("[verify-payment] Stripe error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
