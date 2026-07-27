export interface FAQItem {
    question : string;
    answer : string;
    category: string;
}

export const faqData: FAQItem[] = [
    {
        category: "Achat",
        question: "Comment acheter un billet pour un événement ?",
        answer: "Parcourez les évènements disponibles dur la platforme, cliquez sur l'évènement de votre choix, sélectionnez la quantité de billets et validez le paiement sécurisé."
    },
    {
        category: "Organisateur",
        question: "Comment créer un événement ?",
        answer: "Connectez-vous à votre compte organisateur, cliquez sur 'Créer un événement' et remplissez les informations requises."
    },
    {
        category: "Organisateur",
        question: "Comment valider les billets à l'entrée de mon évènement ?",
        answer: "Utilisez l'application mobile pour scanner les codes QR des billets. Chaque billet génère un code QR unique qui sera validé instantanément."
    },
    {
        category: "Paiement",
        question: "Quels modes de paiement sont acceptés ?",
        answer: "Nous acceptons les paiements par carte bancaire ainsi que les services de paiement Mobile Money locaux pour faciliter l'accès au plus grand nombre."
    }
];