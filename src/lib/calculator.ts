// ATTENTION : Ce moteur financier est implémenté en parallèle en Python dans `src/engine/calculator.py`.
// Toute modification ici DOIT être répercutée dans la version Python pour éviter une divergence des calculs.

export function calculateMonthlyMortgage(principal: number, annualRate: number, years: number): number {
  if (principal <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);
  
  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
}

export function calculateLoanCapacity(monthlyPayment: number, annualRate: number, years: number): number {
  if (monthlyPayment <= 0) return 0;
  if (annualRate === 0) return monthlyPayment * years * 12;

  const monthlyRate = annualRate / 12;
  const numPayments = years * 12;
  return monthlyPayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
}

export function calculateAmortizationSchedule(montantEmprunte: number, tauxPret: number, dureePret: number) {
  const schedule: { annee: number; capitalRestantDu: number; interetsAnnuels: number; capitalRembourseAnnuel: number }[] = [];
  if (montantEmprunte <= 0 || dureePret <= 0) return schedule;
  
  const mensualite = calculateMonthlyMortgage(montantEmprunte, tauxPret, dureePret);
  const tauxMensuel = tauxPret / 12;
  let capitalRestant = montantEmprunte;
  
  for (let annee = 1; annee <= dureePret; annee++) {
    let interetsAnnuels = 0;
    let capitalRembourseAnnuel = 0;
    
    for (let mois = 1; mois <= 12; mois++) {
      const interetsDuMois = capitalRestant * tauxMensuel;
      const amortissement = mensualite - interetsDuMois;
      capitalRestant -= amortissement;
      interetsAnnuels += interetsDuMois;
      capitalRembourseAnnuel += amortissement;
    }
    
    schedule.push({
      annee,
      capitalRestantDu: Math.max(0, capitalRestant),
      interetsAnnuels,
      capitalRembourseAnnuel
    });
  }
  return schedule;
}

export interface SimulationParams {
  // Database mock inputs
  prix_m2: number;
  loyer_m2: number;
  taxe_fonciere_annuelle: number;
  ratio_dpe_fg: number;

  // User inputs
  surface: number;
  apport: number;
  
  // Constants/Defaults
  taux_pret?: number;
  duree_pret_annees?: number;
  taux_assurance?: number;
  rendement_epargne?: number;
  inflation_immo?: number;
  inflation_loyer?: number;
  charges_copro_m2_an?: number;
  frais_notaire_taux?: number;
  frais_agence_taux?: number;
  provision_renovation_m2_an?: number;
  duree_projection_annees?: number;
}

