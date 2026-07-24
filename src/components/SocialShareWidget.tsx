"use client";

import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Share2, Loader2 } from 'lucide-react';

interface SocialShareWidgetProps {
  cityName: string;
  prixM2: number;
  loyerM2: number;
  taxeFonciere: number;
  basculeAnnee: number | string | null;
}

export default function SocialShareWidget({
  cityName,
  prixM2,
  loyerM2,
  taxeFonciere,
  basculeAnnee,
}: SocialShareWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleShare = async () => {
    if (!widgetRef.current) return;
    try {
      setGenerating(true);
      // Generate image
      const dataUrl = await htmlToImage.toPng(widgetRef.current, { quality: 1, pixelRatio: 2, skipFonts: false });
      
      // Try Web Share API first
      if (navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], `kalcul-${cityName.toLowerCase().replace(/ /g, '-')}.png`, { type: 'image/png' });
          await navigator.share({
            title: `Bilan immobilier : ${cityName}`,
            text: `Découvrez si l'achat est plus rentable que la location à ${cityName} sur Kalcul.app !`,
            files: [file],
          });
          return;
        } catch (err) {
          console.warn("Share API failed or cancelled", err);
        }
      }

      // Fallback: download
      const link = document.createElement('a');
      link.download = `kalcul-${cityName.toLowerCase().replace(/ /g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating image", err);
      alert("Erreur lors de la génération de l'image.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={generating}
        className="w-full bg-white border-2 border-purple-200 hover:border-purple-600 text-purple-700 font-bold rounded-xl py-3 transition-all duration-150 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
      >
        {generating ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
        {generating ? "Génération..." : "Partager mes résultats 🚀"}
      </button>

      {/* Hidden Widget for Image Generation */}
      <div className="overflow-hidden absolute pointer-events-none" style={{ left: '-9999px', top: '-9999px', width: '1200px', height: '630px' }}>
        <div ref={widgetRef} className="w-[1200px] h-[630px] bg-gradient-to-br from-slate-900 to-purple-950 flex flex-col justify-between p-16 font-sans">
          
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-block bg-purple-500/20 text-purple-200 font-bold px-6 py-2 rounded-full text-2xl mb-6 border border-purple-500/30">
                Kalcul.app
              </div>
              <h1 className="text-white text-7xl font-extrabold tracking-tight leading-tight">
                Acheter ou Louer à<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-300">
                  {cityName} ?
                </span>
              </h1>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center min-w-[250px]">
               <div className="text-purple-300 text-xl font-medium mb-2">Taxe Foncière</div>
               <div className="text-white text-4xl font-bold">{taxeFonciere ? `${Math.round(taxeFonciere)} €` : "N/D"}</div>
               <div className="text-purple-200 text-lg">/ an</div>
            </div>
          </div>

          <div className="flex gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex-1">
              <div className="text-purple-300 text-2xl mb-2 font-medium">Prix d'achat</div>
              <div className="text-white text-6xl font-bold">{prixM2 ? `${Math.round(prixM2)} €` : "N/D"}<span className="text-3xl text-purple-200 font-normal"> / m²</span></div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex-1">
              <div className="text-purple-300 text-2xl mb-2 font-medium">Loyer d'annonce</div>
              <div className="text-white text-6xl font-bold">{loyerM2 ? `${loyerM2.toFixed(1)} €` : "N/D"}<span className="text-3xl text-purple-200 font-normal"> / m²</span></div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-3xl p-8 flex items-center justify-between border-4 border-purple-400 shadow-2xl">
            <div className="text-5xl text-white font-extrabold">
              {basculeAnnee 
                ? `L'achat gagne après ${basculeAnnee} ans 🏡`
                : `La location reste plus rentable 🔑`
              }
            </div>
            <div className="text-purple-100 text-2xl font-medium text-right leading-tight">
              Faites le test sur<br/>
              <span className="text-white font-extrabold text-3xl">kalcul.app</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
