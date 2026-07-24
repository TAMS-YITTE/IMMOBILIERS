/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import { simulateBuyVsRent, calculateAmortizationSchedule, calculateMonthlyMortgage } from '@/lib/calculator';

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

function generatePDFBuffer(communeName: string, codeInsee: string, data: any, simResult: any, userParams: any): ArrayBuffer {
  const doc = new jsPDF();
  
  // Variables de simulation
  const surface = Number(userParams.surface);
  const prixM2 = Number(userParams.typeBien === 'appart' ? data.prix_m2_appart_moyen : data.prix_m2_maison_moyen) || 0;
  const loyerM2 = Number(userParams.typeBien === 'appart' ? data.loyer_m2_appart_moyen : data.loyer_m2_maison_moyen) || 0;
  
  const prixTotal = prixM2 * surface;
  const fraisNotaire = prixTotal * 0.08;
  const fraisAgenceTaux = Number(userParams.fraisAgence) / 100;
  const fraisAgenceEuro = prixTotal * fraisAgenceTaux;
  const apport = Number(userParams.apport);

  const ratioPassoires = Number(data.ratio_dpe_fg) || 0;
  const renoCostPerM2 = ratioPassoires > 0.35 ? 1200 : (ratioPassoires > 0.15 ? 750 : 400);
  const budgetRenoEstime = surface * renoCostPerM2;

  const montantEmprunte = Number(simResult.montant_emprunte) || 0;
  const mensualiteCredit = calculateMonthlyMortgage(montantEmprunte, Number(userParams.tauxPret), Number(userParams.dureePret));
  const assuranceMensuelle = (montantEmprunte * (Number(userParams.tauxAssurance) / 100)) / 12;
  const chargesCoproMensuelle = (Number(userParams.chargesCopro) * surface) / 12;
  const provisionMensuelle = (Number(userParams.provisionReno) * surface) / 12;
  const taxeFonciereMensuelle = (Number(data.taxe_fonciere_moyenne) || 0) / 12;
  const mensualiteTotale = mensualiteCredit + assuranceMensuelle + chargesCoproMensuelle + provisionMensuelle + taxeFonciereMensuelle;

  // Calcul du gain net (Année 25)
  const hist = simResult.history;
  const finalYear = hist[hist.length - 1];
  const gainNet = (finalYear?.achat || 0) - (finalYear?.location || 0);

  // --- PAGE 1 : COUVERTURE & RÉSUMÉ ---
  
  // Header sombre premium
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(167, 139, 250); // Violet clair
  doc.setFont('helvetica', 'bold');
  doc.text('Kalcul.app', 20, 20);

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255); 
  doc.text('Bilan Financier Immobilier', 20, 32);
  
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.text(`Marché de : ${communeName} | Le ${new Date().toLocaleDateString('fr-FR')}`, 20, 42);

  // Le "Money Shot" : Résumé du gain
  doc.setFillColor(243, 232, 255); // Purple 100
  doc.rect(20, 60, 170, 35, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(107, 33, 168); // Purple 800
  doc.setFont('helvetica', 'bold');
  doc.text(simResult.bascule_annee ? 'RÉSULTAT DE LA SIMULATION : ACHAT RENTABLE' : 'RÉSULTAT : LA LOCATION RESTE PLUS RENTABLE', 25, 70);

  doc.setFontSize(18);
  doc.setTextColor(88, 28, 135); // Purple 900
  if (simResult.bascule_annee) {
    doc.text(`L'achat devient rentable après ${simResult.bascule_annee} ans.`, 25, 80);
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74); // Green 600
    doc.text(`Gain net estimé sur 25 ans : + ${formatEuro(gainNet)}`, 25, 90);
  } else {
    doc.text(`La location est plus rentable sur l'ensemble de la période.`, 25, 80);
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red 600
    doc.text(`Perte estimée à l'achat sur 25 ans : ${formatEuro(gainNet)}`, 25, 90);
  }

  // Section 1 : Chiffres locaux
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Données réelles du marché', 20, 110);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 113, 190, 113);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Prix moyen (${userParams.typeBien}) :`, 25, 122);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatPrice(prixM2)}`, 80, 122);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Loyer moyen :`, 120, 122);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatPrice(loyerM2)}`, 160, 122);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Taxe Foncière :`, 25, 130);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatEuro(data.taxe_fonciere_moyenne)} / an`, 80, 130);

  // Section 2 : Le Projet
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. Détail de votre projet (${surface} m²)`, 20, 145);
  doc.line(20, 148, 190, 148);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  let yP = 158;
  const drawParam = (label: string, val: string) => {
    doc.text(label, 25, yP);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(val, 120, yP);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    yP += 8;
  };

  drawParam('Prix du bien (hors frais) :', formatEuro(prixTotal));
  drawParam('Frais de notaire estimés :', formatEuro(fraisNotaire));
  drawParam(`Frais d'agence (${userParams.fraisAgence}%) :`, formatEuro(fraisAgenceEuro));
  drawParam('Apport personnel :', formatEuro(apport));
  drawParam('Montant total à financer :', formatEuro(montantEmprunte));
  drawParam(`Taux d'emprunt (sur ${userParams.dureePret} ans) :`, `${(userParams.tauxPret * 100).toFixed(2)} %`);

  yP += 6;
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yP - 5, 170, 70, 'F');
  
  yP += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Détail de la mensualité d\'achat estimée', 25, yP);
  doc.setFont('helvetica', 'normal');
  yP += 8;
  drawParam('Crédit immobilier :', `${formatEuro(mensualiteCredit)} / mois`);
  drawParam(`Assurance emprunteur (${userParams.tauxAssurance}%) :`, `${formatEuro(assuranceMensuelle)} / mois`);
  drawParam('Charges de copropriété :', `${formatEuro(chargesCoproMensuelle)} / mois`);
  drawParam('Provision taxe foncière :', `${formatEuro(taxeFonciereMensuelle)} / mois`);
  drawParam('Provision entretien / rénovation :', `${formatEuro(provisionMensuelle)} / mois`);
  
  yP += 2;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(107, 33, 168);
  doc.text('COÛT TOTAL DE L\'ACHAT :', 25, yP);
  doc.text(`${formatEuro(mensualiteTotale)} / mois`, 120, yP);
  
  yP += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Loyer équivalent estimé (avec charges) :', 25, yP);
  doc.text(`${formatEuro(loyerM2 * surface * 1.10)} / mois`, 120, yP);
  
  yP += 8;
  const diffMensuelle = mensualiteTotale - (loyerM2 * surface * 1.10);
  doc.setFont('helvetica', 'bold');
  if (diffMensuelle > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('EFFORT D\'ÉPARGNE SUPPLÉMENTAIRE :', 25, yP);
    doc.text(`+ ${formatEuro(diffMensuelle)} / mois`, 120, yP);
  } else {
    doc.setTextColor(22, 163, 74);
    doc.text('ÉCONOMIE MENSUELLE RÉALISÉE :', 25, yP);
    doc.text(`${formatEuro(Math.abs(diffMensuelle))} / mois`, 120, yP);
  }

  // --- PAGE 2 : GRAPHIQUE & SCÉNARIOS ---
  doc.addPage();
  
  // Header minimaliste page 2
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 20, 'F');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255); 
  doc.setFont('helvetica', 'bold');
  doc.text(`Kalcul.app - Rapport Financier pour ${communeName}`, 20, 13);
  
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Évolution du Patrimoine Net (avec inflation)', 20, 35);
  doc.line(20, 38, 190, 38);

  // Graphe
  const gX = 20;
  const gY = 50;
  const gWidth = 170;
  const gHeight = 90;

  doc.setFillColor(248, 250, 252);
  doc.rect(gX, gY, gWidth, gHeight, 'F');
  doc.setDrawColor(203, 213, 225);
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
    for (let i = 1; i <= 4; i++) {
      const lineY = gY + gHeight - (i * gHeight / 5);
      doc.setDrawColor(226, 232, 240);
      doc.line(gX, lineY, gX + gWidth, lineY);
      const valLabel = Math.round((maxVal * (i / 5)) / 1000) + ' k€';
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(valLabel, gX + 2, lineY - 2);
    }

    const numPoints = hist.length;
    const mapX = (idx: number) => gX + (idx / (numPoints - 1)) * gWidth;
    const mapY = (val: number) => gY + gHeight - (val / maxVal) * gHeight;

    // Courbes
    doc.setDrawColor(147, 51, 234); // Violet Acheteur
    doc.setLineWidth(1.5);
    for (let i = 0; i < numPoints - 1; i++) {
      doc.line(mapX(i), mapY(hist[i].achat), mapX(i + 1), mapY(hist[i + 1].achat));
    }
    doc.setDrawColor(59, 130, 246); // Bleu Locataire
    doc.setLineWidth(1.5);
    for (let i = 0; i < numPoints - 1; i++) {
      doc.line(mapX(i), mapY(hist[i].location), mapX(i + 1), mapY(hist[i + 1].location));
    }

    // Ligne de bascule
    if (simResult.bascule_annee) {
      const basculeIdx = Number(simResult.bascule_annee) - 1;
      if (basculeIdx >= 0 && basculeIdx <= numPoints - 1) {
        const bx = mapX(basculeIdx);
        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(0.8);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(bx, gY, bx, gY + gHeight);
        doc.setLineDashPattern([], 0);
        
        doc.setFillColor(22, 163, 74);
        doc.rect(bx - 15, gY - 6, 30, 6, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`Année ${simResult.bascule_annee}`, bx, gY - 2, { align: 'center' });
      }
    }
  }

  // Légende du graphe
  doc.setLineWidth(2);
  doc.setDrawColor(147, 51, 234);
  doc.line(70, 148, 80, 148);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Patrimoine Acheteur', 83, 149);

  doc.setDrawColor(59, 130, 246);
  doc.line(130, 148, 140, 148);
  doc.text('Épargne Locataire', 143, 149);

  // Scénarios
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Bilan selon la durée de détention', 20, 165);
  doc.line(20, 168, 190, 168);

  const getSimLine = (yearIndex: number) => hist[yearIndex] || { achat: 0, location: 0 };
  const y5 = getSimLine(4);
  const y10 = getSimLine(9);
  const y20 = getSimLine(19);

  doc.setFontSize(10);
  doc.setFillColor(241, 245, 249);
  doc.rect(20, 175, 170, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.text('Scénario de revente', 25, 182);
  doc.text('Patrimoine Acheteur', 75, 182);
  doc.text('Épargne Locataire', 120, 182);
  doc.text('Différence Nette', 160, 182);

  const drawScen = (yPos: number, label: string, dataObj: any) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, 25, yPos);
    doc.text(formatEuro(dataObj.achat), 75, yPos);
    doc.text(formatEuro(dataObj.location), 120, yPos);
    
    const diff = dataObj.achat - dataObj.location;
    doc.setFont('helvetica', 'bold');
    if (diff > 0) {
      doc.setTextColor(22, 163, 74);
      doc.text(`+ ${formatEuro(diff)}`, 160, yPos);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text(formatEuro(diff), 160, yPos);
    }
    doc.setTextColor(15, 23, 42);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, yPos + 3, 190, yPos + 3);
  };

  drawScen(195, 'Revente à 5 ans', y5);
  drawScen(205, 'Revente à 10 ans', y10);
  drawScen(215, 'Revente à 20 ans', y20);

  // Méthodologie
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('La Méthodologie Kalcul', 20, 235);
  doc.line(20, 238, 190, 238);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  const methodologyText = "Pour vous fournir une analyse d'une précision bancaire, notre moteur financier simule l'évolution de votre patrimoine mois par mois sur 25 ans.\n\n" +
    "1. Le scénario d'Achat : L'algorithme intègre votre coût global (crédit, assurance, taxe foncière, charges et provisions pour l'entretien). Votre patrimoine net augmente mécaniquement via l'amortissement du crédit et la prise de valeur du bien (inflation immobilière en intérêts composés).\n\n" +
    "2. Le scénario de Location : L'algorithme simule le paiement d'un loyer qui augmente chaque année. La force de notre modèle : la différence d'effort financier mensuel (l'économie réalisée en louant), ainsi que votre apport initial, sont virtuellement placés chaque mois sur un compte épargne générant des rendements.\n\n" +
    "3. Le point de bascule : Le résultat affiché correspond à l'année exacte où la valeur nette de votre bien à la revente dépasse définitivement le capital épargné par le locataire.";
  
  doc.text(doc.splitTextToSize(methodologyText, 170), 20, 245);

  // --- PAGE 3 : CLIMAT & AMORTISSEMENT ---
  doc.addPage();
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 20, 'F');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255); 
  doc.setFont('helvetica', 'bold');
  doc.text(`Kalcul.app - Rapport Financier pour ${communeName}`, 20, 13);

  // Loi Climat
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Risque Énergétique (Loi Climat)', 20, 35);
  doc.line(20, 38, 190, 38);

  const isRisky = ratioPassoires > 0.25;
  doc.setFillColor(isRisky ? 254 : 240, isRisky ? 226 : 253, isRisky ? 226 : 244); // Red or Green bg
  doc.rect(20, 45, 170, 30, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(isRisky ? 153 : 21, isRisky ? 27 : 128, isRisky ? 27 : 61);
  doc.text(`Proportion de biens classés F et G (Passoires) : ${(ratioPassoires * 100).toFixed(1)} %`, 25, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  if (isRisky) {
    doc.text(doc.splitTextToSize(`Risque élevé. Prévoyez systématiquement un budget rénovation (estimé ici à ${formatEuro(budgetRenoEstime)}) si le bien que vous visitez est classé G (interdit à la location en 2025).`, 160), 25, 65);
  } else {
    doc.text(doc.splitTextToSize(`Risque modéré sur cette commune. Si vous achetez une passoire, prévoyez un budget travaux estimé à ${formatEuro(budgetRenoEstime)}.`, 160), 25, 65);
  }

  // Tableau d'amortissement
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('6. Tableau d\'amortissement', 20, 90);
  doc.line(20, 93, 190, 93);

  const amortissement = calculateAmortizationSchedule(simResult.montant_emprunte, userParams.tauxPret, userParams.dureePret);

  doc.setFontSize(10);
  doc.setFillColor(15, 23, 42);
  doc.setTextColor(255, 255, 255);
  doc.rect(20, 100, 170, 8, 'F');
  doc.text('Année', 25, 105);
  doc.text('Capital Remboursé', 65, 105);
  doc.text('Intérêts Payés', 115, 105);
  doc.text('Capital Restant', 155, 105);

  let yt = 115;
  for (let i = 0; i < amortissement.length; i++) {
    const ligne = amortissement[i];
    
    // Zebra striping
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yt - 5, 170, 8, 'F');
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`${ligne.annee}`, 25, yt);
    doc.text(formatEuro(ligne.capitalRembourseAnnuel), 65, yt);
    doc.text(formatEuro(ligne.interetsAnnuels), 115, yt);
    doc.text(formatEuro(ligne.capitalRestantDu), 155, yt);
    
    yt += 8;
    if (yt > 270 && i < amortissement.length - 1) {
      doc.addPage();
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 210, 20, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255); 
      doc.setFont('helvetica', 'bold');
      doc.text(`Kalcul.app - Rapport Financier pour ${communeName}`, 20, 13);
      yt = 35;
    }
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('© 2026 Kalcul.app - Données fournies à titre indicatif et non contractuel', 105, 285, { align: 'center' });

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

    const ratioDpeFg = Number(data.ratio_dpe_fg) || 0;
    const defaultProvisionReno = ratioDpeFg > 0.3 ? 30 : 15;

    const userParams = {
      surface: Number(session.metadata?.surface) || 60,
      apport: Number(session.metadata?.apport) || 0,
      typeBien: session.metadata?.typeBien === 'maison' ? 'maison' : 'appart',
      tauxPret: session.metadata?.tauxPret ? Number(session.metadata.tauxPret) / 100 : 0.035,
      dureePret: Number(session.metadata?.dureePret) || 25,
      // Options avancees : transmises depuis les curseurs du simulateur via les metadata
      // Stripe (checkout/route.ts). Sans elles, le rapport recalculait avec les valeurs par
      // defaut du moteur au lieu de ce que le client avait reellement configure et paye.
      tauxAssurance: session.metadata?.tauxAssurance !== undefined && session.metadata.tauxAssurance !== ''
        ? Number(session.metadata.tauxAssurance) : 0.3,
      fraisAgence: session.metadata?.fraisAgence !== undefined && session.metadata.fraisAgence !== ''
        ? Number(session.metadata.fraisAgence) : 0,
      chargesCopro: session.metadata?.chargesCopro !== undefined && session.metadata.chargesCopro !== ''
        ? Number(session.metadata.chargesCopro) : 25,
      provisionReno: session.metadata?.provisionReno !== undefined && session.metadata.provisionReno !== ''
        ? Number(session.metadata.provisionReno) : defaultProvisionReno,
    };

    // Simulate using the calculator (respecte le type de bien choisi par l'utilisateur,
    // pas toujours "appartement")
    const simParams = {
      prix_m2: Number(userParams.typeBien === 'appart' ? data.prix_m2_appart_moyen : data.prix_m2_maison_moyen) || 0,
      loyer_m2: Number(userParams.typeBien === 'appart' ? data.loyer_m2_appart_moyen : data.loyer_m2_maison_moyen) || 0,
      taxe_fonciere_annuelle: Number(data.taxe_fonciere_moyenne) || 0,
      ratio_dpe_fg: ratioDpeFg,
      surface: userParams.surface,
      apport: userParams.apport,
      taux_pret: userParams.tauxPret,
      duree_pret_annees: userParams.dureePret,
      taux_assurance: userParams.tauxAssurance / 100,
      frais_agence_taux: userParams.fraisAgence / 100,
      charges_copro_m2_an: userParams.chargesCopro,
      provision_renovation_m2_an: userParams.provisionReno,
    };

    const simResult = simulateBuyVsRent(simParams);

    // 3. Generate the PDF
    const pdfBuffer = generatePDFBuffer(communeName, codeInsee || '', data, simResult, userParams);

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
