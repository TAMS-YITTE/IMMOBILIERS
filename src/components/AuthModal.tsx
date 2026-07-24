"use client"

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, X, Mail, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose,
  title = "Créez votre compte",
  subtitle = "Sauvegardez vos simulations et retrouvez-les sur tous vos appareils."
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // The redirect URL where the user lands after clicking the magic link
          // Vercel auto-populates NEXT_PUBLIC_SITE_URL or we fallback to window.location.origin
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : 'https://kalcul.app',
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Vérifiez vos e-mails</h3>
            <p className="text-slate-600 mb-6">
              Nous venons de vous envoyer un "Lien Magique" à <strong>{email}</strong>. Cliquez dessus pour vous connecter instantanément, sans mot de passe !
            </p>
            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
              <p className="text-slate-600 mt-2 text-sm">{subtitle}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Votre adresse E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="vous@email.com"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:shadow-[0_0_20px_theme(colors.purple.400/50%)] text-white font-medium rounded-xl py-3 mt-4 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Recevoir mon lien de connexion"}
              </button>

              <p className="text-xs text-center text-slate-500 mt-4">
                En vous connectant, vous acceptez nos conditions d'utilisation. Aucun mot de passe n'est requis.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
