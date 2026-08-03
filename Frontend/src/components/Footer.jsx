import React from 'react';
import { Calendar, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-32 border-t border-light py-20 text-center">
            <div className="flex flex-col items-center gap-12">
                <div className="space-y-6 max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-3 text-2xl font-black tracking-tighter text-white">
                        <img 
                            src="/logo.png" 
                            alt="BANTU Logo" 
                            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
                        />
                        <span className="uppercase tracking-widest text-lg">BANTU MY EVENT</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Connecting global communities through unforgettable experiences. The nexus for professional event orchestration and discovery.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row flex-wrap justify-center gap-10 md:gap-16 w-full">
                    <div className="space-y-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 w-full md:w-auto text-center md:text-left">
                        <a href="#" className="p-3 text-slate-400 hover:text-primary transition-all no-underline text-inherit">
                                Platform
                        </a>
                        <ul className="space-y-3">
                            <a className="hover:text-primary transition-colors cursor-pointer">Discovery<br /></a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Ticketing<br/></a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Verification</a>
                        </ul>
                    </div>
                    <div className="space-y-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 w-full md:w-auto text-center md:text-left">
                        <p className="text-white">Social Nexus</p>
                        <div className="flex justify-center md:justify-start gap-4">
                            <a href="#" className="p-3 glass rounded-xl text-slate-400 hover:text-primary transition-all">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-3 glass rounded-xl text-slate-400 hover:text-primary transition-all">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="p-3 glass rounded-xl text-slate-400 hover:text-primary transition-all">
                                <Github size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-20 pt-8 border-t border-light flex flex-col items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                <p>© 2026 MyEvents Orchestration Systems. All rights secured.</p>
                <div className="flex gap-8">
                    <span className="hover:text-white transition-colors cursor-pointer">Privacy Protocol</span>
                    <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
