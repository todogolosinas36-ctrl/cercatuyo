import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>CercaTuyo — Farmacias, colectivos y oficios en el Sur Tucumano</title>
        <meta
          name="description"
          content="Información útil y actualizada del sur tucumano: farmacias de turno, horarios de colectivos y trabajadores independientes de confianza en Aguilares, Concepción, Monteros y más."
        />

        {/* Metadatos Open Graph para redes sociales y mensajería */}
        <meta property="og:title" content="CercaTuyo — Farmacias, colectivos y oficios en el Sur Tucumano" />
        <meta
          property="og:description"
          content="Información útil y actualizada del sur tucumano: farmacias de turno, horarios de colectivos y trabajadores independientes de confianza."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og.png" />
        <meta property="og:locale" content="es_AR" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CercaTuyo — Farmacias, colectivos y oficios en el Sur Tucumano" />
        <meta
          name="twitter:description"
          content="Información útil y actualizada del sur tucumano: farmacias de turno, horarios de colectivos y trabajadores independientes de confianza."
        />
        <meta name="twitter:image" content="/og.png" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
