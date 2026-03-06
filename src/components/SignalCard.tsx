import React from 'react';
import { Pin, Share, Play } from 'lucide-react';

export interface SignalCardProps {
    author: {
        name: string;
        avatarInitials: string;
    };
    domain: string;
    timestamp: string;
    title: string;
    content: React.ReactNode;
    isPinned?: boolean;
}

export function SignalCard({
    author,
    domain,
    timestamp,
    title,
    content,
    isPinned = false,
}: SignalCardProps) {
    // Map domain to a subtle aesthetic consistent with strict utilitarian rules
    const getDomainColor = (domain: string) => {
        switch (domain.toLowerCase()) {
            case 'ai': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'fintech': return 'bg-green-50 text-green-700 border-green-200';
            case 'code': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'rbi': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
        }
    };

    return (
        <article className="border border-zinc-200 rounded bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col mb-6 w-full transition-shadow hover:shadow-md">
            {/* Header (Author Badge + Domain Pill) */}
            <header className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600 border border-zinc-200 shrink-0">
                        {author.avatarInitials}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-zinc-900 leading-none">{author.name}</span>
                        <span className="text-[11px] font-medium text-zinc-400 mt-1">{timestamp}</span>
                    </div>
                </div>
                <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${getDomainColor(domain)}`}>
                    {domain}
                </div>
            </header>

            {/* Body */}
            <div className="px-5 py-5">
                <h2 className="text-lg font-bold text-zinc-900 mb-2.5 tracking-tight leading-snug">
                    {title}
                </h2>
                <div className="text-[14px] text-zinc-700 leading-relaxed font-medium">
                    {content}
                </div>
            </div>

            {/* Footer (Action Row) */}
            <footer className="px-5 py-2.5 border-t border-zinc-100 flex items-center justify-end gap-1.5 bg-zinc-50/50">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors group">
                    <Share className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                    Share
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors group">
                    <Play className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                    Run Workflow
                </button>
                <div className="w-[1px] h-3.5 bg-zinc-200 mx-2"></div>
                <button
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold rounded transition-colors ${isPinned
                            ? 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                            : 'text-zinc-600 hover:text-zinc-900 border border-transparent hover:bg-zinc-100'
                        }`}
                >
                    <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-blue-700' : 'text-zinc-400'}`} />
                    {isPinned ? 'Pinned' : 'Pin'}
                </button>
            </footer>
        </article>
    );
}
