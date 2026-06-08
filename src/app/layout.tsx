import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { initDb } from '@/lib/db'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: {
    default:  'Matt Wright — Graphic Designer & FiveM Server Developer',
    template: '%s — Matt Wright',
  },
  description:
    'Matt Wright — freelance graphic designer, GFX creator, and FiveM server developer. Clean branding, Discord graphics, FiveM UI, custom server development, and the Matt W Studio GFX store.',
  authors: [{ name: 'Matt Wright' }],
  metadataBase: new URL(process.env.BASE_URL ?? 'https://mattwright.online'),
  openGraph: {
    siteName: 'Matt Wright',
    type: 'website',
  },
  icons: {
    icon:  '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
}

let dbInit = false
async function ensureDb() {
  if (!dbInit && process.env.DATABASE_URL) {
    try { await initDb(); dbInit = true } catch (e) { console.error('[DB] Init error:', e) }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await ensureDb()

  return (
    <html lang="en" className={inter.variable}>
      <head />
      <body>
        <div className="scroll-progress" id="scroll-progress" aria-hidden="true" />
        <Header />
        {children}
        <Footer />
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  // Scroll progress bar
  var bar=document.getElementById('scroll-progress');
  function upd(){
    var max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    if(bar) bar.style.transform='scaleX('+Math.min(1,window.scrollY/max)+')';
    // Nav scrolled state
    var nav=document.querySelector('.site-nav');
    if(nav) nav.classList.toggle('scrolled',window.scrollY>22);
  }
  window.addEventListener('scroll',upd,{passive:true});
  upd();
  // Scroll reveal
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}
      });
    },{threshold:0.07,rootMargin:'0px 0px -20px 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){obs.observe(el);});
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('visible');});
  }
})();
            `,
          }}
        />
      </body>
    </html>
  )
}
