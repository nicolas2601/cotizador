import { Metadata } from "next";
import LandingClient from "@/components/LandingClient";

export const metadata: Metadata = {
  title: "Software de Cotizaciones Automáticas B2B | Tikno",
  description: "Acelera tus ventas. Crea cotizadores interactivos y genera propuestas PDF automáticas en segundos. Agenda tu demo gratis en Tikno.",
  keywords: "Software de cotizaciones B2B, creador de cotizaciones, cotizador automático, propuestas PDF para clientes, automatizar ventas B2B, software para agencias",
  openGraph: {
    title: "Software de Cotizaciones Automáticas B2B | Tikno",
    description: "Crea cotizadores interactivos y genera propuestas PDF automáticas en segundos.",
    type: "website",
  }
};

export default function Home() {
  return <LandingClient />;
}
