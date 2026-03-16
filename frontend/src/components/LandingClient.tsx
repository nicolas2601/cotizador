"use client";

import { useState, useRef } from "react";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useTransform, 
  useSpring,
  useInView 
} from "framer-motion";
import { 
  ArrowRight, 
  Calculator, 
  Zap,
  ChevronDown,
  ShieldCheck,
  Layers,
  Sparkles,
  Play
} from "lucide-react";
import Link from "next/link";

// --- COMPONENTS ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] contrast-150 brightness-150 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
);

const ParallaxElement = ({ children, speed = 0.5 }: { children: React.ReactNode, speed?: number }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return <motion.div style={{ y: smoothY }}>{children}</motion.div>;
};

const BentoCard = ({ title, desc, icon, size = "1x1", delay = 0 }: { title: string, desc: string, icon: React.ReactNode, size?: "1x1" | "2x1" | "1x2", delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.45, 0.32, 0.9] }}
      className={`relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-md p-8 md:p-10 flex flex-col justify-between hover:bg-white/[0.08] hover:border-white/10 transition-all duration-500
        ${size === "2x1" ? "md:col-span-2" : ""}
        ${size === "1x2" ? "md:row-span-2" : ""}
      `}
    >
      <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 scale-[2.5] origin-top-right">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tighter leading-none">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-base md:text-lg font-light">{desc}</p>
      </div>
      <div className="mt-10 relative z-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 opacity-40 group-hover:opacity-100 group-hover:gap-4 transition-all duration-500">
          Tecnología Tikno <ArrowRight className="w-3 h-3" />
        </div>
      </div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors duration-700" />
    </motion.div>
  );
};

