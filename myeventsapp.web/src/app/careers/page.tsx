import { Users, Briefcase, MapPin, ArrowRight } from "lucide-react";

export default function CareersPage() {
  const jobs = [
    { title: "Développeur Fullstack React / Node.js", type: "CDI - Temps plein", location: "Hybride / Distance", dept: "Ingénierie" },
    { title: "Product Designer UI/UX (Showcase & Mobile)", type: "CDI - Temps plein", location: "Paris / Hybride", dept: "Design" },
    { title: "Customer Support Specialist (Mobile Money Expert)", type: "CDI - Temps plein", location: "Dakar / Sur site", dept: "Support" },
    { title: "Growth Marketing Specialist", type: "Alternance / Stage", location: "Hybride / Distance", dept: "Marketing" }
  ];

  return (
    <div className="py-20 max-w-4xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full mb-4 inline-block">
          Carrières
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6">Rejoignez l'aventure BANTU</h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Nous concevons la prochaine génération d'outils d'expérience événementielle. Rejoignez une équipe passionnée et ambitieuse.
        </p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {jobs.map((job, idx) => (
          <div 
            key={idx} 
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-brand-accent/30 transition-all cursor-pointer group"
          >
            <div>
              <span className="text-xs text-brand-accent font-bold uppercase tracking-wider bg-brand-accent/5 px-2.5 py-1 rounded-md mb-2 inline-block">
                {job.dept}
              </span>
              <h3 className="text-lg font-bold text-white mb-2">{job.title}</h3>
              <div className="flex gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.type}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
              </div>
            </div>
            <button className="flex items-center gap-1 text-sm font-bold text-brand-accent group-hover:text-brand-accentHover transition-colors shrink-0">
              Postuler <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
