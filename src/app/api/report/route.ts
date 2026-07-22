import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any,
});

function generatePDFBuffer(communeName: string, data: any): ArrayBuffer {
  const doc = new jsPDF();
  
  doc.setFontSize(24);
  doc.setTextColor(139, 92, 246);
  doc.text('Kalcul.app - Rapport Financier', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(`Analyse Immobiliere : ${communeName}`, 20, 40);
  
  doc.setFontSize(12);
  doc.text(`Ce document confidentiel detaille les metriques pour ${communeName}.`, 20, 50);
  
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text('Donnees Marche (DVF 2023)', 20, 70);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Prix moyen Appartement : ${data.prix_m2_appart_moyen ? data.prix_m2_appart_moyen + ' EUR/m2' : 'Non disponible'}`, 20, 80);
  doc.text(`Prix moyen Maison : ${data.prix_m2_maison_moyen ? data.prix_m2_maison_moyen + ' EUR/m2' : 'Non disponible'}`, 20, 90);
  doc.text(`Loyer moyen : ${data.loyer_m2_appart_moyen ? data.loyer_m2_appart_moyen + ' EUR/m2' : 'Non disponible'}`, 20, 100);
  
  doc.setFontSize(14);
  doc.setTextColor(59, 130, 246);
  doc.text('Fiscalite & Performance Energetique', 20, 120);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Taxe Fonciere Moyenne : ${data.taxe_fonciere_moyenne ? data.taxe_fonciere_moyenne + ' EUR' : 'Non disponible'}`, 20, 130);
  doc.text(`Proportion de passoires thermiques (F/G) : ${data.ratio_dpe_fg ? (data.ratio_dpe_fg * 100).toFixed(1) + ' %' : 'Non disponible'}`, 20, 140);
  
  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246);
  doc.text('Conclusion Kalcul.app', 20, 160);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  const text = `Base sur les donnees de ${communeName}, l'investissement immobilier necessite une detention moyenne de 7 a 12 ans pour amortir les frais de notaire et la taxe fonciere comparativement a la location.`;
  const splitText = doc.splitTextToSize(text, 170);
  doc.text(splitText, 20, 170);
  
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('© 2026 Kalcul.app - Donnees fournies a titre indicatif', 105, 280, { align: 'center' });

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
