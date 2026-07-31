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

export interface VenteATermeParams {
  prix_marche: number;
  loyer_m2: number;
  surface: number;
  taxe_fonciere_annuelle: number;
  duree_terme_annees: number;
  decote_pct?: number;
  apport?: number;
  taux_pret?: number;
  duree_pret_annees?: number;
  taux_assurance?: number;
  inflation_immo?: number;
  inflation_loyer?: number;
  charges_copro_m2_an?: number;
  duree_detention_annees?: number;
}

export function simulateVenteATerme(params: VenteATermeParams) {
  const {
    prix_marche,
    loyer_m2,
    surface,
    taxe_fonciere_annuelle,
    duree_terme_annees,
    decote_pct = 0.0,
    apport = 0,
    taux_pret = 0.035,
    duree_pret_annees = 25,
    taux_assurance = 0.003,
    inflation_immo = 0.02,
    inflation_loyer = 0.015,
    charges_copro_m2_an = 25.0,
    duree_detention_annees = 20,
  } = params;

  const prixAchat = prix_marche * (1 - decote_pct);
  const fraisNotaire = prixAchat * 0.08;
  const coutTotal = prixAchat + fraisNotaire;
  const montantEmprunte = Math.max(0, coutTotal - apport);
  const mensualite = calculateMonthlyMortgage(montantEmprunte, taux_pret, duree_pret_annees);
  const assuranceMensuelle = (montantEmprunte * taux_assurance) / 12;
  const chargeMensuelle = mensualite + assuranceMensuelle + (taxe_fonciere_annuelle / 12) + ((charges_copro_m2_an * surface) / 12);

  let capitalRestant = montantEmprunte;
  let loyerMensuel = 0.0;
  let valeurBien = prix_marche;
  let totalLoyersPercus = 0.0;
  const moisTotal = duree_detention_annees * 12;
  const tauxMensuelPret = taux_pret / 12;
  const tauxMensuelInflationImmo = inflation_immo / 12;

  const cashflows: number[] = [-apport]; // Mois 0: apport initial

  for (let mois = 1; mois <= moisTotal; mois++) {
    if (mois <= duree_pret_annees * 12) {
      const interets = capitalRestant * tauxMensuelPret;
      capitalRestant -= (mensualite - interets);
    }

    valeurBien *= (1 + tauxMensuelInflationImmo);

    if (mois > duree_terme_annees * 12) {
      if (mois === duree_terme_annees * 12 + 1) {
        loyerMensuel = loyer_m2 * surface;
      }
      const loyerMensuelNet = loyerMensuel * 0.93;
      totalLoyersPercus += loyerMensuelNet;
      cashflows.push(loyerMensuelNet - chargeMensuelle);

      if (mois % 12 === 0) {
        loyerMensuel *= (1 + inflation_loyer);
      }
    } else {
      cashflows.push(-chargeMensuelle);
    }
  }

  // Revente finale
  const patrimoineFinal = valeurBien - Math.max(0, capitalRestant);
  cashflows[cashflows.length - 1] += patrimoineFinal;

  // Calcul du TRI par Newton-Raphson
  const npv = (rate: number) => {
    return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i / 12), 0);
  };

  let rGuess = 0.04;
  for (let iter = 0; iter < 80; iter++) {
    const f = npv(rGuess);
    if (Math.abs(f) < 0.01) break;
    const fPrime = cashflows.reduce((acc, cf, i) => {
      if (i === 0) return acc;
      return acc + (-i / 12) * cf / Math.pow(1 + rGuess, i / 12 + 1);
    }, 0);
    rGuess -= f / (fPrime || 1e-9);
  }

  const gainNet = patrimoineFinal - apport - (chargeMensuelle * duree_terme_annees * 12);

  return {
    prix_achat: Math.round(prixAchat),
    decote_appliquee_pct: Math.round(decote_pct * 1000) / 10,
    valeur_bien_finale: Math.round(valeurBien),
    patrimoine_net_final: Math.round(patrimoineFinal),
    gain_net: Math.round(gainNet),
    tri_annualise_pct: Math.round(rGuess * 10000) / 100,
    total_loyers_percus: Math.round(totalLoyersPercus),
    capital_restant_du_final: Math.round(Math.max(0, capitalRestant)),
    prix_marche_initial: Math.round(prix_marche),
  };
}
