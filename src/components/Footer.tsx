import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Kalcul.app — YITTE (SIREN 919 805 028)</p>
        <div className="flex items-center gap-6">
          <Link href="/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
          <Link href="/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
          <Link href="/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}
