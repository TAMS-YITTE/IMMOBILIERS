"use client"

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, X, Mail, CheckCircle2 } from 'lucide-react';

export interface VatLeadContext {
  budget?: number;          // acheteur : prix accessible ; vendeur : prix souhaité
  bouquet?: number;
  renteMensuelle?: number;
  duree?: number;
}

interface VatLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'acheteur' | 'vendeur';
  source: string;           // outil d'origine (capacite-achat, vendeur, comparateur)
  context: VatLeadContext;
  title?: string;
  subtitle?: string;
}

export default function VatLeadModal({
  isOpen,
  onClose,
  role,
  source,
  context,
  title,
  subtitle,
}: VatLeadModalProps) {
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    if (honeypot.trim() !== '') { setSuccess(true); return; } // rejet silencieux des bots
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('vat_leads').insert({
        email,
        telephone: telephone || null,
        role,
        source,
        budget: context.budget ?? null,
        bouquet: context.bouquet ?? null,
        rente_mensuelle: context.renteMensuelle ?? null,
        duree: context.duree ?? null,
        consentement: consent,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Erreur envoi lead VAT:', err);
      setErrorMsg("Une erreur est survenue. Réessayez ou écrivez à contact@kalcul.app.");
    } finally {
      setSubmitting(false);
    }
  };

  const defaultTitle = role === 'acheteur' ? 'Restez informé des opportunités' : 'Faites-vous accompagner';
  const defaultSubtitle =
    role === 'acheteur'
      ? "Laissez votre email : nous vous prévenons dès qu'un bien en Vente à Terme compatible avec votre budget se présente."
      : "Laissez vos coordonnées : nous vous accompagnons pour préparer et sécuriser votre Vente à Terme.";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">C&apos;est enregistré !</h3>
            <p className="text-slate-600">
              Merci, nous vous recontacterons à <strong>{email}</strong> dès que nous aurons du nouveau pour votre projet.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{title || defaultTitle}</h3>
              <p className="text-slate-600 mt-2 text-sm">{subtitle || defaultSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Honeypot anti-bot */}
              <input
                type="text"
                name="company_url"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="opacity-0 absolute -z-10 h-0 w-0 pointer-events-none"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="vous@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  id="vat-consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 accent-indigo-600 w-4 h-4"
                />
                <label htmlFor="vat-consent" className="text-xs text-slate-600 leading-tight">
                  J&apos;accepte d&apos;être recontacté(e) au sujet de mon projet de Vente à Terme. Mes données ne sont pas revendues à des tiers sans mon accord.
                </label>
              </div>

              {errorMsg && <p className="text-red-600 text-xs text-center">{errorMsg}</p>}

              <button
                type="submit"
                disabled={submitting || !consent || !email}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:shadow-lg text-white font-medium rounded-xl py-3 mt-2 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Valider ma demande'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
