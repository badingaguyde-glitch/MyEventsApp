import { notFound } from "next/navigation";
import { features } from "@/data/features";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Ticket, ShieldCheck, Users, QrCode } from "lucide-react";

interface PageDrops {
    params: Promise<{ slug: string }>;
}

export default async function FeatureDetail({ params }: PageDrops) {
    const { slug } = await params;
    const feature = features.find((f) => f.slug === slug);

    if (!feature) {
        notFound();
    }

    const IconComponent =
        feature.slug === "billetterie" ? Ticket :
            feature.slug === "qr-code" ? QrCode :
                feature.slug === "gestion-participants" ? Users : ShieldCheck;

    return (
        <div className="py-20 max-w-3xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 text-sm font-medium">
                <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
            </Link>
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-brand-accent/10 p-4 rounded-2xl text-brand-accent w-fit">
                    <IconComponent className="h-8 w-8" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-brand-accent">
                    Fonctionnalité Bantu
                </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-8">{feature.title}</h1>
            <p className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-12">
                {feature.description}
            </p>
            <h2 className="text-xl font-bold text-white mb-6">Avantages clés</h2>
            <div className="grid gap-4 mb-16">
                {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <CheckCircle className="h-5 w-5 text-brand-accent mt-0.5" />
                        <span className="text-zinc-200 text-sm md:text-base">{benefit}</span>
                    </div>
                ))}
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-brand-accent/10 to-transparent border border-brand-accent/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">Prêt à tester cette fonctionnalité ?</h3>
                    <p className="text-sm text-zinc-400">Lancez votre événement sur BANTU en quelques minutes.</p>
                </div>
                <a
                    href="https://my-events-app-xi.vercel.app"
                    className="bg-brand-accent hover:bg-brand-accentHover text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md"
                >
                    Accéder au Dashboard
                </a>
            </div>
        </div>
    )
}