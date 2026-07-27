import Link from "next/link";
import { Ticket } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-brand-dark/30 border-t border-white/5 py-16 mt-24">
            <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-5 gap-12">
                <div className="col-span-2 flex flex-col gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-brand-accent p-2 rounded-lg text-white">
                            <Ticket className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">
                            BANTU <span className="text-brand-accent">MY EVENT</span>
                        </span>
                    </Link>
                    <p className="text-sm text-zinc-400 max-w-sm">
                        La plateforme tout-en-un d'organisation et de billetterie d'événements physiques. Simplifiez vos accès, sécurisez vos transactions.
                    </p>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">Produit</h3>
                    <ul className="flex flex-col gap-3 text-sm text-zinc-400">
                        <li><Link href="/features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                        <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                        <li><Link href="/roadmap" className="hover:text-white transition-colors">Roadmap Publique</Link></li>
                        <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">Support & Doc</h3>
                    <ul className="flex flex-col gap-3 text-sm text-zinc-400">
                        <li><Link href="/help" className="hover:text-white transition-colors">Centre d'aide</Link></li>
                        <li><Link href="/docs" className="hover:text-white transition-colors">Documentation API</Link></li>
                        <li><Link href="/security" className="hover:text-white transition-colors">Sécurité & RGPD</Link></li>
                        <li><Link href="/status" className="hover:text-white transition-colors">Statut des services</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">Entreprise</h3>
                    <ul className="flex flex-col gap-3 text-sm text-zinc-400">
                        <li><Link href="/about" className="hover:text-white transition-colors">À propos</Link></li>
                        <li><Link href="/careers" className="hover:text-white transition-colors">Carrières</Link></li>
                        <li><Link href="/press" className="hover:text-white transition-colors">Espace Presse</Link></li>
                    </ul>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
                <p>&copy; {currentYear} BANTU. Tous droits réservés.</p>
                <div className="flex gap-6">
                    <Link href="/privacy" className="hover:text-zinc-300">Confidentialité</Link>
                    <Link href="/terms" className="hover:text-zinc-300">Conditions d'utilisation</Link>
                </div>
            </div>
        </footer>
    );
}