import { changelogData } from "@/data/changelog";
import { GitBranch, Plus, ArrowUpCircle } from "lucide-react";

export default function ChangelogPage() {
    return (
        <div className="py-20 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-brand-accent/10 p-2.5 rounded-xl text-brand-accent">
                    <GitBranch className="h-6 w-6" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white">Mises à jour (Changelog)</h1>
            </div>

            <p className="text-zinc-400 mb-16 max-w-xl">
                Suivez en direct l'évolution de la plateforme et les nouvelles fonctionnalités ajoutées par l'équipe BANTU.
            </p>

            <div className="relative border-l border-white/5 pl-8 space-y-12">
                {changelogData.map((item, idx) => (
                    <div key={idx} className="relative">
                        {/* Point sur la timeline */}
                        <div className="absolute -left-[41px] top-1.5 h-6 w-6 rounded-full bg-brand-dark border-2 border-brand-accent flex items-center justify-center">
                            <div className="h-2 w-2 bg-brand-accent rounded-full animate-ping" />
                        </div>

                        <div className="flex items-baseline gap-4 mb-4">
                            <h2 className="text-2xl font-bold text-white">Version {item.version}</h2>
                            <span className="text-xs text-zinc-500 font-medium">{item.date}</span>
                        </div>

                        <div className="space-y-6">
                            {item.changes.added && (
                                <div>
                                    <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <Plus className="h-4 w-4" /> Nouveautés
                                    </h3>
                                    <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1 pl-2">
                                        {item.changes.added.map((change, cIdx) => (
                                            <li key={cIdx}>{change}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {item.changes.improved && (
                                <div>
                                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                        <ArrowUpCircle className="h-4 w-4" /> Améliorations
                                    </h3>
                                    <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1 pl-2">
                                        {item.changes.improved.map((change, cIdx) => (
                                            <li key={cIdx}>{change}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}