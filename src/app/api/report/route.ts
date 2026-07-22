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
  
  // Variables de simulation pour 60m²
  const surface = 60;
  const prixM2 = Number(data.prix_m2_appart_moyen) || 0;
  const loyerM2 = Number(data.loyer_m2_appart_moyen) || 0;
  
  const prixTotal = prixM2 * surface;
  const loyerMensuel = loyerM2 * surface;
  const rendementBrut = prixTotal > 0 ? ((loyerMensuel * 12) / prixTotal) * 100 : 0;
  const fraisNotaire = prixTotal * 0.08;
  const apportRecommande = fraisNotaire + (prixTotal * 0.10); // Notaire + 10% du prix

  const ratioPassoires = data.ratio_dpe_fg || 0;
  const budgetRenoEstime = surface * 1000; // 1000€/m2 pour reno globale

  // PAGE 1: Synthèse & Données de base
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255); 
  doc.text('Rapport Financier Premium', 105, 25, { align: 'center' });
  
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text(`Marché de : ${communeName}`, 20, 60);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Analyse experte générée le ${new Date().toLocaleDateString('fr-FR')}`, 20, 70);
  
  // Section: Les Chiffres Locaux
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 80, 190, 80);
  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246); 
  doc.text('1. Les Vrais Prix du Marché (DVF)', 20, 95);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Prix Appartement : ${formatPrice(data.prix_m2_appart_moyen)}`, 20, 105);
  doc.text(`Prix Maison : ${formatPrice(data.prix_m2_maison_moyen)}`, 20, 115);
  doc.text(`Loyer marché : ${formatPrice(data.loyer_m2_appart_moyen)}`, 110, 105);
  doc.text(`Taxe Foncière : ${formatEuro(data.taxe_fonciere_moyenne)}`, 110, 115);

  // Section: Simulation Concrète
  doc.line(20, 130, 190, 130);
  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246);
  doc.text(`2. Simulation d'Achat : Appartement Type de ${surface} m²`, 20, 145);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`Pour un budget d'environ ${formatEuro(prixTotal)} (hors frais annexes) :`, 20, 155);

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`• Frais de notaire estimés (8%) : ${formatEuro(fraisNotaire)}`, 25, 165);
  doc.text(`• Apport cash recommandé : ${formatEuro(apportRecommande)}`, 25, 175);
  
  // Conclusion Page 1
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 190, 170, 35, 'F');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Verdict : Acheter ou Louer ?', 25, 202);
  
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const textConclusion = `À ${communeName}, l'investissement immobilier sur cet appartement devient mathématiquement plus rentable que la location après une détention moyenne de 7 à 11 ans (amortissement des frais de mutation).`;
  doc.text(doc.splitTextToSize(textConclusion, 160), 25, 212);

  // PAGE 2: Investissement & Risques
  doc.addPage();
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 25, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255); 
  doc.text(`Kalcul.app - ${communeName}`, 105, 16, { align: 'center' });

  // Section: Investissement Locatif
  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246);
  doc.text('3. Potentiel Investisseur (Rendement)', 20, 45);

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rendement Locatif Brut estimé : ${rendementBrut.toFixed(2)} %`, 20, 55);
  
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  let commentaireRendement = "Un rendement modéré, caractéristique des zones patrimoniales.";
  if (rendementBrut > 6) commentaireRendement = "Un rendement très attractif, propice à un investissement cash-flow positif.";
  if (rendementBrut < 4) commentaireRendement = "Un rendement faible. Le gain se fera sur la plus-value à la revente plutôt que sur les loyers.";
  doc.text(doc.splitTextToSize(`Si vous mettez ce bien de ${surface}m² en location à ${formatEuro(loyerMensuel)}/mois : ${commentaireRendement}`, 170), 20, 65);

  // Section: Risque Loi Climat
  doc.line(20, 85, 190, 85);
  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246);
  doc.text('4. Risque Loi Climat (DPE)', 20, 100);

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Proportion de biens "Passoires Thermiques" (F et G) : ${(ratioPassoires * 100).toFixed(1)} %`, 20, 110);
  
  doc.setFontSize(11);
  if (ratioPassoires > 0.25) {
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`ATTENTION : Le risque énergétique est très élevé sur cette commune.`, 20, 120);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(`En cas d'achat d'un bien classé G, il sera interdit à la location dès 2025. Prévoyez une décote à l'achat et un budget travaux estimé à ${formatEuro(budgetRenoEstime)} pour une rénovation globale.`, 170), 20, 130);
  } else {
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`Le parc immobilier local est relativement sain.`, 20, 120);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(`Toutefois, vérifiez toujours le DPE avant d'acheter. Les biens classés F et G nécessiteront des travaux importants de l'ordre de ${formatEuro(budgetRenoEstime)}.`, 170), 20, 130);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('© 2026 Kalcul.app - Données fournies à titre indicatif et non contractuel', 105, 280, { align: 'center' });

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
