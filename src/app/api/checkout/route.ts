import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    // Demo mode: simulate successful checkout
    return NextResponse.json({ url: "/success?demo=true" });
  }

  try {
    const stripe = new Stripe(stripeKey);
    const body = await request.json();
    const { returnPath, product = "optimizer" } = body as {
      returnPath?: string;
      product?: "optimizer" | "apply_copilot";
    };
    const isApplyCopilot = product === "apply_copilot";

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const metadata: Record<string, string> = {
      product: isApplyCopilot ? "apply-copilot-beta" : "ats-forge-access",
    };
    const datafastVisitorId = request.cookies.get("datafast_visitor_id")?.value;
    const datafastSessionId = request.cookies.get("datafast_session_id")?.value;

    if (datafastVisitorId) {
      metadata.datafast_visitor_id = datafastVisitorId;
    }

    if (datafastSessionId) {
      metadata.datafast_session_id = datafastSessionId;
    }

    const lineItem = isApplyCopilot
      ? process.env.STRIPE_APPLY_COPILOT_PRICE_ID
        ? {
            price: process.env.STRIPE_APPLY_COPILOT_PRICE_ID,
            quantity: 1,
          }
        : {
            price_data: {
              currency: "usd",
              product_data: {
                name: "GetDreamRole — Apply Copilot Beta",
                description: "50 generated Greenhouse and Lever application packs per month.",
                images: [],
              },
              unit_amount: 1900,
              recurring: { interval: "month" as const },
            },
            quantity: 1,
          }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: "GetDreamRole — Resume Optimization",
              description:
                "One-time payment for unlimited resume analysis and AI-powered rewrites across all ATS platforms.",
              images: [],
            },
            unit_amount: 999,
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [lineItem],
      mode: isApplyCopilot ? "subscription" : "payment",
      success_url: isApplyCopilot
        ? `${origin}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`
        : `${origin}/success?session_id={CHECKOUT_SESSION_ID}&return=${encodeURIComponent(returnPath || "/optimize")}`,
      cancel_url: `${origin}${returnPath || "/optimize"}`,
      metadata,
      subscription_data: isApplyCopilot ? { metadata } : undefined,
    });

    // Ensure gdrUserId cookie is set before Stripe redirect
    // (fallback in case proxy.ts hasn't run yet)
    const response = NextResponse.json({ url: session.url });
    if (!request.cookies.get("gdrUserId")) {
      response.cookies.set("gdrUserId", crypto.randomUUID(), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
