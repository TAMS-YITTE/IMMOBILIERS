import Link from "next/link";
import { CheckCircle2, Download, Home } from "lucide-react";

export default async function PaiementReussiPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; code?: string }>;
}) {
  const resolvedParams = await searchParams;
  const { session_id, code } = resolvedParams;

  if (!session_id) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Session invalide</h1>
        <p className="text-slate-500 mb-8">Aucun paiement détecté.</p>
        <Link href="/" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white rounded-full font-medium hover:shadow-[0_0_20px_theme(colors.purple.400/50%)] transition-all duration-150">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  // The download URL points to our protected API route
  const downloadUrl = `/api/report?session_id=${session_id}`;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-purple-200">
      <div className="bg-white border border-slate-200 p-8 md:p-12 rounded-3xl shadow-lg max-w-lg w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-50 to-transparent pointer-events-none" />

        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
          <CheckCircle2 size={40} />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4 relative z-10">Paiement Réussi !</h1>
        <p className="text-slate-500 mb-8 relative z-10">
          Merci pour votre confiance. Votre rapport financier détaillé est prêt.
        </p>

        <div className="space-y-4 relative z-10">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_20px_theme(colors.cyan.400/50%)] text-white font-medium px-6 py-4 rounded-full transition-all duration-150"
          >
            <Download size={20} />
            Télécharger mon rapport PDF
          </a>

          <Link
            href={code ? `/acheter-ou-louer/${code}` : "/"}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium px-6 py-4 rounded-full transition-colors"
          >
            <Home size={20} />
            Retour à l&apos;analyse
          </Link>
        </div>
      </div>
    </main>
  );
}
