import { ArrowLeft, Terminal, ShieldAlert, Cpu } from "lucide-react";
import Link from "next/link";

export default function RestApiDocsPage() {
  return (
    <div className="py-20 max-w-5xl mx-auto px-4">
      <div className="mb-12">
        <Link href="/docs" className="text-sm font-bold text-brand-accent hover:text-brand-accentHover inline-flex items-center gap-2 mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour à la documentation générale
        </Link>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6">Référence de l'API REST BANTU</h1>
        <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl">
          Découvrez la liste complète des endpoints de notre API d'événements et Yoklama. Tous les appels doivent être authentifiés et sécurisés comme décrit ci-dessous.
        </p>
      </div>

      {/* Security Info */}
      <div className="p-8 rounded-3xl bg-rose-950/20 border border-rose-900/30 space-y-4 mb-12">
        <div className="flex items-center gap-3 text-rose-400">
          <ShieldAlert className="h-6 w-6" />
          <h3 className="text-xl font-bold">Sécurité & Validation de l'Origine</h3>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Pour des raisons de sécurité, toutes les requêtes HTTP envoyées à notre API doivent inclure les headers suivants :
        </p>
        <div className="bg-black/50 p-6 rounded-2xl font-mono text-xs text-zinc-300 border border-white/5 space-y-2">
          <div>
            <strong className="text-brand-accent">x-bantu-client-key</strong>: <code className="text-zinc-400">&lt;CLE_CLIENT_APPLI_PRIVEE&gt;</code>
            <p className="text-[10px] text-zinc-500 mt-1">Obligatoire pour toutes les requêtes. Permet de s'assurer que l'appel provient exclusivement des applications officielles Web/Mobile BANTU.</p>
          </div>
          <div className="pt-2 border-t border-white/5">
            <strong className="text-brand-accent">Authorization</strong>: <code className="text-zinc-400">Bearer &lt;JWT_TOKEN&gt;</code>
            <p className="text-[10px] text-zinc-500 mt-1">Requis pour tous les endpoints protégés (création d'événements, achat de ticket,Yoklama etc.).</p>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-12">
        
        {/* USERS API */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-brand-accent" /> Gestion des Utilisateurs (Auth)
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded">POST</span>
                <code className="text-sm font-bold text-white">/api/user</code>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Inscription d'un nouvel utilisateur. Initialise le forfait <code className="text-brand-accent">free</code> par défaut.</p>
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Request Body (JSON)</h4>
              <pre className="bg-black/40 p-4 rounded-xl font-mono text-xs text-zinc-300 mb-4">
{`{
  "name": "Alain",
  "lastName": "Jospin",
  "email": "alain@example.com",
  "password": "securedpassword"
}`}
              </pre>
            </div>

            <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded">POST</span>
                <code className="text-sm font-bold text-white">/api/user/login</code>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Authentification de l'utilisateur. Retourne le jeton JWT et le plan d'abonnement.</p>
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Response Payload (200 OK)</h4>
              <pre className="bg-black/40 p-4 rounded-xl font-mono text-xs text-zinc-300">
{`{
  "token": "eyJhbGciOi...",
  "plan": "free",
  "email": "alain@example.com"
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* EVENTS API */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-brand-accent" /> Gestion des Événements
          </h2>

          <div className="space-y-6">
            <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded">POST</span>
                <code className="text-sm font-bold text-white">/api/events</code>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Création d'un événement. Si l'organisateur a un forfait <code className="text-brand-accent">free</code>, la capacité maximale autorisée est de 100 participants. L'ajout d'équipes (coOrganizers) est réservé au forfait <code className="text-brand-accent">enterprise</code>.
              </p>
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Request Body (FormData)</h4>
              <pre className="bg-black/40 p-4 rounded-xl font-mono text-xs text-zinc-300">
{`title: Conférence annuelle Tech
capacity: 100
price: 0
coOrganizers: part1@example.com, part2@example.com (Optionnel, emails)
image: [File Upload]`}
              </pre>
            </div>

            <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded">GET</span>
                <code className="text-sm font-bold text-white">/api/events</code>
              </div>
              <p className="text-sm text-zinc-400">Liste tous les événements publics actifs.</p>
            </div>
          </div>
        </section>

        {/* TICKETS & YOKLAMA API */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-brand-accent" /> Billetterie, Yoklama & Remboursements
          </h2>

          <div className="space-y-6">
            <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded">POST</span>
                <code className="text-sm font-bold text-white">/api/tickets/verify</code>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Validation individuelle d'un ticket par scanner Yoklama. Les co-organisateurs officiels de l'événement sont pleinement autorisés à utiliser cet endpoint.</p>
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Request Body (JSON)</h4>
              <pre className="bg-black/40 p-4 rounded-xl font-mono text-xs text-zinc-300">
{`{
  "eventId": "66abef...",
  "ticketCode": "BANTU-KJLK-89"
}`}
              </pre>
            </div>

            <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded">POST</span>
                <code className="text-sm font-bold text-white">/api/tickets/bulk-cancel</code>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Annulation et remboursement groupé de billets. Réservé exclusivement aux comptes de forfait <code className="text-brand-accent">enterprise</code>.</p>
              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Request Body (JSON)</h4>
              <pre className="bg-black/40 p-4 rounded-xl font-mono text-xs text-zinc-300">
{`{
  "ticketIds": [
    "66bd12...",
    "66bd34..."
  ]
}`}
              </pre>
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}
