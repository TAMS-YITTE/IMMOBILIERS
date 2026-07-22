/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import { simulateBuyVsRent, calculateAmortizationSchedule } from '@/lib/calculator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion,
});

// Regroupe les milliers avec une espace ASCII normale (0x20). toLocaleString('fr-FR')
// insere un caractere d espacement special (insecable ou insecable etroit selon la
// version de Node/ICU) que les polices standard de jsPDF n affichent pas (rendu "/").
// On construit le regroupement nous-memes pour ne dependre d aucun caractere invisible.
function groupThousands(value: any): string {
  const num = Number(value) || 0;
  const negative = num < 0;
  const digits = Math.round(Math.abs(num)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return negative ? `-${grouped}` : grouped;
}

function formatPrice(price: any) {
  if (!price) return 'Non disponible';
  return groupThousands(price) + ' €/m²';
}

function formatEuro(amount: any) {
  if (!amount) return 'Non disponible';
  return groupThousands(amount) + ' €';
}

function generatePDFBuffer(communeName: string, data: any, simResult: any, userParams: any): ArrayBuffer {
  const doc = new jsPDF();
  
  // Variables de simulation (respecte le type de bien choisi : appartement ou maison)
  const surface = Number(userParams.surface);
  const prixM2 = Number(userParams.typeBien === 'appart' ? data.prix_m2_appart_moyen : data.prix_m2_maison_moyen) || 0;
  const loyerM2 = Number(userParams.typeBien === 'appart' ? data.loyer_m2_appart_moyen : data.loyer_m2_maison_moyen) || 0;
  
  const prixTotal = prixM2 * surface;
  const fraisNotaire = prixTotal * 0.08;
  const apport = Number(userParams.apport);

  const ratioPassoires = Number(data.ratio_dpe_fg) || 0;
  const renoCostPerM2 = ratioPassoires > 0.35 ? 1200 : (ratioPassoires > 0.15 ? 750 : 400);
  const budgetRenoEstime = surface * renoCostPerM2;

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
  doc.text(`2. Votre Scénario : Achat de ${surface} m²`, 20, 145);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`Budget d'environ ${formatEuro(prixTotal)} (hors frais annexes) | Apport: ${formatEuro(apport)}`, 20, 155);

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`• Taux du prêt : ${(Number(userParams.tauxPret) * 100).toFixed(2)} % sur ${userParams.dureePret} ans`, 25, 165);
  doc.text(`• Frais de notaire estimés (8%) : ${formatEuro(fraisNotaire)}`, 25, 175);
  doc.text(`• Mensualité bancaire estimée : ${formatEuro(simResult.mensualite_banque_estimee)} / mois`, 25, 185);

  // Conclusion Page 1
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 200, 170, 35, 'F');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Verdict : Acheter ou Louer ?', 25, 212);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  const textConclusion = simResult.bascule_annee
    ? `Selon votre profil, l'investissement immobilier sur cet appartement devient mathématiquement plus rentable que la location après une détention de ${simResult.bascule_annee} ans.`
    : `Attention, selon vos critères, la location reste mathématiquement plus avantageuse que l'achat sur l'ensemble de la période simulée (25 ans).`;
  doc.text(doc.splitTextToSize(textConclusion, 160), 25, 222);

  // PAGE 2: Scénarios & Risques
  doc.addPage();
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 25, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255); 
  doc.text(`Kalcul.app - ${communeName}`, 105, 16, { align: 'center' });

  // Section: Comparaison selon la durée
  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246);
  doc.text('3. Comparaison selon la durée de détention', 20, 45);

  const hist = simResult.history;
  const getSimLine = (yearIndex: number) => {
    if (!hist[yearIndex]) return { achat: 0, location: 0 };
    return hist[yearIndex];
  };

  const y5 = getSimLine(4);
  const y10 = getSimLine(9);
  const y20 = getSimLine(19);

  // Tracer un mini tableau
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(139, 92, 246);
  doc.rect(20, 55, 170, 8, 'F');
  doc.text('Scénario', 25, 60);
  doc.text('Patrimoine Acheteur', 70, 60);
  doc.text('Patrimoine Locataire', 120, 60);
  doc.text('Gagnant', 170, 60);

  doc.setTextColor(30, 41, 59);
  const drawRow = (yPos: number, label: string, rowData: any) => {
    doc.text(label, 25, yPos);
    doc.text(formatEuro(rowData.achat), 70, yPos);
    doc.text(formatEuro(rowData.location), 120, yPos);
    
    if (rowData.achat > rowData.location) {
      doc.setTextColor(22, 163, 74);
      doc.text('ACHAT', 170, yPos);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('LOCATION', 170, yPos);
    }
    doc.setTextColor(30, 41, 59);
    doc.line(20, yPos+3, 190, yPos+3);
  };

  drawRow(70, 'Revente à 5 ans', y5);
  drawRow(80, 'Revente à 10 ans', y10);
  drawRow(90, 'Revente à 20 ans', y20);

  // --- Graphique Patrimoine Net (jsPDF line drawing) ---
  doc.setFontSize(12);
  doc.setTextColor(139, 92, 246);
  doc.text('Évolution du patrimoine net sur 25 ans', 20, 110);

  // Légende
  doc.setLineWidth(1.5);
  doc.setDrawColor(168, 85, 247); // Violet - Acheteur
  doc.line(20, 117, 30, 117);
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Acheteur', 33, 118);

  doc.setDrawColor(59, 130, 246); // Bleu - Locataire
  doc.line(65, 117, 75, 117);
  doc.text('Locataire', 78, 118);

  const gX = 20;
  const gY = 125;
  const gWidth = 170;
  const gHeight = 75;

  // Background & Cadre du graphique
  doc.setFillColor(248, 250, 252);
  doc.rect(gX, gY, gWidth, gHeight, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(gX, gY, gWidth, gHeight);

  if (hist && hist.length > 0) {
    let maxVal = 0;
    for (const h of hist) {
      if (h.achat > maxVal) maxVal = h.achat;
      if (h.location > maxVal) maxVal = h.location;
    }
    if (maxVal === 0) maxVal = 100000;

    // Grille horizontale
    for (let i = 1; i <= 3; i++) {
      const lineY = gY + gHeight - (i * gHeight / 4);
      doc.setDrawColor(241, 245, 249);
      doc.line(gX, lineY, gX + gWidth, lineY);
      const valLabel = Math.round((maxVal * (i / 4)) / 1000) + 'k€';
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(valLabel, gX + 2, lineY - 1);
    }

    const numPoints = hist.length;
    const mapX = (idx: number) => gX + (idx / (numPoints - 1)) * gWidth;
    const mapY = (val: number) => gY + gHeight - (val / maxVal) * gHeight;

    // Tracer courbe Acheteur (Violet)
    doc.setDrawColor(168, 85, 247);
    doc.setLineWidth(1.5);
    for (let i = 0; i < numPoints - 1; i++) {
      const x1 = mapX(i);
      const y1 = mapY(hist[i].achat);
      const x2 = mapX(i + 1);
      const y2 = mapY(hist[i + 1].achat);
      doc.line(x1, y1, x2, y2);
    }

    // Tracer courbe Locataire (Bleu)
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1.5);
    for (let i = 0; i < numPoints - 1; i++) {
      const x1 = mapX(i);
      const y1 = mapY(hist[i].location);
      const x2 = mapX(i + 1);
      const y2 = mapY(hist[i + 1].location);
      doc.line(x1, y1, x2, y2);
    }
  }

  // Section 4: Tableau d'amortissement
  doc.addPage();
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 25, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255); 
  doc.text(`Kalcul.app - ${communeName}`, 105, 16, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246);
  doc.text('4. Tableau d\'amortissement complet', 20, 45);

  const amortissement = calculateAmortizationSchedule(
    simResult.montant_emprunte, 
    userParams.tauxPret, 
    userParams.dureePret
  );

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(15, 23, 42);
  doc.rect(20, 55, 170, 8, 'F');
  doc.text('Année', 25, 60);
  doc.text('Capital Remboursé', 65, 60);
  doc.text('Intérêts Payés', 115, 60);
  doc.text('Capital Restant', 165, 60);

  let yPosT = 70;
  for (const ligne of amortissement) {
    if (yPosT > 270) {
      doc.addPage();
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 210, 25, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255); 
      doc.text(`Kalcul.app - ${communeName}`, 105, 16, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFillColor(15, 23, 42);
      doc.rect(20, 35, 170, 8, 'F');
      doc.text('Année', 25, 40);
      doc.text('Capital Remboursé', 65, 40);
      doc.text('Intérêts Payés', 115, 40);
      doc.text('Capital Restant', 165, 40);
      
      yPosT = 50;
    }
    
    doc.setTextColor(30, 41, 59);
    doc.text(`Année ${ligne.annee}`, 25, yPosT);
    doc.text(formatEuro(ligne.capitalRembourseAnnuel), 65, yPosT);
    doc.text(formatEuro(ligne.interetsAnnuels), 115, yPosT);
    doc.text(formatEuro(ligne.capitalRestantDu), 165, yPosT);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, yPosT+3, 190, yPosT+3);
    
    yPosT += 10;
  }

  // Section: Risque Loi Climat
  doc.addPage();
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 25, 'F');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255); 
  doc.text(`Kalcul.app - ${communeName}`, 105, 16, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(139, 92, 246);
  doc.text('5. Risque Loi Climat (DPE)', 20, 45);

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Proportion de biens "Passoires Thermiques" (F et G) : ${(ratioPassoires * 100).toFixed(1)} %`, 20, 55);
  
  doc.setFontSize(11);
  if (ratioPassoires > 0.25) {
    doc.setTextColor(220, 38, 38); 
    doc.text(`ATTENTION : Le risque énergétique est très élevé sur cette commune.`, 20, 65);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(`En cas d'achat d'un bien classé G, il sera interdit à la location dès 2025. Prévoyez une décote à l'achat et un budget travaux estimé à ${formatEuro(budgetRenoEstime)} pour une rénovation globale.`, 170), 20, 75);
  } else {
    doc.setTextColor(22, 163, 74);
    doc.text(`Le parc immobilier local est relativement sain.`, 20, 65);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(`Toutefois, vérifiez toujours le DPE avant d'acheter. Les biens classés F et G nécessiteront des travaux importants de l'ordre de ${formatEuro(budgetRenoEstime)}.`, 170), 20, 75);
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
    } catch {
      return NextResponse.json({ error: 'Invalid Stripe session' }, { status: 400 });
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    // 2. Fetch the actual commune data for the PDF
    const codeInsee = session.metadata?.codeInsee;
    const communeName = session.metadata?.communeName || 'votre ville';

    let data: any = {};
    if (codeInsee) {
      const { data: metrics } = await supabase
        .from('communes_metrics')
        .select('*')
        .eq('code_insee', codeInsee)
        .single();
      
      if (metrics) data = metrics;
    }

    const userParams = {
      surface: Number(session.metadata?.surface) || 60,
      apport: Number(session.metadata?.apport) || 0,
      typeBien: session.metadata?.typeBien === 'maison' ? 'maison' : 'appart',
      tauxPret: session.metadata?.tauxPret ? Number(session.metadata.tauxPret) / 100 : 0.035,
      dureePret: Number(session.metadata?.dureePret) || 25,
    };

    // Simulate using the calculator (respecte le type de bien choisi par l'utilisateur,
    // pas toujours "appartement")
    const simParams = {
      prix_m2: Number(userParams.typeBien === 'appart' ? data.prix_m2_appart_moyen : data.prix_m2_maison_moyen) || 0,
      loyer_m2: Number(userParams.typeBien === 'appart' ? data.loyer_m2_appart_moyen : data.loyer_m2_maison_moyen) || 0,
      taxe_fonciere_annuelle: Number(data.taxe_fonciere_moyenne) || 0,
      ratio_dpe_fg: Number(data.ratio_dpe_fg) || 0,
      surface: userParams.surface,
      apport: userParams.apport,
      taux_pret: userParams.tauxPret,
      duree_pret_annees: userParams.dureePret
    };

    const simResult = simulateBuyVsRent(simParams);

    // 3. Generate the PDF
    const pdfBuffer = generatePDFBuffer(communeName, data, simResult, userParams);

    // 4. Return as a downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rapport_Kalcul_${communeName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