export default function LandingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  const faqs = [
    {
      q: "¿Cuánto cuesta el software de cotizaciones B2B?",
      a: "Ofrecemos planes escalables para agencias y profesionales. Desde $29 USD/mes con una prueba gratuita de 14 días para asegurar el retorno de inversión."
    },
    {
      q: "¿Es seguro para mis datos y fórmulas?",
      a: "Utilizamos cifrado de grado bancario y entornos aislados por negocio. Tus márgenes y estrategias son 100% privados y seguros."
    },
    {
      q: "¿Puedo integrar mi propia marca?",
      a: "Totalmente. El motor de branding de Tikno adapta cada PDF a tu identidad visual, tipografías y colores corporativos automáticamente."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <NoiseOverlay />

      {/* --- NAVBAR --- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-[900] text-white tracking-[-0.04em]">
            TIKNO<span className="text-indigo-500">.</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-8">
            <Link href="/pricing" className="text-[11px] font-[800] uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors duration-300">
              Precios
            </Link>
            <Link href="/docs" className="text-[11px] font-[800] uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors duration-300">
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors duration-300">
              Iniciar sesion
            </Link>
            <Link href="/registro">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-[800] rounded-full transition-colors duration-300"
              >
                Empezar gratis
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <ParallaxElement speed={-0.15}>
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-600/10 blur-[160px] rounded-full" />
        </ParallaxElement>
        <ParallaxElement speed={-0.05}>
          <div className="absolute top-[30%] left-[-15%] w-[900px] h-[900px] bg-cyan-600/5 blur-[180px] rounded-full" />
        </ParallaxElement>
      </div>

      {/* --- HERO SECTION --- */}
      <section ref={heroRef} className="relative min-h-[110vh] flex items-center justify-center pt-20 overflow-hidden z-10">
        {/* Video Background Container */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30 mix-blend-lighten scale-110"
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          {/* Overlays to ensure legibility and integration */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]" />
          <div className="absolute inset-0 bg-[#020617]/20 backdrop-blur-[2px]" />
        </div>

        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
            className="mb-12 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-indigo-300 text-[10px] font-black uppercase tracking-[0.4em]"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Sistema de Cotización Inteligente</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-[900] tracking-[-0.06em] text-white mb-12 leading-[0.85] text-center">
            VENDE MÁS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-200 to-indigo-500/50">AL INSTANTE.</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-400 mb-16 max-w-3xl mx-auto leading-tight font-light tracking-tight">
            Elimina la burocracia comercial. Tikno transforma tus cálculos en una experiencia de venta fluida y automática.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link href="/registro">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-6 bg-white text-black font-[900] rounded-full shadow-2xl transition-all duration-500 flex items-center gap-4 group text-xl"
              >
                EMPEZAR AHORA
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
              </motion.button>
            </Link>
            <motion.button 
              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)" }}
              className="px-12 py-6 border border-white/10 text-white font-bold rounded-full transition-all duration-500 flex items-center gap-4 text-xl group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 transition-colors duration-500">
                <Play className="w-4 h-4 fill-current ml-1" />
              </div>
              VER DEMO
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* --- BENTO GRID --- */}
      <section className="py-40 relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mb-24 text-left max-w-4xl"
          >
            <h2 className="text-indigo-500 font-[900] uppercase tracking-[0.5em] text-[10px] mb-6">Arquitectura Tikno</h2>
            <h3 className="text-6xl md:text-8xl font-[900] text-white mb-10 tracking-[-0.04em] leading-[0.9]">
              El motor que <br /> reescribe tus cierres.
            </h3>
            <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed tracking-tight">
              Diseñado para agencias que no tienen tiempo que perder. Un núcleo aritmético potente envuelto en una interfaz de grado editorial.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[300px] md:auto-rows-[350px]">
            <BentoCard 
              size="2x1"
              delay={0.1}
              icon={<Calculator className="w-8 h-8" />}
              title="Motor Aritmético Dinámico"
              desc="Configura reglas basadas en cualquier variable: m², horas, licencias o complejidad. Tikno calcula tus márgenes con precisión absoluta en tiempo real."
            />
            <BentoCard 
              size="1x2"
              delay={0.2}
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Seguridad de Grado Bancario"
              desc="Entornos aislados y cifrados. Tus fórmulas estratégicas y datos de clientes están protegidos bajo los estándares de seguridad más rigurosos de la industria."
            />
            <BentoCard 
              delay={0.3}
              icon={<Zap className="w-8 h-8" />}
              title="Cierre en <200ms"
              desc="Generación instantánea. Entrega la propuesta formal mientras el cliente aún está procesando la llamada. La inmediatez es tu mayor ventaja."
            />
            <BentoCard 
              delay={0.4}
              icon={<Layers className="w-8 h-8" />}
              title="Branding Editorial"
              desc="Olvida los PDFs genéricos. Generamos documentos inmaculados que respiran tu marca, adaptándose dinámicamente a la longitud de tu oferta."
            />
          </div>
        </div>
      </section>

      {/* --- SCROLL REVEAL TEXT (EDITORIAL) --- */}
      <section className="py-60 bg-white text-black relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-40">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="max-w-4xl"
            >
              <h4 className="text-[10rem] md:text-[15rem] font-[900] tracking-[-0.08em] mb-12 leading-[0.75] opacity-[0.05] absolute -top-20 left-0 select-none">FREEDOM</h4>
              <h4 className="text-7xl md:text-[10rem] font-[900] tracking-[-0.06em] mb-12 leading-[0.8] relative z-10">MÁS <br /> LIBERTAD.</h4>
              <p className="text-3xl md:text-5xl font-light text-slate-500 leading-[1.1] tracking-tight relative z-10">
                Recupera las horas perdidas en Word y Excel. Tikno te permite enfocarte en lo que realmente importa: <span className="text-black font-black underline decoration-indigo-500 underline-offset-8">hacer crecer tu negocio.</span>
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="max-w-4xl ml-auto text-right"
            >
              <h4 className="text-[10rem] md:text-[15rem] font-[900] tracking-[-0.08em] mb-12 leading-[0.75] opacity-[0.05] absolute -bottom-20 right-0 select-none">GROWTH</h4>
              <h4 className="text-7xl md:text-[10rem] font-[900] tracking-[-0.06em] mb-12 leading-[0.8] relative z-10">MÁS <br /> CIERRES.</h4>
              <p className="text-3xl md:text-5xl font-light text-slate-500 leading-[1.1] tracking-tight relative z-10">
                En el B2B, la velocidad es confianza. Entrega resultados en el punto máximo de interés y <span className="text-black font-black underline decoration-cyan-500 underline-offset-8">multiplica tu tasa de conversión.</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-40 bg-[#020617] px-4 sm:px-6 lg:px-8 relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="mb-24 text-center">
            <h2 className="text-indigo-500 font-[900] uppercase tracking-[0.5em] text-[10px] mb-6 text-center">Preguntas</h2>
            <h3 className="text-5xl md:text-7xl font-[900] text-white mb-8 tracking-tighter">Sin dudas.</h3>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="border border-white/5 rounded-[2rem] overflow-hidden bg-white/5 backdrop-blur-md transition-all duration-500"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-10 py-8 text-left flex justify-between items-center hover:bg-white/[0.03] transition-colors group"
                >
                  <span className="font-bold text-white text-xl tracking-tight">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-transform duration-500 ${openFaq === index ? "rotate-180 bg-indigo-500 border-indigo-500" : ""}`}>
                    <ChevronDown className="w-4 h-4 text-white" />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.21, 0.45, 0.32, 0.9] }}
                    >
                      <div className="px-10 pb-10 text-slate-400 text-lg font-light leading-relaxed border-t border-white/5 pt-6">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-60 relative z-10 overflow-hidden text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-8xl md:text-[12rem] font-[900] text-white mb-12 tracking-[-0.08em] leading-none">
              ES TU <br /> TURNO.
            </h2>
            <p className="text-2xl md:text-3xl text-slate-500 mb-20 max-w-2xl mx-auto font-light tracking-tight leading-snug">
              Únete a las agencias que ya están operando a la velocidad del software.
            </p>
            <Link href="/registro">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="px-16 py-8 bg-indigo-600 text-white font-[900] rounded-full shadow-2xl transition-all duration-500 flex items-center gap-4 mx-auto text-2xl group"
              >
                EMPEZAR GRATIS
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform duration-500" />
              </motion.button>
            </Link>
            <p className="mt-12 text-xs text-slate-600 font-[900] uppercase tracking-[0.5em]">Sin compromisos • 100% Automático</p>
          </motion.div>
        </div>
        
        {/* Decorative Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/10 blur-[200px] rounded-full pointer-events-none" />
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-3xl font-[900] text-white tracking-[-0.06em]">TIKNO<span className="text-indigo-500">.</span></div>
          <div className="flex gap-12 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
            <Link href="/pricing" className="hover:text-white transition-colors duration-300">Precios</Link>
            <Link href="#" className="hover:text-white transition-colors duration-300">Privacidad</Link>
            <Link href="#" className="hover:text-white transition-colors duration-300">Terminos</Link>
            <Link href="#" className="hover:text-white transition-colors duration-300">Soporte</Link>
          </div>
          <p className="text-slate-600 text-[10px] font-bold tracking-widest uppercase">Bucaramanga, Col • 2026</p>
        </div>
      </footer>
    </div>
  );
}
