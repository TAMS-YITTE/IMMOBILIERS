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
    duree_projection_annees = 25
  } = params;

  // Buying initial costs
  const coutAcquisition = prix_m2 * surface;
  const fraisNotaire = coutAcquisition * frais_notaire_taux;
  const coutTotalProjet = coutAcquisition + fraisNotaire;

  const montantEmprunte = Math.max(0, coutTotalProjet - apport);
  const mensualiteCredit = calculateMonthlyMortgage(montantEmprunte, taux_pret, duree_pret_annees);
  const assuranceMensuelle = (montantEmprunte * taux_assurance) / 12;
  
  // Provision DPE
  const provisionRenovationM2An = ratio_dpe_fg > 0.3 ? 30.0 : 15.0;
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
