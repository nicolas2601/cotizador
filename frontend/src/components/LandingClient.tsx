"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  Calculator, 
  FileText, 
  Cloud, 
  Lock, 
  Zap,
  ChevronDown,
  ChevronUp,
  LineChart,
  Clock,
  Briefcase
} from "lucide-react";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "¿Cuánto cuesta el software de cotizaciones B2B en Colombia?",
      a: "Tenemos planes accesibles para agencias y profesionales independientes desde $29 USD/mes, con una prueba gratuita de 14 días para asegurar tu retorno de inversión."
    },
    {
      q: "¿Cuánto tiempo tarda en verse resultados?",
      a: "En menos de 2 horas puedes tener tu primera regla de precio configurada y tu PDF listo para enviar a tu primer cliente."
    },
    {
      q: "¿Qué pasa si no quedo satisfecho?",
      a: "Tienes 14 días de garantía. Te ayudamos a configurarlo; si no logras cotizar más rápido que con tu método actual, cancelas con un clic y te devolvemos el dinero."
    },
    {
      q: "¿Cuál es la diferencia entre Tikno y usar Excel?",
      a: "Excel no es interactivo para el cliente final, es propenso a errores humanos al copiar/pegar celdas ocultas y no genera PDFs con diseño premium de forma automática."
    },
    {
      q: "¿Necesito experiencia previa para contratar este cotizador automático?",
      a: "No. Si sabes cómo cobras tu trabajo hoy (ej. $100 base + $50 por hora), puedes usar Tikno. Nuestro motor de precios convierte tu lógica de negocio en una interfaz sencilla."
    },
    {
      q: "¿Mis clientes finales pueden usar el cotizador solos?",
      a: "Sí, puedes hacer tu link público para que prospectos coticen solos y reciban la propuesta de inmediato, filtrando curiosos y acelerando tus ventas."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* SECCIÓN 2: HERO */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>Nuevo: Automatiza tu flujo de ventas</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
              Cierra más ventas con <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">cotizaciones automáticas</span> que se envían solas.
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-slate-600 mb-6 leading-relaxed max-w-3xl mx-auto">
              Deja de perder horas en Excel y Word. Convierte tus precios en un formulario interactivo y entrega propuestas PDF perfectas al instante.
            </motion.p>

            <motion.p variants={fadeIn} className="text-base text-slate-500 mb-10 max-w-2xl mx-auto">
              Ayudamos a agencias y negocios B2B a automatizar su flujo de ventas, eliminando el trabajo manual para que coticen 10x más rápido.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/cotizadores">
                <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 group text-lg">
                  Crear mi primer cotizador gratis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
            
            <motion.p variants={fadeIn} className="mt-6 text-sm text-slate-500 font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              +2.500 horas de trabajo manual ahorradas a nuestros clientes beta.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN 3: QUIÉNES SOMOS */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center space-y-6"
          >
            <motion.h2 variants={fadeIn} className="text-3xl font-bold text-slate-900">
              Nuestra Historia
            </motion.h2>
            <motion.p variants={fadeIn} className="text-lg text-slate-600 leading-relaxed">
              Nacimos al ver cómo agencias de diseño web y despachos de reformas perdían negocios rentables por demorar días en enviar una propuesta comercial. Notamos que la barrera no era el precio, sino la fricción operativa de armar PDFs personalizados.
            </motion.p>
            <motion.p variants={fadeIn} className="text-lg text-slate-600 leading-relaxed">
              Creemos que la tecnología debe trabajar para ti, no al revés. Tu tiempo es para ejecutar y escalar, no para calcular márgenes en hojas de cálculo.
            </motion.p>
            <motion.p variants={fadeIn} className="text-xl font-semibold text-indigo-600 mt-4">
              Por eso, cuando trabajas con nosotros, tú recuperas el control de tu tiempo comercial.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN 4: EL PROBLEMA */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ¿Sientes que haces trabajo gratis cada vez que cotizas un nuevo proyecto?
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6 text-red-500">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Lo que ves</h3>
              <p className="text-slate-600">Ves tu bandeja de enviados llena de propuestas que tomaron horas armar y que los clientes nunca responden o ignoran.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 text-orange-500">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Lo que sientes</h3>
              <p className="text-slate-600">Sientes agotamiento al tener que abrir ese viejo Excel, buscar la plantilla de Word, copiar, pegar y rogar no haber dejado el nombre del cliente anterior.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-6 text-rose-500">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Lo que pierdes</h3>
              <p className="text-slate-600">Pierdes la inercia de la venta. Mientras tú tardas dos días en cotizar, tu competencia lo hizo en la misma llamada.</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-xl text-slate-700 font-medium">
              El problema no está en tus precios. Está en tu proceso manual. <br className="hidden sm:block" />
              <span className="text-indigo-600 font-bold">Y eso tiene solución.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN 5: LA SOLUCIÓN */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-600 font-semibold tracking-wide uppercase mb-3">Tikno Pricing Engine & PDF Generator</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Cómo nuestro creador de cotizaciones transforma tu embudo
            </h3>
            <p className="text-lg text-slate-600">
              Convertimos tu cálculo de precios más complejo en una experiencia fluida e inmediata.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  title: "Cotiza en tiempo real",
                  desc: "gracias a formularios interactivos personalizados que guían a tu cliente.",
                  icon: <Zap className="w-6 h-6 text-yellow-500" />
                },
                {
                  title: "Reduce errores de cálculo a cero",
                  desc: "gracias a nuestras reglas de precios avanzadas y centralizadas.",
                  icon: <Calculator className="w-6 h-6 text-indigo-500" />
                },
                {
                  title: "Entrega una imagen premium",
                  desc: "gracias a propuestas PDF generadas automáticamente con tu branding.",
                  icon: <FileText className="w-6 h-6 text-cyan-500" />
                },
                {
                  title: "Aumenta tu tasa de cierre",
                  desc: "gracias a entregar el precio en el punto máximo de interés del cliente.",
                  icon: <LineChart className="w-6 h-6 text-emerald-500" />
                }
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{benefit.title}</h4>
                    <p className="text-slate-600">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="pt-6"
              >
                <Link href="/cotizadores">
                  <button className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                    Ver cómo funciona la magia <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center p-8"
            >
              {/* Mockup UI representation */}
              <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-10 bg-indigo-50 rounded border border-indigo-100 w-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-10 bg-slate-50 rounded border border-slate-100 w-full"></div>
                  </div>
                  <div className="pt-4 flex justify-between items-center border-t border-slate-50 mt-4">
                    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-8 bg-indigo-600 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: PROCESO PASO A PASO */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Así trabajamos contigo para automatizar tus ventas</h2>
            <p className="text-slate-400 text-lg">Un flujo de trabajo diseñado para eliminar la fricción.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Configura tus variables",
                desc: "Defines tus servicios, precios base y multiplicadores (ej. metros cuadrados o páginas web)."
              },
              {
                step: "2",
                title: "Tikno crea tu interfaz",
                desc: "Generamos un formulario web interactivo y profesional para ti o tus clientes."
              },
              {
                step: "3",
                title: "El cliente cotiza",
                desc: "Ingresa sus requerimientos y nuestro motor calcula todo en milisegundos."
              },
              {
                step: "4",
                title: "El PDF llega al correo",
                desc: "Un documento inmaculado con tu marca, el desglose y el precio final llega a su bandeja."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-black text-slate-800 absolute -top-8 -left-4 z-0">{item.step}</div>
                <div className="relative z-10 pt-4 border-t-2 border-indigo-500">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-indigo-300 italic font-medium">Desde la primera configuración hasta el PDF final, acompañamos cada etapa.</p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 7: PRUEBA SOCIAL */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Resultados reales para agencias reales</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p className="text-lg text-slate-700 italic mb-6">&quot;Antes tardábamos 3 días en enviar un presupuesto de obra. Ahora lo hacemos desde el móvil frente al cliente. La tasa de conversión subió por pura velocidad.&quot;</p>
              <div>
                <p className="font-bold text-slate-900">Javier R.</p>
                <p className="text-sm text-slate-500">CEO, Empresa de Reformas</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p className="text-lg text-slate-700 italic mb-6">&quot;Mis clientes de diseño web aman la transparencia. Juegan con el cotizador y eligen el plan más caro sin que yo intervenga. Es un vendedor automático.&quot;</p>
              <div>
                <p className="font-bold text-slate-900">Sofía T.</p>
                <p className="text-sm text-slate-500">Fundadora, Agencia Digital</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-slate-100 pt-16">
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">{"<200ms"}</div>
              <p className="text-slate-600 font-medium">Motor de cálculo</p>
            </div>
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">100%</div>
              <p className="text-slate-600 font-medium">Precisión en fórmulas</p>
            </div>
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">+45%</div>
              <p className="text-slate-600 font-medium">Cierre de ventas</p>
            </div>
            <div>
              <div className="text-4xl font-black text-indigo-600 mb-2">0 hrs</div>
              <p className="text-slate-600 font-medium">Trabajo manual</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 8: POR QUÉ ELEGIRNOS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Lo que nos hace diferentes al resto de herramientas</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <Calculator className="w-5 h-5" />,
                title: "Motor sin código",
                desc: "Usa reglas aritméticas reales sin programar ni tocar código."
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Diseño en un clic",
                desc: "Olvida los editores drag & drop lentos; nosotros generamos el diseño limpio automáticamente."
              },
              {
                icon: <Cloud className="w-5 h-5" />,
                title: "Todo en la nube",
                desc: "Tus precios centralizados. Si cambias una tarifa, se actualiza en todo el sistema."
              },
              {
                icon: <Lock className="w-5 h-5" />,
                title: "Privacidad B2B",
                desc: "Cada entorno de cliente está aislado. Tus márgenes y fórmulas son 100% privados."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-start hover:border-indigo-100 hover:shadow-md transition-all"
              >
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center max-w-2xl mx-auto bg-indigo-50 border border-indigo-100 rounded-2xl p-8">
            <p className="text-indigo-900 font-medium">
              <span className="font-bold">Garantía Incondicional:</span> Si en 14 días no logras enviar cotizaciones más rápido que con Excel, te devolvemos tu inversión sin hacer preguntas.
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 9: FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="font-bold text-slate-900">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 py-4 bg-white text-slate-600 border-t border-slate-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 10: CTA FINAL */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Tu competencia ya está automatizando. Es tu turno.</h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            No dejes que un PDF lento te robe otro cliente. La inmediatez es la nueva ventaja competitiva en ventas B2B.
          </p>
          
          <Link href="/cotizadores">
            <button className="px-8 py-4 bg-white text-indigo-900 hover:bg-slate-50 font-bold rounded-xl shadow-xl transition-all duration-200 group text-lg inline-flex items-center gap-2">
              Agenda tu sesión de configuración gratuita
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
          <p className="mt-4 text-sm text-indigo-200">Sin compromisos. Empieza a cotizar hoy.</p>
          
          <div className="mt-16 pt-8 border-t border-indigo-500/30 flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-indigo-200">
            <span>soporte@tikno.pro</span>
            <span className="hidden sm:inline">•</span>
            <span>WhatsApp Disponible</span>
            <span className="hidden sm:inline">•</span>
            <span className="italic">Queremos verte cerrar ese contrato gigante. Hablemos.</span>
          </div>
        </div>
      </section>

    </div>
  );
}
