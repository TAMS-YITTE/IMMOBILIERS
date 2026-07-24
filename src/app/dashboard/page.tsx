"use client"

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, Building2, Calendar, MapPin, Trash2, ArrowRight } from 'lucide-react';

interface SavedSimulation {
  id: string;
  code_insee: string;
  commune_name: string;
  type_bien: 'appart' | 'maison';
  surface: number;
  apport: number;
  taux_pret: number;
  duree_pret: number;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);

  useEffect(() => {
    // Authentication Check
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSimulations(session.user.id);
      } else {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSimulations(session.user.id);
      } else {
        setSimulations([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSimulations = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_simulations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSimulations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSimulation = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette sauvegarde ?")) return;
    try {
      const { error } = await supabase
        .from('saved_simulations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSimulations(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-purple-600">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Accès Refusé</h1>
        <p className="text-slate-600 mb-8 max-w-md">Vous devez être connecté pour accéder à votre tableau de bord.</p>
        <a href="/" className="bg-purple-600 text-white px-6 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-jakarta">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-600 transition-colors text-sm font-medium mb-4">
              <ArrowLeft size={16} /> Retour au simulateur
            </a>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Mon Espace Personnel</h1>
            <p className="text-slate-600 mt-2">Connecté en tant que <strong className="text-slate-800">{user.email}</strong></p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="text-sm font-medium bg-white border border-slate-200 px-5 py-2.5 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
          >
            Se déconnecter
          </button>
        </div>

        {/* List */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Building2 className="text-purple-600" /> Mes simulations sauvegardées
          </h2>

          {simulations.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <p className="text-slate-500 mb-4">Vous n'avez pas encore sauvegardé de simulation.</p>
              <a href="/" className="inline-flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700">
                Lancer une simulation <ArrowRight size={16} />
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations.map((sim) => (
                <div key={sim.id} className="group bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-purple-300 hover:shadow-md transition-all relative">
                  <button 
                    onClick={() => deleteSimulation(sim.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-white p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-lg mb-4">
                    <MapPin size={20} />
                    {sim.commune_name}
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-6">
                    <p><strong>Bien :</strong> {sim.type_bien === 'appart' ? 'Appartement' : 'Maison'} ({sim.surface} m²)</p>
                    <p><strong>Apport :</strong> {sim.apport.toLocaleString()} €</p>
                    <p><strong>Taux :</strong> {sim.taux_pret.toFixed(2)} % sur {sim.duree_pret} ans</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={12} />
                      {new Date(sim.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <a 
                      href={`/acheter-ou-louer/${sim.code_insee}?surface=${sim.surface}&apport=${sim.apport}&taux=${sim.taux_pret}&duree=${sim.duree_pret}`}
                      className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      Reprendre <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
