import { CheckCircle2, ShieldCheck } from "lucide-react";

export default function StatusPage() {
    const services = [
        { name: "API REST", status: "Opérationnel" },
        { name: "Paiements Mobile Money & Cartes", status: "Opérationnel" },
        { name: "Validation par QR Code", status: "Opérationnel" },
        { name: "Serveur de Tâches d'Emails (TaskQueue)", status: "Opérationnel" },
        { name: "Notification Push", status: "Opérationnel" },
        { name: "Stockage des Médias", status: "Opérationnel" },
    ];

    return (
        <div className="py-20 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-green-500/10 p-2.5 rounded-xl text-green-400">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white">Statut des services</h1>
            </div>

            <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20 flex items-center gap-4 mb-12">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-semibold text-sm">Tous les systèmes sont opérationnels</span>
            </div>

            <div className="space-y-4">
                {services.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-sm font-medium text-zinc-300">{service.name}</span>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-green-400 font-bold uppercase tracking-wider">{service.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}