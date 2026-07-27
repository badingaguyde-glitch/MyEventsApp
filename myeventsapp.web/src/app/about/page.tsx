import { Compass, Users, Milestone } from "lucide-react";

export default function AboutPage() {
    const team = [
        { name: "Guyde Freny Badinga", role: "Co-fondateur & Développeur" },
        { name: "Alain Jospin Dushime", role: "Co-fondateur & Développeur" },
    ];

    const roadmap = [
        { title: "En cours", tasks: ["Système d'inscription", "Abonnement organisateurs", "Sécurisation Mobile Money"] },
        { title: "Prochainement", tasks: ["Module Marketplace de revente de billets entre particuliers", "Statistiques temps réel avancées", "SDK pour développeurs externes"] },
        { title: "Terminé", tasks: ["Génération et scan de QR Code", "Yoklama (Yoklama et validation d'entrées)", "Création d'événement de base"] },
    ];

    return (
        <div className="py-20 max-w-4xl mx-auto space-y-24">
            {/* Notre Mission */}
            <section className="text-center">
                <div className="inline-flex bg-brand-accent/10 p-2.5 rounded-xl text-brand-accent mb-6">
                    <Compass className="h-6 w-6" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-6">Notre Mission</h1>
                <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl mx-auto">
                    Simplifier, numériser et sécuriser l'accès aux événements physiques pour tout le monde.
                    Nous construisons une technologie robuste pour connecter de façon fluide organisateurs et participants.
                </p>
            </section>

            {/* L'Équipe */}
            <section>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-12 flex items-center justify-center gap-2">
                    <Users className="h-6 w-6 text-brand-accent" /> L'Équipe BANTU
                </h2>
                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {team.map((member, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                            <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                            <p className="text-sm text-brand-accent font-semibold">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feuille de route publique */}
            <section>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center mb-12 flex items-center justify-center gap-2">
                    <Milestone className="h-6 w-6 text-brand-accent" /> Roadmap publique
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {roadmap.map((column, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">{column.title}</h3>
                            <ul className="space-y-3">
                                {column.tasks.map((task, tIdx) => (
                                    <li key={tIdx} className="text-sm text-zinc-400 flex items-start gap-2">
                                        <span className="text-brand-accent mt-1">•</span>
                                        <span>{task}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}