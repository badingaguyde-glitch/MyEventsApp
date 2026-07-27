import { Download, Sparkles, Image, Palette, Ticket } from "lucide-react";

export default function PressPage() {
  return (
    <div className="py-20 max-w-4xl mx-auto space-y-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full mb-4 inline-block">
          Presse & Médias
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6">Kit Presse BANTU</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Téléchargez nos logos, captures d'écran officielles et chartes graphiques pour vos articles de presse ou partenariats.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Identité visuelle */}
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
          <Palette className="h-8 w-8 text-brand-accent" />
          <h3 className="text-xl font-bold text-white">Charta Graphique & Logo</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Téléchargez le logotype BANTU MY EVENT dans toutes ses variantes (sombre, clair, icône seule) et formats (PNG, SVG).
          </p>
          <button className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all">
            <Download className="h-4 w-4" /> Télécharger les logos (ZIP)
          </button>
        </div>

        {/* Captures d'écran */}
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
          <Image className="h-8 w-8 text-brand-accent" />
          <h3 className="text-xl font-bold text-white">Captures d'écran App</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Consultez et téléchargez les visuels officiels de l'application mobile de contrôle d'accès et du dashboard organisateur web.
          </p>
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl transition-all">
            <Download className="h-4 w-4" /> Télécharger les visuels (ZIP)
          </button>
        </div>
      </div>
    </div>
  );
}
