export interface ChangelogVersion {
    version: string;
    date: string;
    changes: {
        added?: string[];
        improved?: string[];
        fixed?: string[];
    };
}

export const changelogData: ChangelogVersion[] = [
    {
        version: "1.0.0",
        date: "27 juillet 2026",
        changes: {
            added: [
                "Lancement officiel de BANTU MY EVENT",
                "Système de création et de gestion d'événements",
                "Génération automatique de QR Codes uniques",
                "Application mobile avec scanner de validation de billets"
            ],
            improved: [
                "Temps de réponse de l'API optimisé pour les listes d'évènements",
                "Sécurisation des transactions"
            ]
        }
    }
];