export function simulateBuyVsRent(params: SimulationParams) {
  const {
    prix_m2, loyer_m2, taxe_fonciere_annuelle, ratio_dpe_fg,
    surface, apport,
    taux_pret = 0.035,
    duree_pret_annees = 25,
    taux_assurance = 0.003,
    rendement_epargne = 0.03,
    inflation_immo = 0.01,
    inflation_loyer = 0.015,
    charges_copro_m2_an = 25.0,
    frais_notaire_taux = 0.08,
    frais_agence_taux = 0.0,
    provision_renovation_m2_an,
    duree_projection_annees = 25
  } = params;

  // Buying initial costs
  const coutAcquisition = prix_m2 * surface;
  const fraisNotaire = coutAcquisition * frais_notaire_taux;
  const fraisAgence = coutAcquisition * frais_agence_taux;
  const coutTotalProjet = coutAcquisition + fraisNotaire + fraisAgence;

  const montantEmprunte = Math.max(0, coutTotalProjet - apport);
  const mensualiteCredit = calculateMonthlyMortgage(montantEmprunte, taux_pret, duree_pret_annees);
  const assuranceMensuelle = (montantEmprunte * taux_assurance) / 12;
  
  // Provision DPE
  const provisionRenovationM2An = provision_renovation_m2_an !== undefined ? provision_renovation_m2_an : (ratio_dpe_fg > 0.3 ? 30.0 : 15.0);
  const provisionRenovationMensuelle = (provisionRenovationM2An * surface) / 12;

  const chargesCoproMensuelle = (charges_copro_m2_an * surface) / 12;
  const taxeFonciereMensuelle = taxe_fonciere_annuelle / 12;

  // Renting initial costs
  let loyerMensuelActuel = loyer_m2 * surface;
  let capitalEpargne = apport;

  const dureeMois = duree_projection_annees * 12;
  let capitalRestantDu = montantEmprunte;
  const tauxMensuelCredit = taux_pret / 12;
  const tauxMensuelEpargne = rendement_epargne / 12;
  const tauxMensuelInflationImmo = inflation_immo / 12;
  
  let valeurBien = coutAcquisition;
  
  const history = [];
  let basculeMois = -1;

  for (let mois = 1; mois <= dureeMois; mois++) {
    let mensualiteTotaleBanque = 0;
    
    if (mois <= duree_pret_annees * 12) {
      const interetsDuMois = capitalRestantDu * tauxMensuelCredit;
      const amortissement = mensualiteCredit - interetsDuMois;
      capitalRestantDu -= amortissement;
      mensualiteTotaleBanque = mensualiteCredit + assuranceMensuelle;
    }

    const depenseMensuelleAchat = mensualiteTotaleBanque + taxeFonciereMensuelle + chargesCoproMensuelle + provisionRenovationMensuelle;
    const depenseMensuelleLocation = loyerMensuelActuel * 1.10; // +10% for charges

    const diff = depenseMensuelleAchat - depenseMensuelleLocation;

    if (diff > 0) {
      capitalEpargne += diff; // Renter saves the difference
    }

    capitalEpargne *= (1 + tauxMensuelEpargne);
    valeurBien *= (1 + tauxMensuelInflationImmo);

    if (mois % 12 === 0) {
      loyerMensuelActuel *= (1 + inflation_loyer);
    }

    const patrimoineNetAchat = valeurBien - Math.max(0, capitalRestantDu);
    const patrimoineNetLocation = capitalEpargne;

    if (basculeMois === -1 && patrimoineNetAchat > patrimoineNetLocation) {
      basculeMois = mois;
    }

    // Capture annual data points for the graph (or monthly if needed, but annual is lighter)
    if (mois % 12 === 0) {
      history.push({
        year: mois / 12,
        achat: Math.round(patrimoineNetAchat),
        location: Math.round(patrimoineNetLocation),
      });
    }
  }

  return {
    bascule_annee: basculeMois !== -1 ? (basculeMois / 12).toFixed(1) : null,
    mensualite_banque_estimee: Math.round(mensualiteCredit + assuranceMensuelle),
    montant_emprunte: montantEmprunte,
    history
  };
}

/**
 * Calcul de l'impôt sur la plus-value immobilière des particuliers (France - CGI Art. 150 U).
 * - Frais d'acquisition retenus : prix de marché + frais de notaire réels (8%).
 * - Abattement IR (19%) : 6%/an de la 6e à la 21e année, 4% la 22e (exonération à 22 ans).
 * - Abattement PS (17.2%) : 1.65%/an de la 6e à la 21e année, 1.60% la 22e, 9%/an de la 23e à la 30e (exonération à 30 ans).
 */
export function calculateFrenchCapitalGainsTax(plusValueBrute: number, years: number): number {
  if (plusValueBrute <= 0) return 0;

  // Abattement IR (Impôt sur le revenu : 19%)
  let abattementIR = 0;
  if (years > 5 && years <= 21) {
    abattementIR = (years - 5) * 0.06;
  } else if (years === 22) {
    abattementIR = 16 * 0.06 + 0.04; // 100%
  } else if (years > 22) {
    abattementIR = 1.0;
  }

  // Abattement PS (Prélèvements sociaux : 17.2%)
  let abattementPS = 0;
  if (years > 5 && years <= 21) {
    abattementPS = (years - 5) * 0.0165;
  } else if (years === 22) {
    abattementPS = 16 * 0.0165 + 0.0160; // 28%
  } else if (years > 22 && years <= 30) {
    abattementPS = 0.28 + (years - 22) * 0.09;
    if (abattementPS > 1.0) abattementPS = 1.0;
  } else if (years > 30) {
    abattementPS = 1.0;
  }

  const baseIR = plusValueBrute * (1 - Math.min(1, abattementIR));
  const basePS = plusValueBrute * (1 - Math.min(1, abattementPS));

  return Math.round(baseIR * 0.19 + basePS * 0.172);
}

