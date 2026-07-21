import Link from "next/link";
import { CheckCircle2, Download, Home } from "lucide-react";

export default function PaiementReussiPage({
  searchParams,
}: {
  searchParams: { session_id?: string; code?: string };
}) {
  const { session_id, code } = searchParams;

  if (!session_id) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Session invalide</h1>
        <p className="text-slate-400 mb-8">Aucun paiement détecté.</p>
        <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-500 transition-colors">
          Retour à l'accueil
        </Link>
      </main>
    );
  }

  // The download URL points to our protected API route
  const downloadUrl = `/api/report?session_id=${session_id}`;

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-purple-500/30">
      <div className="bg-slate-900 border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
        
        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 relative z-10">Paiement Réussi !</h1>
        <p className="text-slate-400 mb-8 relative z-10">
          Merci pour votre confiance. Votre rapport financier détaillé est prêt.
        </p>

        <div className="space-y-4 relative z-10">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-4 rounded-xl transition-colors"
          >
            <Download size={20} />
            Télécharger mon rapport PDF
          </a>
          
          <Link
            href={code ? `/acheter-ou-louer/${code}` : "/"}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/5 text-white font-medium px-6 py-4 rounded-xl transition-colors"
          >
            <Home size={20} />
            Retour à l'analyse
          </Link>
        </div>
      </div>
    </main>
  );
}
