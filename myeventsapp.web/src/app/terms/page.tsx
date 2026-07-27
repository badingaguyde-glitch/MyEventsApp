import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="py-20 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-brand-accent" />
        <h1 className="text-3xl md:text-5xl font-black text-white">Conditions Générales d'Utilisation</h1>
      </div>
      
      <p className="text-zinc-400 text-sm">Dernière mise à jour : 27 Juillet 2026</p>

      <div className="text-zinc-300 space-y-6 text-sm leading-relaxed">
        <p>
          Bienvenue sur BANTU MY EVENT. En accédant à nos services, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation.
        </p>

        <h3 className="text-lg font-bold text-white mt-8">1. Description des Services</h3>
        <p>
          BANTU fournit une plateforme de billetterie en ligne pour les organisateurs et les participants d'événements physiques. BANTU décline toute responsabilité quant au contenu, au déroulement ou aux reports d'événements créés par les organisateurs tiers sur sa plateforme.
        </p>

        <h3 className="text-lg font-bold text-white mt-8">2. Règles des Comptes Organisateurs</h3>
        <p>
          Les organisateurs s'engagent à respecter les limitations de capacité liées à leur forfait (100 personnes max pour les forfaits gratuits). Toute fraude ou duplication de billets entraînera le blocage immédiat du compte.
        </p>

        <h3 className="text-lg font-bold text-white mt-8">3. Remboursements</h3>
        <p>
          Les modalités de remboursement sont définies par chaque organisateur. La gestion de remboursement et annulation en masse est une fonctionnalité exclusive réservée aux organisateurs ayant souscrit au forfait Entreprise.
        </p>
      </div>
    </div>
  );
}