export interface VenteATermeParams {
  prix_marche: number;
  surface: number;
  loyer_m2: number;
  taxe_fonciere_annuelle: number;
  bouquet_pct?: number; // Défaut 0.20 (20%)
  duree_terme_annees: number;
  duree_detention_annees: number;
  inflation_immo?: number; // Défaut 0.02 (2%/an)
  inflation_loyer?: number; // Défaut 0.015 (1.5%/an)
  charges_copro_m2_an?: number; // Défaut 25 €/m²/an
}

/**
 * Modélisation d'une VRAIE Vente à Terme Libre côté Investisseur (Sans prêt bancaire).
 * 
 * Mécanique :
 * 1. Mois 0 : Paiement du Bouquet (prix_marche * bouquet_pct) + Frais de notaire (8% sur la valeur totale).
 * 2. Mois 1 à duree_terme*12 : Versement d'une rente mensuelle FIXE sans intérêt au vendeur = (prix_marche - bouquet) / (duree_terme * 12).
 * 3. Mois 1 à duree_detention*12 : Perception du loyer net (0.93 des loyers bruts) dès le jour 1 (VAT Libre), moins les charges propriétaires.
 * 4. Revente (dernier mois) : Revente au prix valorisé par l'inflation. Solde de la rente si revente avant le terme,
 *    déduction des frais d'agence de revente (5%) et déduction de l'impôt sur la plus-value immobilière française (IR + PS avec abattements).
 */
