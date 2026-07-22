import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any,
});

function formatPrice(price: any) {
  if (!price) return 'Non disponible';
  return Math.round(Number(price)).toLocaleString('fr-FR') + ' €/m²';
}

function formatEuro(amount: any) {
  if (!amount) return 'Non disponible';
  return Math.round(Number(amount)).toLocaleString('fr-FR') + ' €';
}

function generatePDFBuffer(communeName: string, data: any): ArrayBuffer {
  const doc = new jsPDF();
  
  // Header background
  doc.setFillColor(15, 23, 42); // slate-950
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255); // White
  doc.text('Kalcul.app - Rapport Financier', 105, 25, { align: 'center' });
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(`Analyse Immobilière : ${communeName}`, 20, 60);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ce document confidentiel détaille les métriques pour ${communeName}.`, 20, 70);
  
  // Section 1
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 80, 190, 80);
  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246); // Purple
  doc.text('Données Marché (DVF 2023)', 20, 90);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Prix moyen Appartement : ${formatPrice(data.prix_m2_appart_moyen)}`, 20, 100);
  doc.text(`Prix moyen Maison : ${formatPrice(data.prix_m2_maison_moyen)}`, 20, 110);
  doc.text(`Loyer moyen : ${formatPrice(data.loyer_m2_appart_moyen)}`, 20, 120);
  
  // Section 2
  doc.line(20, 135, 190, 135);
  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246);
  doc.text('Fiscalité & Performance Énergétique', 20, 145);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Taxe Foncière Moyenne : ${formatEuro(data.taxe_fonciere_moyenne)}`, 20, 155);
  doc.text(`Proportion de passoires thermiques (F/G) : ${data.ratio_dpe_fg ? (data.ratio_dpe_fg * 100).toFixed(1) + ' %' : 'Non disponible'}`, 20, 165);
  
  // Conclusion
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 185, 170, 40, 'F');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Conclusion Kalcul.app', 25, 195);
  
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const text = `Basé sur les données de ${communeName}, l'investissement immobilier nécessite une détention moyenne de 7 à 12 ans pour amortir les frais de notaire et la taxe foncière comparativement à la location.`;
  const splitText = doc.splitTextToSize(text, 160);
  doc.text(splitText, 25, 205);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('© 2026 Kalcul.app - Données fournies à titre indicatif', 105, 280, { align: 'center' });

  return doc.output('arraybuffer');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID missing' }, { status: 400 });
    }

    // 1. Verify the session with Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Stripe session' }, { status: 400 });
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    // 2. Fetch the actual commune data for the PDF
    const codeInsee = session.metadata?.codeInsee;
    const communeName = session.metadata?.communeName || 'votre ville';

    let data = {};
    if (codeInsee) {
      const { data: metrics } = await supabase
        .from('communes_metrics')
        .select('*')
        .eq('code_insee', codeInsee)
        .single();
      
      if (metrics) data = metrics;
    }

    // 3. Generate the PDF
    const pdfBuffer = generatePDFBuffer(communeName, data);

    // 4. Return as a downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rapport_Kalcul_${communeName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
