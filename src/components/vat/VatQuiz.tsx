"use client"

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Home, UserCheck, HelpCircle, CheckCircle2 } from 'lucide-react';

type QuizStep = 'ROLE' | 'BUYER_BANK' | 'SELLER_TIME' | 'RESULT_BUYER' | 'RESULT_SELLER' | 'RESULT_INFO';

export default function VatQuiz() {
  const [step, setStep] = useState<QuizStep>('ROLE');
  
  // States
  const [role, setRole] = useState<'ACHETEUR' | 'VENDEUR' | 'CURIEUX' | null>(null);
  
  const handleRole = (r: 'ACHETEUR' | 'VENDEUR' | 'CURIEUX') => {
    setRole(r);
    if (r === 'ACHETEUR') setStep('BUYER_BANK');
    if (r === 'VENDEUR') setStep('SELLER_TIME');
    if (r === 'CURIEUX') setStep('RESULT_INFO');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white rounded-3xl shadow-2xl border border-slate-100">
      
      {/* HEADER / PROGRESS */}
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => {
            if (step === 'BUYER_BANK' || step === 'SELLER_TIME' || step === 'RESULT_INFO') setStep('ROLE');
            else if (step === 'RESULT_BUYER') setStep('BUYER_BANK');
            else if (step === 'RESULT_SELLER') setStep('SELLER_TIME');
          }}
          className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${step === 'ROLE' ? 'invisible' : ''}`}
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </button>
        <div className="flex gap-1">
          <div className="w-8 h-2 rounded-full bg-indigo-600"></div>
          <div className={`w-8 h-2 rounded-full transition-colors ${step !== 'ROLE' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
          <div className={`w-8 h-2 rounded-full transition-colors ${step.startsWith('RESULT') ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* STEP 1: ROLE */}
      {step === 'ROLE' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8">
            Quel est votre objectif aujourd'hui ?
          </h2>
          <div className="space-y-4">
            <button 
              onClick={() => handleRole('ACHETEUR')}
              className="w-full p-6 text-left border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-2xl transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Je veux acheter</h3>
                  <p className="text-slate-500 text-sm">Je cherche à acquérir un bien immobilier</p>
                </div>
              </div>
              <ArrowRight className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </button>

            <button 
              onClick={() => handleRole('VENDEUR')}
              className="w-full p-6 text-left border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 rounded-2xl transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 text-amber-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Home size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Je veux vendre</h3>
                  <p className="text-slate-500 text-sm">J'ai un bien à vendre et je cherche des solutions</p>
                </div>
              </div>
              <ArrowRight className="text-slate-400 group-hover:text-amber-600 transition-colors" />
            </button>

            <button 
              onClick={() => handleRole('CURIEUX')}
              className="w-full p-6 text-left border-2 border-slate-200 hover:border-slate-500 hover:bg-slate-50 rounded-2xl transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 text-slate-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Je me renseigne</h3>
                  <p className="text-slate-500 text-sm">Je veux juste comprendre ce qu'est la Vente à Terme</p>
                </div>
              </div>
              <ArrowRight className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ACHETEUR */}
      {step === 'BUYER_BANK' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8">
            Quelle est votre situation avec les banques ?
          </h2>
          <div className="space-y-4">
            <button 
              onClick={() => setStep('RESULT_BUYER')}
              className="w-full p-5 text-left border-2 border-slate-200 hover:border-red-400 hover:bg-red-50 rounded-xl transition-all"
            >
              <h3 className="font-bold text-slate-800 text-lg">J'ai essuyé un refus</h3>
              <p className="text-slate-500 text-sm">Mon dossier ne passe pas (taux d'usure, endettement...)</p>
            </button>
            <button 
              onClick={() => setStep('RESULT_BUYER')}
              className="w-full p-5 text-left border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50 rounded-xl transition-all"
            >
              <h3 className="font-bold text-slate-800 text-lg">Je crains un refus</h3>
              <p className="text-slate-500 text-sm">Je suis indépendant ou mon profil est atypique</p>
            </button>
            <button 
              onClick={() => setStep('RESULT_BUYER')}
              className="w-full p-5 text-left border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all"
            >
              <h3 className="font-bold text-slate-800 text-lg">Tout va bien</h3>
              <p className="text-slate-500 text-sm">Je peux avoir un crédit mais je cherche une alternative éthique</p>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VENDEUR */}
      {step === 'SELLER_TIME' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8">
            Depuis combien de temps votre bien est-il en vente ?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setStep('RESULT_SELLER')} className="p-6 text-center border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 rounded-xl transition-all">
              <span className="block text-2xl mb-2 font-bold text-slate-700">Pas encore</span>
              <span className="text-sm text-slate-500">Je commence</span>
            </button>
            <button onClick={() => setStep('RESULT_SELLER')} className="p-6 text-center border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 rounded-xl transition-all">
              <span className="block text-2xl mb-2 font-bold text-slate-700">&lt; 3 mois</span>
              <span className="text-sm text-slate-500">Récent</span>
            </button>
            <button onClick={() => setStep('RESULT_SELLER')} className="p-6 text-center border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 rounded-xl transition-all">
              <span className="block text-2xl mb-2 font-bold text-slate-700">3 à 6 mois</span>
              <span className="text-sm text-slate-500">Ça stagne</span>
            </button>
            <button onClick={() => setStep('RESULT_SELLER')} className="p-6 text-center border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50 rounded-xl transition-all">
              <span className="block text-2xl mb-2 font-bold text-red-500">&gt; 6 mois</span>
              <span className="text-sm text-slate-500">C'est bloqué</span>
            </button>
          </div>
        </div>
      )}

      {/* RESULT: ACHETEUR */}
      {step === 'RESULT_BUYER' && (
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">La Vente à Terme est faite pour vous !</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Sans banque, c'est votre capacité d'épargne qui compte. Découvrez immédiatement quel budget vous pouvez allouer à votre futur bien.
          </p>
          <div className="flex flex-col gap-4">
            <a href="/vente-a-terme/capacite-achat" className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
              Calculer ma capacité d'achat "Sans Banque"
            </a>
            <a href="/vente-a-terme/comparateur" className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              Comparer avec un crédit classique
            </a>
          </div>
        </div>
      )}

      {/* RESULT: VENDEUR */}
      {step === 'RESULT_SELLER' && (
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Ne bradez pas votre bien.</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Au lieu d'accepter des offres au rabais, la Vente à Terme peut vous permettre de vendre au prix fort tout en percevant une rente régulière, sécurisée par acte notarié.
          </p>
          <a href="/vente-a-terme/vendeur" className="block px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
            Simuler la vente de mon bien
          </a>
        </div>
      )}

      {/* RESULT: CURIEUX */}
      {step === 'RESULT_INFO' && (
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Comprendre la Vente à Terme</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            La meilleure façon de comprendre est de comparer la VAT avec un système que vous connaissez déjà : le viager (qui est pourtant très différent !).
          </p>
          <a href="/vente-a-terme/viager" className="block px-6 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors">
            Voir le comparatif (VAT vs Viager)
          </a>
        </div>
      )}

    </div>
  );
}
