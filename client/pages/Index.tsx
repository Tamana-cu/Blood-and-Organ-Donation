import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, Activity, Shield, Users, ArrowRight, CheckCircle2, Droplets, HeartPulse } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Index() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-8 h-8 text-primary fill-primary group-hover:scale-110 transition-transform duration-300" />
              <Activity className="w-4 h-4 text-secondary absolute -right-1 -bottom-1" />
            </div>
            <span className="text-2xl font-extrabold tracking-tighter gradient-text">LifeLink</span>
          </Link>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors dark:text-gray-300">Login</Link>
            <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              <Link to="/register">Join Now</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-40 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary border border-primary text-primary text-xs font-black mb-8 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                10,000+ matches this month
              </div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.05] tracking-tight dark:text-white">
                Giving Life a <br />
                <span className="gradient-text">Second Chance.</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed uppercase tracking-widest text-[12px] font-black opacity-80">
                The world's most advanced donation network. <br />
                Connecting donors and recipients in real-time.
              </p>
              <div className="flex flex-col sm:row gap-4">
                <Button size="lg" className="rounded-full px-10 h-16 text-lg shadow-2xl shadow-primary/30 group bg-primary hover:bg-primary/90" asChild>
                  <Link to="/register?role=donor">
                    Become a Donor
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-10 h-16 text-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur border-border" asChild>
                  <Link to="/register?role=recipient">Find Matching Donor</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/20 border border-white/20 aspect-video lg:aspect-square group"
            >
              <img 
                src="/assets/hero-medical.png" 
                alt="Modern Medical Network"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
                    <CheckCircle2 className="text-green-400 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl">Verified Profiles</p>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Medical Approval Guaranteed</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Droplets, title: "Blood Matching", desc: "Advanced algorithmic matching based on blood type and proximity.", color: "bg-red-500/10 text-red-600" },
              { icon: HeartPulse, title: "Organ Donation", desc: "Secure pipeline for organ donation registration and recipient tracking.", color: "bg-green-500/10 text-green-600" },
              { icon: Shield, title: "Safe Network", desc: "Bank-grade encryption for all medical and personal information.", color: "bg-blue-500/10 text-blue-600" }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none border border-border/50"
              >
                <div className={`w-16 h-16 rounded-3xl ${f.color} flex items-center justify-center mb-8`}>
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 dark:text-white">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="rounded-[4rem] bg-gray-950 p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary bg-opacity-20 rounded-full blur-[100px] -mr-40 -mt-40" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">Ready to join <br/>the mission?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="rounded-full px-12 h-16 text-lg bg-white text-black hover:bg-gray-100">Get Started</Button>
                <Button size="lg" variant="outline" className="rounded-full px-12 h-16 text-lg text-white border-white border-opacity-40 bg-transparent hover:bg-white bg-opacity-10 hover:text-white transition-all">Learn More</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="container max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-black text-xl tracking-tighter uppercase">LifeLink</span>
          </div>
          <p className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase">
            &copy; 2026 LifeLink Advanced Systems. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
