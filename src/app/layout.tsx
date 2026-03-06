import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Knowledge Work Center OS",
  description: "Unified AI skill runtime for market research, content, and product intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900 overflow-hidden h-screen w-screen selection:bg-zinc-200 selection:text-zinc-900`}
      >
        <div className="flex h-full w-full">
          {/* Left Sidebar: Fixed 240px */}
          <aside className="w-[240px] shrink-0 border-r border-zinc-200 bg-white flex flex-col items-stretch z-20 shadow-[1px_0_2px_rgba(0,0,0,0.02)]">
            <div className="h-14 border-b border-zinc-200 flex items-center px-4 shrink-0">
              <span className="font-bold text-sm tracking-tight text-zinc-900">KWC OS</span>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest px-2">Domains</div>
              <button className="text-left px-2 py-1.5 text-sm font-medium text-zinc-600 rounded hover:bg-zinc-100 hover:text-zinc-900 transition-colors">AI & ML</button>
              <button className="text-left px-2 py-1.5 text-sm font-medium text-zinc-600 rounded hover:bg-zinc-100 hover:text-zinc-900 transition-colors">Code Tools</button>
              <button className="text-left px-2 py-1.5 text-sm font-medium text-zinc-600 rounded hover:bg-zinc-100 hover:text-zinc-900 transition-colors">Fintech</button>
              <button className="text-left px-2 py-1.5 text-sm font-medium text-zinc-600 rounded hover:bg-zinc-100 hover:text-zinc-900 transition-colors">RBI Regulations</button>

              <div className="text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest mt-6 px-2">Saved Views</div>
              <button className="text-left px-2 py-1.5 text-sm font-medium text-zinc-600 rounded hover:bg-zinc-100 hover:text-zinc-900 transition-colors">Recent Signals</button>
              <button className="text-left px-2 py-1.5 text-sm font-medium text-zinc-600 rounded hover:bg-zinc-100 hover:text-zinc-900 transition-colors">My Drafts</button>
            </nav>
          </aside>

          {/* Main Feed: Fluid Central Pane */}
          <main className="flex-1 flex flex-col min-w-0 bg-zinc-50 relative z-0">
            {/* Header area for True Omnibar */}
            <header className="h-14 border-b border-zinc-200 flex items-center px-6 sticky top-0 bg-white/95 backdrop-blur z-10 shrink-0 shadow-sm">
              <div className="flex-1 max-w-xl flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded px-3 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] text-zinc-400 cursor-text hover:bg-white hover:border-zinc-300 transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span className="text-[13px] font-medium">Search signals or execute command (Cmd + K)</span>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto w-full relative">
              <div className="max-w-4xl mx-auto py-8 px-6">
                {children}
              </div>
            </div>
          </main>

          {/* Right Drawer: Vault / Read Later Fixed 280px */}
          <aside className="w-[280px] shrink-0 border-l border-zinc-200 bg-white flex flex-col z-20 shadow-[-1px_0_2px_rgba(0,0,0,0.02)]">
            <div className="h-14 border-b border-zinc-200 flex items-center px-4 shrink-0">
              <h2 className="font-bold text-sm text-zinc-900 tracking-tight">The Vault</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-zinc-50/50">
               {/* Read Later Placeholders */}
               <div className="border-l-[3px] border-l-blue-500 bg-white border border-zinc-200 rounded shadow-sm hover:shadow transition-shadow overflow-hidden cursor-pointer">
                 <div className="p-3">
                   <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest mb-1">AI</div>
                   <h3 className="text-xs font-semibold text-zinc-800 leading-snug break-words">New Transformer Architecture for Edge Devices</h3>
                 </div>
               </div>
               <div className="border-l-[3px] border-l-green-500 bg-white border border-zinc-200 rounded shadow-sm hover:shadow transition-shadow overflow-hidden cursor-pointer">
                 <div className="p-3">
                   <div className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest mb-1">Fintech</div>
                   <h3 className="text-xs font-semibold text-zinc-800 leading-snug break-words">RBI Guidelines on Digital Lending App Audits</h3>
                 </div>
               </div>
            </div>
          </aside>
        </div>
      </body>
    </html>
  );
}
