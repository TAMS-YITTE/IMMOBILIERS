import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import PDFDocument from 'pdfkit';
import { supabase } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any,
});

// Helper to generate PDF Buffer
function generatePDFBuffer(communeName: string, data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Styling
      doc.fillColor('#1e293b'); // Slate-800
      
      // Header
      doc.fontSize(24).fillColor('#8b5cf6').text('Kalcul.app - Rapport Financier', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(16).fillColor('#1e293b').text(`Analyse Immobilière : ${communeName}`);
      doc.moveDown();

      // Body
      doc.fontSize(12).text(`Ce document confidentiel détaille les métriques financières exactes pour ${communeName}.`);
      doc.moveDown();
      
      doc.fontSize(14).fillColor('#3b82f6').text('Données Marché (DVF 2023)');
      doc.fontSize(12).fillColor('#1e293b');
      doc.text(`Prix moyen Appartement : ${data.prix_m2_appart_moyen ? data.prix_m2_appart_moyen + ' €/m²' : 'Non disponible'}`);
      doc.text(`Prix moyen Maison : ${data.prix_m2_maison_moyen ? data.prix_m2_maison_moyen + ' €/m²' : 'Non disponible'}`);
      doc.text(`Loyer moyen : ${data.loyer_m2_appart_moyen ? data.loyer_m2_appart_moyen + ' €/m²' : 'Non disponible'}`);
      doc.moveDown();

      doc.fontSize(14).fillColor('#3b82f6').text('Fiscalité & Performance Énergétique');
      doc.fontSize(12).fillColor('#1e293b');
      doc.text(`Taxe Foncière Moyenne : ${data.taxe_fonciere_moyenne ? data.taxe_fonciere_moyenne + ' €' : 'Non disponible'}`);
      doc.text(`Proportion de passoires thermiques (F/G) : ${data.ratio_dpe_fg ? (data.ratio_dpe_fg * 100).toFixed(1) + ' %' : 'Non disponible'}`);
      doc.moveDown();

      doc.fontSize(14).fillColor('#8b5cf6').text('Conclusion Kalcul.app');
      doc.fontSize(12).fillColor('#1e293b').text(`Basé sur les données de ${communeName}, l'investissement immobilier nécessite une détention moyenne de 7 à 12 ans pour amortir les frais de notaire et la taxe foncière comparativement à la location.`);
      
      doc.moveDown(3);
      doc.fontSize(10).fillColor('#94a3b8').text('© 2026 Kalcul.app - Données fournies à titre indicatif et ne constituant pas un conseil financier officiel.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
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
    const pdfBuffer = await generatePDFBuffer(communeName, data);

    // 4. Return as a downloadable file
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rapport_Kalcul_${communeName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
