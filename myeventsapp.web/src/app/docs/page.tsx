import { Terminal, Code, Webhook, BookOpen, Key, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="py-20 max-w-4xl mx-auto">
      <div className="mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full mb-4 inline-block">
          Pour les Développeurs
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6">Documentation Développeur BANTU</h1>
        <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
          Intégrez notre moteur de billetterie et de validation d'accès dans vos propres applications ou automatisez vos flux avec nos APIs et Webhooks.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* API REST */}
        <Link href="/docs/rest-api" className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-brand-accent/30 transition-all block group text-left">
          <div className="bg-brand-accent/10 p-3 rounded-xl text-brand-accent w-fit">
            <Terminal className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-1">
            API REST <ArrowRight className="h-4 w-4 text-brand-accent group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Consultez les détails de nos endpoints d'authentification, de gestion d'événements, d'achats de billets et Yoklama.
          </p>
          <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-zinc-300 border border-white/5">
            GET /api/events <br />
            POST /api/tickets/buy
          </div>
        </Link>

        {/* Webhooks */}
        <Link href="/docs/webhooks" className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-brand-accent/30 transition-all block group text-left">
          <div className="bg-brand-accent/10 p-3 rounded-xl text-brand-accent w-fit">
            <Webhook className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-1">
            Webhooks <ArrowRight className="h-4 w-4 text-brand-accent group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Soyez notifié en temps réel sur vos serveurs dès qu'un utilisateur achète un billet ou lorsqu'un accès est validé.
          </p>
          <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-zinc-300 border border-white/5">
            event.created <br />
            ticket.verified
          </div>
        </Link>
      </div>

      {/* Note important */}
      <div className="p-6 rounded-2xl bg-brand-accent/5 border border-brand-accent/20 flex items-start gap-4 mb-12">
        <AlertCircle className="h-6 w-6 text-brand-accent shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Clé d'API requise</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pour interagir avec nos endpoints, vous devez configurer l'en-tête de requête <code className="text-brand-accent">X-API-KEY</code> contenant votre clé client générée depuis votre tableau de bord.
          </p>
        </div>
      </div>
    </div>
  );
}
