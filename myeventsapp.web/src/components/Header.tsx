"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, Ticket } from "lucide-react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const frontendUrl = "https://my-events-app-xi.vercel.app";

    return (
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5">
            <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <img 
                        src="/images/logo.png" 
                        alt="BANTU" 
                        className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="text-xl font-bold tracking-tight text-white">
                        BANTU <span className="text-brand-accent">MY EVENT</span>
                    </span>
                </Link>

                {/* Navigation Bureau */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                    <Link href="/features" className="hover:text-white transition-colors">Fonctionnalités</Link>
                    <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
                    <Link href="/help" className="hover:text-white transition-colors">Centre d'aide</Link>
                    <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
                    <Link href="/about" className="hover:text-white transition-colors">À propos</Link>
                </nav>

                {/* Action Bureau */}
                <div className="hidden md:flex items-center gap-4">
                    <a
                        href={`${frontendUrl}/login`}
                        className="text-sm font-medium hover:text-white transition-colors px-4 py-2 text-zinc-300"
                    >
                        Se connecter
                    </a>
                    <a
                        href={frontendUrl}
                        className="flex items-center gap-1.5 bg-brand-accent hover:bg-brand-accentHover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-accent/20"
                    >
                        Créer un événement <ArrowUpRight className="h-4 w-4" />
                    </a>
                </div>

                {/* Bouton Mobile */}
                <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Menu Mobile */}
            {isOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-brand-dark/95 border-b border-white/10 px-6 py-8 flex flex-col gap-6 text-base font-medium">
                    <Link href="/features" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-white">Fonctionnalités</Link>
                    <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-white">Tarifs</Link>
                    <Link href="/help" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-white">Centre d'aide</Link>
                    <Link href="/docs" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-white">Documentation</Link>
                    <Link href="/about" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-white">À propos</Link>
                    <hr className="border-white/10" />
                    <a href={`${frontendUrl}/login`} className="text-zinc-300 hover:text-white">Se connecter</a>
                    <a href={frontendUrl} className="flex items-center justify-center gap-1.5 bg-brand-accent text-white px-5 py-3 rounded-xl">
                        Créer un événement <ArrowUpRight className="h-4 w-4" />
                    </a>
                </div>
            )}
        </header>
    );
}