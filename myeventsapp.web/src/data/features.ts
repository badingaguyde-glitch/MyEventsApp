export interface Feature {
    slug: string;
    title: string;
    shortDesc: string;
    description: string;
    benefits: string[];
    icon: string;
}

export const features: Feature[] = [
    {
        slug: "billetterie",
        title: "Billetterie en Ligne",
        shortDesc: "Achat et vente de billets sécurisés, digitalisés en quelques clics. Gestion des entrées et des accès simplifiée pour vos événements.",
        description: "Une expérience d'achat fluide pour les utilisateurs. Supporte la tarification personnalisée et les quotas de places.",
        benefits: ["Paiement instantané", "Génération automatique de billet", "Gestion des capacités en temps réel"],
        icon: "ticket"
    },
    {
        slug: "qr-code",
        title: "Validation par QR Code",
        shortDesc: "Contrôle d'accès sécurisé et rapide le jour J.",
        description: "Chaque billet gé,ère un code QR unique crypté. Les organisateurs scannent les codes depuis l'application mobile pour valider l'entrée instantanément.",
        benefits: ["Zéro fraude", "Contrôle de présence en temps réel", "Entrées ultra-rapides"],
        icon: "qr-code"
    },
    {
        slug: "gestion-participants",
        title: "Gestion des Participants",
        shortDesc: "Suivez vos invités et analysez vos ventes.",
        description: "Un tableau de bord complet pour l'organisateur listant tous les inscrits, leurs status de paiement et leurs validations de présence.",
        benefits: ["Export de données", "Statistiques de présence", "Recherche rapide de billets"],
        icon: "users"
    },
    {
        slug: "paiement-mobile",
        title: "Paiement Mobile Money & Sécurisé",
        shortDesc: "Intégration des méthodes de paiement locales et internationales.",
        description: "Facilitez l'achat en proposant des méthodes de paiement locales adaptées comme le Mobile Money, en plus des cartes bancaires traditionnelles.",
        benefits: ["Adapté aux marchés locaux", "Transactions sécurisées", "Remboursements gérés plus facilement"],
        icon: "wallet"
    },
    {
        slug: "billets-personnalisables",
        title: "Billets PDF Personnalisables",
        shortDesc: "Éditeur de billets électroniques et aperçu live (Option PRO).",
        description: "Permettez aux créateurs de personnaliser l'aspect de leurs billets PDF (couleurs, polices, logo sponsor) avec un aperçu interactif en temps réel.",
        benefits: ["Branding professionnel", "Aperçu instantané en direct", "Optimisé pour impression & mobile"],
        icon: "smartphone"
    }
];