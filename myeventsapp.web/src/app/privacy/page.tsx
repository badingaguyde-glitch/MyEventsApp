import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="py-20 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-brand-accent" />
        <h1 className="text-3xl md:text-5xl font-black text-white">Politique de Confidentialité</h1>
      </div>
      
      <p className="text-zinc-400 text-sm">Dernière mise à jour : 27 Juillet 2026</p>

      <div className="text-zinc-300 space-y-6 text-sm leading-relaxed">
        <p>
          BANTU MY EVENT s'engage à protéger la confidentialité de vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
        </p>

        <h3 className="text-lg font-bold text-white mt-8">1. Collecte des Données</h3>
        <p>
          Nous collectons des informations lorsque vous créez un compte organisateur ou participant (Nom, Prénom, Email, Intérêts, Mot de passe sécurisé) ainsi que les données de transaction lors de l'achat d'un billet.
        </p>

        <h3 className="text-lg font-bold text-white mt-8">2. Utilisation des Données</h3>
        <p>
          Vos données servent exclusivement à :
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Générer vos billets uniques et valider vos accès par QR Code.</li>
          <li>Transmettre les données d'inscription indispensables aux organisateurs des événements auxquels vous participez.</li>
          <li>Optimiser notre système de recommandation d'événements.</li>
        </ul>

        <h3 className="text-lg font-bold text-white mt-8">3. Droit d'accès et suppression</h3>
        <p>
          Conformément au RGPD, vous disposez d'un droit total d'accès, de modification et de suppression de vos données personnelles à tout moment en nous contactant via le support.
        </p>
      </div>
    </div>
  );
}
