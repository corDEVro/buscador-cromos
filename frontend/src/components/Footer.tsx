/**
 * Pie de página con el sello de Cordevro enlazando a la landing
 * (cordevro.netlify.app). Se muestra al final de todas las pantallas.
 *
 * El logo vive en /public/logo-cordevro.png para que Vite lo sirva tal cual.
 */
export default function Footer() {
  return (
    <footer className="flex justify-center pb-6 pt-4">
      <a
        href="https://cordevro.netlify.app"
        target="_blank"
        rel="noopener noreferrer"
        title="Visita la web de Cordevro"
        className="inline-flex items-center gap-2.5 rounded-2xl bg-white/80 px-4 py-2 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <img src="/logo-cordevro.png" alt="Logotipo de Cor{dev}ro" className="h-8 w-auto" />
        <span className="text-[11px] leading-tight font-bold text-slate-400">
          Hecho con ⚽ por
          <br />
          Cordevro
        </span>
      </a>
    </footer>
  )
}