export function simulateVenteATerme(params: VenteATermeParams) {
  const {
    prix_marche,
    surface,
    loyer_m2,
    taxe_fonciere_annuelle,
    bouquet_pct = 0.20,
    duree_terme_annees,
    duree_detention_annees,
    inflation_immo = 0.02,
    inflation_loyer = 0.015,
    charges_copro_m2_an = 25.0,
  } = params;

  // 1. Sortie initiale (Mois 0)
  const bouquet = prix_marche * bouquet_pct;
  const fraisNotaire = prix_marche * 0.08; // 8% calculés sur la valeur totale du bien
  const cashflowMois0 = -(bouquet + fraisNotaire);

  // 2. Rente mensuelle fixe sans intérêt sur le terme
  const capitalRenteInitial = Math.max(0, prix_marche - bouquet);
  const totalMoisTerme = Math.max(1, duree_terme_annees * 12);
  const renteMensuelle = capitalRenteInitial / totalMoisTerme;

  // 3. Charges mensuelles fixes propriétaires (Taxe foncière + Copropriété)
  const chargesMensuellesFixes = (taxe_fonciere_annuelle / 12) + ((charges_copro_m2_an * surface) / 12);

  // 4. Flux mensuels
  let totalLoyersPercus = 0.0;
  let loyerMensuelCourant = loyer_m2 * surface;
  let valeurBien = prix_marche;
  const moisDetentionTotal = Math.max(1, duree_detention_annees * 12);
  const tauxMensuelInflationImmo = inflation_immo / 12;

  const cashflows: number[] = [cashflowMois0];

  for (let mois = 1; mois <= moisDetentionTotal; mois++) {
    valeurBien *= (1 + tauxMensuelInflationImmo);

    // Loyer net (7% de retenue pour frais de gestion & impayés)
    const loyerMensuelNet = loyerMensuelCourant * 0.93;
    totalLoyersPercus += loyerMensuelNet;

    // Rente due tant que mois <= terme
    const renteDue = (mois <= totalMoisTerme) ? renteMensuelle : 0;

    // Cashflow mensuel = Loyer Net - Rente - Charges Fixes
    const cf = loyerMensuelNet - renteDue - chargesMensuellesFixes;
    cashflows.push(cf);

    // Indexation annuelle des loyers
    if (mois % 12 === 0) {
      loyerMensuelCourant *= (1 + inflation_loyer);
    }
  }

  // 5. Revente à la fin de la période de détention
  const valeurBienFinale = valeurBien;

  // Solde du capital de rente restant dû si revente avant la fin du terme
  let capitalRenteRestantDu = 0;
  if (duree_detention_annees < duree_terme_annees) {
    const moisRestantsTerme = (duree_terme_annees - duree_detention_annees) * 12;
    capitalRenteRestantDu = renteMensuelle * moisRestantsTerme;
  }

  // Coûts de sortie de revente
  const fraisAgenceRevente = valeurBienFinale * 0.05; // 5% frais d'agence
  const plusValueBrute = Math.max(0, valeurBienFinale - (prix_marche + fraisNotaire));
  const impotPlusValue = calculateFrenchCapitalGainsTax(plusValueBrute, duree_detention_annees);

  // Cashflow net de sortie
  const cashflowReventeNette = valeurBienFinale - capitalRenteRestantDu - fraisAgenceRevente - impotPlusValue;
  cashflows[cashflows.length - 1] += cashflowReventeNette;

  // 6. Solveur TRI Robuste (Newton-Raphson avec repli par bissection)
  const npv = (rate: number) => {
    if (rate <= -0.99) return Infinity;
    return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i / 12), 0);
  };

  let rGuess = 0.05;
  let converged = false;

  for (let iter = 0; iter < 100; iter++) {
    const f = npv(rGuess);
    if (Math.abs(f) < 0.01) {
      converged = true;
      break;
    }
    const fPrime = cashflows.reduce((acc, cf, i) => {
      if (i === 0) return acc;
      const base = 1 + rGuess;
      if (base <= 0.01) return acc;
      return acc + (-i / 12) * cf / Math.pow(base, i / 12 + 1);
    }, 0);

    if (Math.abs(fPrime) < 1e-12) break;
    const nextGuess = rGuess - f / fPrime;
    if (isNaN(nextGuess) || nextGuess <= -0.99 || nextGuess > 5.0) break;
    rGuess = nextGuess;
  }

  // Repli par Bissection si Newton diverge ou renvoie NaN/Inf
  if (!converged || isNaN(rGuess) || rGuess <= -0.99 || !isFinite(rGuess)) {
    let low = -0.90;
    let high = 1.00;
    let mid = 0.05;
    for (let i = 0; i < 60; i++) {
      mid = (low + high) / 2;
      const fMid = npv(mid);
      if (Math.abs(fMid) < 0.01) break;
      const fLow = npv(low);
      if ((fLow > 0 && fMid > 0) || (fLow < 0 && fMid < 0)) {
        low = mid;
      } else {
        high = mid;
      }
    }
    rGuess = mid;
  }

  if (isNaN(rGuess) || !isFinite(rGuess)) {
    rGuess = 0;
  }

  const gainNet = cashflows.reduce((acc, cf) => acc + cf, 0);

  return {
    prix_marche: Math.round(prix_marche),
    prix_achat: Math.round(prix_marche),
    bouquet: Math.round(bouquet),
    rente_mensuelle: Math.round(renteMensuelle),
    total_loyers_percus: Math.round(totalLoyersPercus),
    valeur_bien_finale: Math.round(valeurBienFinale),
    capital_rente_restant_du: Math.round(capitalRenteRestantDu),
    frais_agence_revente: Math.round(fraisAgenceRevente),
    impot_plus_value: Math.round(impotPlusValue),
    gain_net: Math.round(gainNet),
    gain_net_annuel: Math.round(gainNet / duree_detention_annees),
    tri_annualise_pct: Math.round(rGuess * 10000) / 100,
    duree_terme_annees,
    duree_detention_annees,
  };
}
