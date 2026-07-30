"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Ticket, ShieldCheck, Users, QrCode, Sparkles, Smartphone, Download } from "lucide-react";
import { features } from "@/data/features";

export default function Home() {
  const frontendUrl = "https://my-events-app-xi.vercel.app";

  const [activeTab, setActiveTab] = useState(0);

  const screenshots = [
    {
      title: "Tableau de Bord",
      description: "Suivez vos ventes, gérez vos participants et consultez vos revenus globaux en un coup d'œil grâce à notre interface d'analyse intuitive.",
      image: "/images/Capture d'écran 2026-07-30 132510.png"
    },
    {
      title: "Créateur d'Événements",
      description: "Créez vos fiches événements en moins de deux minutes en renseignant la description, la date et la géolocalisation de vos salles.",
      image: "/images/Capture d'écran 2026-07-30 132532.png"
    },
    {
      title: "Modèles de Billets",
      description: "Personnalisez graphiquement l'apparence de vos billets PDF en choisissant les couleurs, le layout et en intégrant vos sponsors.",
      image: "/images/Capture d'écran 2026-07-30 132609.png"
    },
    {
      title: "Scanner QR Code",
      description: "Validez les billets en temps réel et sécurisez les accès à l'entrée de vos événements grâce au scanner intégré fluide.",
      image: "/images/Capture d'écran 2026-07-30 132935.png"
    }
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="relative w-full overflow-hidden pb-20">
      {/* Glow d'arrière-plan */}
      <div className="hero-glow" />

      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold mb-8"
        >
          <Sparkles className="h-3.5 w-3.5" /> Redéfinir l'expérience événementielle
        </motion.div>

        <motion.h1 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-8"
        >
          Créez des événements inoubliables. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-[#FF8C7F]">
            Vendez vos billets en toute simplicité.
          </span>
        </motion.h1>

        <motion.p 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12"
        >
          BANTU MY EVENT est la solution tout-en-un de billetterie, validation par QR Code et gestion des participants pour les organisateurs ambitieux.
        </motion.p>

        {/* Boutons CTA */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4"
        >
          <a
            href={frontendUrl}
            className="flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accentHover text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-brand-accent/20 group text-base"
          >
            Commencer gratuitement
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <Link
            href="/features"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold px-8 py-4 rounded-xl transition-all text-base"
          >
            Découvrir les fonctionnalités
          </Link>
        </motion.div>
      </section>

      {/* --- 2. CHIFFRES CLÉS (Statistics) --- */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-y border-white/5 bg-white/[0.01] rounded-2xl px-8 my-16"
      >
        <motion.div variants={fadeIn} className="text-center">
          <div className="text-3xl md:text-5xl font-black text-brand-accent mb-2">50K+</div>
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Billets Vendus</div>
        </motion.div>
        <motion.div variants={fadeIn} className="text-center">
          <div className="text-3xl md:text-5xl font-black text-white mb-2">200+</div>
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Événements Créés</div>
        </motion.div>
        <motion.div variants={fadeIn} className="text-center">
          <div className="text-3xl md:text-5xl font-black text-white mb-2">99.9%</div>
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Disponibilité API</div>
        </motion.div>
        <motion.div variants={fadeIn} className="text-center">
          <div className="text-3xl md:text-5xl font-black text-white mb-2">&lt; 2s</div>
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Validation QR Code</div>
        </motion.div>
      </motion.section>

      {/* --- 3. DÉMONSTRATION VISUELLE (Mockup) --- */}
      <section className="py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-[16/9] max-w-5xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Overlay d'ambiance évènement */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200" 
            alt="Showcase de festival musical avec foule enthousiaste" 
            className="w-full h-full object-cover brightness-75 scale-105 hover:scale-100 transition-transform duration-[2s]"
          />
          <div className="absolute bottom-8 left-8 z-20 text-left max-w-lg">
            <h3 className="text-2xl font-bold text-white mb-2">BANTU MY EVENT sur le terrain</h3>
            <p className="text-sm text-zinc-300">
              Des festivals de musique aux conférences professionnelles, notre système de billetterie assure un contrôle fluide et sécurisé à chaque entrée.
            </p>
          </div>
        </motion.div>
      </section>

      {/* --- 4. FONCTIONNALITÉS --- */}
      <section className="py-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Conçu pour les organisateurs exigeants
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto mb-16">
          Tous les outils nécessaires pour structurer, promouvoir et piloter vos événements.
        </p>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center"
        >
          {features.map((feature) => {
            const IconComponent = 
              feature.slug === "billetterie" ? Ticket :
              feature.slug === "qr-code" ? QrCode :
              feature.slug === "gestion-participants" ? Users :
              feature.slug === "billets-personnalisables" ? Smartphone : ShieldCheck;

            return (
              <motion.div 
                key={feature.slug}
                variants={fadeIn}
                whileHover={{ y: -6, borderColor: "rgba(255, 76, 59, 0.4)" }}
                className="flex flex-col text-left p-8 rounded-2xl bg-white/[0.02] border border-white/5 transition-all cursor-pointer"
              >
                <div className="bg-brand-accent/10 p-3.5 rounded-xl text-brand-accent w-fit mb-6">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 flex-1">
                  {feature.shortDesc}
                </p>
                <Link 
                  href={`/features/${feature.slug}`} 
                  className="text-sm font-bold text-brand-accent hover:text-brand-accentHover inline-flex items-center gap-1 group/link"
                >
                  En savoir plus 
                  <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* --- 5. SECTION TÉLÉCHARGEMENT APPLICATION MOBILE --- */}
      <section className="py-16 text-center">
        <div className="max-w-5xl mx-auto p-8 md:p-12 rounded-3xl bg-white/[0.01] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="space-y-4 max-w-xl z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold">
              <Smartphone className="h-3.5 w-3.5 animate-pulse" /> Application Mobile
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              Gérez les entrées directement sur le terrain
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Téléchargez notre application Android officielle pour scanner les billets QR Code à l'entrée de vos événements, valider les accès en temps réel et sécuriser vos entrées sans aucune fraude.
            </p>
          </div>

          <div className="flex flex-col gap-3 min-w-[220px] w-full md:w-auto z-10">
            <a
              href="/bantu-myevents.apk"
              download="bantu-myevents.apk"
              className="flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accentHover text-white font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-brand-accent/20 text-center text-base"
            >
              <Download className="h-5 w-5" />
              Télécharger l'APK
            </a>
            <span className="text-xs text-zinc-500 text-center">
              Version Android officielle 1.0.0
            </span>
          </div>
        </div>
      </section>

      {/* --- 5. INTERACTIVE PRODUCT SHOWCASE --- */}
      <section className="py-16 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" /> Visite Guidée de la Plateforme
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white">
              Une interface pensée pour les organisateurs
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Explorez les coulisses de la plateforme Bantu MyEvents et découvrez sa puissance de gestion à travers ces aperçus réels.
            </p>
          </div>

          {/* Tabs Selector */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl w-fit mx-auto">
            {screenshots.map((shot, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === idx
                    ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {shot.title}
              </button>
            ))}
          </div>

          {/* Active Screen Mockup */}
          <div className="relative p-3 rounded-2xl bg-white/[0.01] border border-white/5 max-w-4xl mx-auto overflow-hidden shadow-2xl">
            {/* Top Browser Bar Mockup */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.03] rounded-t-xl border-b border-white/5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <div className="ml-4 h-4 bg-white/5 rounded-md w-48 text-[9px] text-zinc-500 flex items-center px-2">
                myeventsapp.bantu/organizer-hub
              </div>
            </div>

            {/* Description card */}
            <div className="p-4 bg-white/[0.02] border-b border-white/5 text-left">
              <p className="text-xs text-zinc-300 font-medium">
                {screenshots[activeTab].description}
              </p>
            </div>

            {/* Dynamic Screenshot Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeTab}
                  src={screenshots[activeTab].image}
                  alt={screenshots[activeTab].title}
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover object-top"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. CTA SECTION --- */}
      <section className="mt-16 py-16 rounded-3xl bg-gradient-to-b from-brand-accent/10 to-transparent border border-brand-accent/10 text-center relative overflow-hidden px-6">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-[80px]" />
        
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
          Pret a lancer votre prochain evenement ?
        </h2>
        <p className="text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed">
          Rejoignez des centaines d'organisateurs qui font confiance a BANTU MY EVENT pour simplifier leurs billetteries et eliminer la fraude aux entrees.
        </p>
        <a
          href={frontendUrl}
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accentHover text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-brand-accent/20 text-base"
        >
          Creer un evenement maintenant
          <ArrowRight className="h-5 w-5" />
        </a>
      </section>
    </div>
  );
}