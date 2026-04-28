import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import Stripe from "stripe";
import { api } from "../../../../../convex/_generated/api";

export const runtime = "nodejs";

function subscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled") return "canceled";
  if (status === "incomplete_expired") return "expired";
  return "past_due";
}

function currentPeriodEnd(subscription: Stripe.Subscription) {
  const firstItem = subscription.items.data[0];
  return firstItem?.current_period_end ? firstItem.current_period_end * 1000 : undefined;
}

async function getCustomerEmail(stripe: Stripe, customer: Stripe.Subscription["customer"]) {
  if (typeof customer !== "string") {
    return "deleted" in customer ? undefined : customer.email ?? undefined;
  }

  const retrieved = await stripe.customers.retrieve(customer);
  if ("deleted" in retrieved) return undefined;
  return retrieved.email ?? undefined;
}

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!stripeKey || !webhookSecret || !convexUrl) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid webhook signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const convex = new ConvexHttpClient(convexUrl);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email ?? session.customer_email ?? undefined;
      const product = session.metadata?.product;

      if (email && product === "ats-forge-access" && session.payment_status === "paid") {
        await convex.mutation(api.purchases.recordPurchase, {
          stripeSessionId: session.id,
          email,
          product,
        });
      }

      if (email && product === "apply-copilot-beta") {
        await convex.mutation(api.entitlements.upsertForEmail, {
          webhookSecret,
          email,
          kind: "apply_copilot",
          status: "active",
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : undefined,
        });
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const product = subscription.metadata?.product;

      if (product === "apply-copilot-beta") {
        const email = await getCustomerEmail(stripe, subscription.customer);

        if (email) {
          await convex.mutation(api.entitlements.upsertForEmail, {
            webhookSecret,
            email,
            kind: "apply_copilot",
            status: subscriptionStatus(subscription.status),
            stripeCustomerId:
              typeof subscription.customer === "string" ? subscription.customer : undefined,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: currentPeriodEnd(subscription),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe webhook] Failed to sync Convex:", err);
    return NextResponse.json({ error: "Webhook sync failed" }, { status: 500 });
  }
}
