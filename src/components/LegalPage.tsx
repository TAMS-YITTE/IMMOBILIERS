import React from 'react';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 mb-10">Dernière mise à jour : {updated}</p>
        <div className="prose prose-invert prose-slate max-w-none space-y-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-slate-300 [&_p]:leading-relaxed [&_li]:text-slate-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-purple-400 [&_a]:underline">
          {children}
        </div>
      </div>
    </main>
  );
}
