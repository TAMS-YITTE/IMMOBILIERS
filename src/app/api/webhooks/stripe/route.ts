/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_key'
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Fallback in dev if webhook secret is not yet set
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.customer_details?.email || session.customer_email || 'inconnu@email.com';
    const codeInsee = session.metadata?.codeInsee || '';
    const montantPaye = (session.amount_total || 499) / 100;
    const stripeSessionId = session.id;

    try {
      const { error } = await supabaseAdmin.from('rapports_pdf').insert({
        email,
        code_insee: codeInsee,
        montant_paye: montantPaye,
        stripe_session_id: stripeSessionId,
        statut: 'paye',
      });

      if (error) {
        console.error('Error recording PDF purchase:', error);
      }
    } catch (dbErr) {
      console.error('Database connection error in Stripe webhook:', dbErr);
    }
  }

  return NextResponse.json({ received: true });
}
