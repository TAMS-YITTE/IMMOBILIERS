import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codeInsee, communeName } = body;

    if (!codeInsee) {
      return NextResponse.json({ error: 'Code INSEE missing' }, { status: 400 });
    }

    // Determine the base URL for success/cancel redirects
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Rapport Financier Détaillé - ${communeName || codeInsee}`,
              description: 'Analyse financière complète (Acheter vs Louer), flux de trésorerie, et conclusion.',
            },
            unit_amount: 499, // 4.99€
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/paiement-reussi?session_id={CHECKOUT_SESSION_ID}&code=${codeInsee}`,
      cancel_url: `${baseUrl}/acheter-ou-louer/${codeInsee}`,
      metadata: {
        codeInsee,
        communeName,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
