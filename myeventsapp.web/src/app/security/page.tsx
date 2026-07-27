import { ShieldCheck, Lock, Database, EyeOff } from "lucide-react";

export default function SecurityPage() {
    return (
        <div className="py-20 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-brand-accent/10 p-2.5 rounded-xl text-brand-accent">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white">Sécurité de la plateforme</h1>
            </div>

            <p className="text-zinc-400 mb-16 max-w-xl">
                Chez BANTU, la sécurité et la confidentialité de vos transactions et billets sont notre priorité absolue.
            </p>

            <div className="space-y-12">
                <div className="flex gap-4">
                    <div className="bg-white/5 p-3 rounded-xl h-fit text-brand-accent shrink-0">
                        <Lock className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Chiffrement des QR Codes</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Chaque billet généré contient un token cryptographique unique de haute sécurité. La validation à l'entrée s'effectue via un algorithme asymétrique empêchant toute contrefaçon ou falsification de billets.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white/5 p-3 rounded-xl h-fit text-brand-accent shrink-0">
                        <Database className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Hébergement & Sauvegardes</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Nos bases de données et nos fichiers de configurations sont sauvegardés quotidiennement de manière redondante. L'accès à nos API est sécurisé par des jetons JWT et des clés de serveurs robustes.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white/5 p-3 rounded-xl h-fit text-brand-accent shrink-0">
                        <EyeOff className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Conformité RGPD</h3>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Nous respectons le Règlement Général sur la Protection des Données (RGPD). Vos données personnelles ne sont jamais vendues à des tiers et vous disposez d'un droit de suppression totale de votre compte à tout moment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
