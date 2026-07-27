import { ArrowLeft, Webhook, Bot, Layers, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";

export default function WebhooksPage() {
  return (
    <div className="py-20 max-w-4xl mx-auto px-4">
      <div className="mb-12">
        <Link href="/docs" className="text-sm font-bold text-brand-accent hover:text-brand-accentHover inline-flex items-center gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour à la documentation
        </Link>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6">Intégration par Webhooks BANTU</h1>
        <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
          Automatisez vos flux métiers en écoutant les événements de billetterie BANTU en temps réel. Recevez des notifications HTTP dès qu'une action importante se produit.
        </p>
      </div>

      {/* Events section */}
      <div className="space-y-8 mb-16">
        <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
          <Webhook className="h-5 w-5 text-brand-accent" /> Événements Disponibles
        </h2>

        <div className="grid gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
            <h3 className="text-sm font-bold text-white font-mono">ticket.purchased</h3>
            <p className="text-xs text-zinc-400">Déclenché dès qu'un participant finalise l'achat d'un billet via Mobile Money ou Stripe.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
            <h3 className="text-sm font-bold text-white font-mono">ticket.verified</h3>
            <p className="text-xs text-zinc-400">Déclenché lors de la validation réussie d'un QR Code via notre application mobile de contrôle d'accès.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
            <h3 className="text-sm font-bold text-white font-mono">event.created</h3>
            <p className="text-xs text-zinc-400">Déclenché lors de la création et du paiement des frais de mise en ligne d'un événement.</p>
          </div>
        </div>
      </div>

      {/* Mini Vitrine TaskQueueManager (QueueEngine) */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-accent/5 to-transparent border border-brand-accent/20 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-brand-accent pointer-events-none">
          <Terminal className="h-40 w-40" />
        </div>

        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-brand-accent animate-pulse" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full">
            Moteur de Tâches Asynchrones
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-black text-white">Déléguez vos tâches avec TaskQueueManager (QueueEngine)</h2>
          <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
            Connectez vos webhooks BANTU à **QueueEngine**, notre serveur de messagerie et de traitement de tâches en arrière-plan écrit en .NET 10. Déléguez la génération de billets PDF et l'expédition d'e-mails à une file d'attente résiliente.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-4">
          <div className="space-y-2">
            <div className="bg-white/5 p-2 rounded-lg w-fit text-brand-accent">
              <Layers className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Traitement Asynchrone</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Exécution robuste des tâches avec re-tentatives automatiques (retries), Dead Letter Queue (DLQ), et verrous distribués.
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-white/5 p-2 rounded-lg w-fit text-brand-accent">
              <Bot className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Workers Multi-Langages</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Workers natifs .NET (Email/SMTP personnalisé) et workers Node.js externes pour générer des PDFs lourds avec Puppeteer.
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-white/5 p-2 rounded-lg w-fit text-brand-accent">
              <Terminal className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Dashboard Temps Réel</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Visualisez l'état de la file d'attente ( doughnut chart interactif) et gérez vos tâches en direct via des WebSockets.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs text-zinc-500">
            QueueEngine est disponible sous licence Open-Source et licences commerciales Pro/Enterprise.
          </div>
          <a 
            href="https://queue-manager-vitrine.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-brand-accent/20 cursor-pointer"
          >
            Découvrir QueueEngine sur notre site vitrine
          </a>
        </div>
      </div>
    </div>
  );
}
