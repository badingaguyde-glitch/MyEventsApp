"use client";

import { useState } from "react";
import { faqData } from "@/data/faq";
import { HelpCircle, Mail, Send, CheckCircle2 } from "lucide-react";

export default function HelpPage() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                setStatus("error");
            }
        } catch (error) {
            setStatus("error");
        }
    };

    return (
        <div className="py-20 flex flex-col lg:flex-row gap-16">
            {/* Colonne gauche : FAQ */}
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-brand-accent/10 p-2.5 rounded-xl text-brand-accent">
                        <HelpCircle className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white">Centre d'aide</h1>
                </div>
                <p className="text-zinc-400 mb-12 max-w-xl">
                    Trouvez des réponses rapides à vos questions ou contactez directement notre support via le formulaire.
                </p>
                <div className="space-y-6">
                    {faqData.map((item, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded-full">
                                {item.category}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-4 mb-2">{item.question}</h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Colonne droite : Formulaire de Contact */}
            <div className="w-full lg:w-[450px]">
                <div className="glass-panel p-8 rounded-3xl sticky top-28">
                    <div className="flex items-center gap-2 mb-6 text-white font-bold text-lg">
                        <Mail className="h-5 w-5 text-brand-accent" /> Poser une question
                    </div>
                    {status === "success" ? (
                        <div className="text-center py-8">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Message envoyé !</h3>
                            <p className="text-sm text-zinc-400">
                                Votre requête a été transmise à notre serveur de traitement. Notre équipe reviendra vers vous rapidement.
                            </p>
                            <button
                                onClick={() => setStatus("idle")}
                                className="mt-6 text-sm text-brand-accent hover:underline font-medium"
                            >
                                Envoyer un autre message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Alain Dushime"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3.5 bg-white/[0.02] border border-white/10 rounded-xl text-white outline-none focus:border-brand-accent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Adresse Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="Ex: alain@exemple.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3.5 bg-white/[0.02] border border-white/10 rounded-xl text-white outline-none focus:border-brand-accent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Sujet</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Problème de validation QR Code"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full p-3.5 bg-white/[0.02] border border-white/10 rounded-xl text-white outline-none focus:border-brand-accent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Décrivez votre problème en détail..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full p-3.5 bg-white/[0.02] border border-white/10 rounded-xl text-white outline-none focus:border-brand-accent text-sm resize-none"
                                />
                            </div>
                            {status === "error" && (
                                <p className="text-xs text-brand-accent font-semibold">
                                    Une erreur s'est produite lors de l'envoi. Veuillez réessayer.
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accentHover text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-sm shadow-md"
                            >
                                {status === "loading" ? "Envoi en cours..." : <>Envoyer <Send className="h-4 w-4" /></>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}