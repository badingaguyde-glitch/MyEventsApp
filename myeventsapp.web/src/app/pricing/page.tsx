import { Check, Sparkles } from "lucide-react";

export default function PricingPage() {
    const plans = [
        {
            name: "Gratuit",
            price: "0 €",
            description: "Pour les petits événements, rassemblements familiaux ou associatifs.",
            features: [
                "Jusqu'à 100 participants",
                "Billets gratuits uniquement",
                "Validation par QR Code standard",
                "Support par email sous 48h",
            ],
            cta: "Commencer maintenant",
            popular: false,
        },
        {
            name: "Professionnel",
            price: "1.5 %",
            suffix: " / billet vendu",
            description: "Pour les festivals, concerts et conférences commerciales.",
            features: [
                "Participants illimités",
                "Billets payants et gratuits",
                "Paiements locaux (Mobile Money & Cartes)",
                "Éditeur de billets PDF personnalisés (couleurs, texte)",
                "Bannière d'événement sur les billets PDF",
                "Scanner QR Code haute performance",
                "Support prioritaire par email & chat",
                "Statistiques de ventes avancées",
            ],
            cta: "Lancer mon événement",
            popular: true,
        },
        {
            name: "Entreprise",
            price: "Sur devis",
            description: "Pour les grands organisateurs de festivals multilocations et grands stades.",
            features: [
                "Gestion multi-organisateurs & équipes",
                "Personnalisation graphique avancée des billets",
                "Affichage des logos sponsors sur les billets",
                "API & Webhooks dédiés",
                "Hébergement de données souverain",
                "Gestion des remboursements en masse",
                "Accompagnement et support dédié 24/7",
            ],
            cta: "Contacter l'équipe",
            popular: false,
        },
    ];

    return (
        <div className="py-20 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">Des tarifs transparents</h1>
            <p className="text-zinc-400 max-w-xl mx-auto mb-16">
                Aucun frais caché. Choisissez la formule qui correspond à l'envergure de vos événements.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
                {plans.map((plan, idx) => (
                    <div
                        key={idx}
                        className={`relative p-8 rounded-3xl border flex flex-col justify-between ${plan.popular
                                ? "bg-brand-accent/[0.03] border-brand-accent/40 shadow-xl shadow-brand-accent/5"
                                : "bg-white/[0.02] border-white/5"
                            }`}
                    >
                        {plan.popular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-accent text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> Recommandé
                            </span>
                        )}

                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-xs text-zinc-400 mb-6 min-h-[40px]">{plan.description}</p>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                {plan.suffix && <span className="text-zinc-400 text-sm">{plan.suffix}</span>}
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-start gap-2.5 text-sm text-zinc-300">
                                        <Check className="h-4.5 w-4.5 text-brand-accent shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <a
                            href="https://my-events-app-xi.vercel.app"
                            className={`w-full text-center py-3.5 rounded-xl text-sm font-bold transition-all ${plan.popular
                                    ? "bg-brand-accent hover:bg-brand-accentHover text-white shadow-md"
                                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                }`}
                        >
                            {plan.cta}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}