import Link from "next/link";
import { features } from "@/data/features";
import { Ticket, Users, QrCode, Wallet, ArrowRight, ShieldCheck } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6">Nos Fonctionnalités</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Découvrez la suite d'outils performants développés par BANTU pour simplifier et sécuriser la gestion de vos événements.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {features.map((feature) => {
          const IconComponent =
            feature.slug === "billetterie" ? Ticket :
            feature.slug === "qr-code" ? QrCode :
            feature.slug === "gestion-participants" ? Users : Wallet;

          return (
            <div 
              key={feature.slug}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:border-brand-accent/30 transition-all group"
            >
              <div>
                <div className="bg-brand-accent/10 p-3.5 rounded-xl text-brand-accent w-fit mb-6">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{feature.title}</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>

              <Link 
                href={`/features/${feature.slug}`} 
                className="text-sm font-bold text-brand-accent hover:text-brand-accentHover inline-flex items-center gap-1 group/link"
              >
                Découvrir en détail
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
