import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import {
  Activity,
  Banknote,
  BrainCircuit,
  Download,
  HeartPulse,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'

const categories = [
  { name: 'Finance', icon: Banknote },
  { name: 'Productivity', icon: Target },
  { name: 'Health', icon: HeartPulse },
  { name: 'Lifestyle', icon: Sparkles },
  { name: 'Education', icon: BrainCircuit },
  { name: 'Business', icon: TrendingUp },
]

const marketScope = 'India (IN)'
const timelineSteps = ['Scanning India Play Store', 'Analyzing India Gaps', 'Drafting India Opportunities']

const marketApps = [
  { rank: 1, name: 'Habits with Rewire', installs: '1M+', rating: '4.4', reviews: '71K' },
  { rank: 2, name: 'Do It Now RPG To Do List', installs: '1M+', rating: '4.6', reviews: '52K' },
  { rank: 3, name: 'Taskito', installs: '1M+', rating: '4.6', reviews: '32K' },
  { rank: 4, name: 'Microsoft To Do', installs: '10M+', rating: '4.6', reviews: '372K' },
  { rank: 5, name: 'TickTick', installs: '5M+', rating: '4.7', reviews: '137K' },
  { rank: 6, name: 'Loop Habit Tracker', installs: '5M+', rating: '4.7', reviews: '112K' },
]

const gapClusters = [
  {
    title: 'Onboarding Friction',
    count: 392,
    details: 'India users report setup overload and unclear first success moments.',
  },
  {
    title: 'Reminder Noise',
    count: 268,
    details: 'Reminders feel repetitive and not context-aware for local day rhythms.',
  },
  {
    title: 'Weak Personalization',
    count: 219,
    details: 'Recommendations feel generic after first 3-5 days.',
  },
  {
    title: 'Sync Reliability',
    count: 171,
    details: 'Streak resets and missing logs during device switches on low-connectivity sessions.',
  },
]

const opportunities = [
  {
    id: 1,
    name: 'AI Habit Copilot for Indian Shift Workers',
    confidence: 92,
    difficulty: 'Medium',
    pitch: 'Adaptive routines tuned for irregular sleep and work schedules.',
  },
  {
    id: 2,
    name: 'Offline-first Micro Habit Engine for India',
    confidence: 84,
    difficulty: 'Low',
    pitch: 'Fast local habit capture with resilient sync reconciliation.',
  },
  {
    id: 3,
    name: 'India-first Goal-to-Reward Behavioral Loop',
    confidence: 78,
    difficulty: 'High',
    pitch: 'AI-driven reinforcement with personalized reward timing.',
  },
]

const prdMarkdown = `# PlayIntel India Opportunity PRD

## Strategy
Build a focused AI habit product for Indian users with non-linear schedules. Position on adaptability, low-friction logging, and trust-first insight quality.

## User Personas
1. **Shift Specialist:** Variable routine, high volatility, wants lightweight consistency.
2. **Builder Persona:** Wants measurable daily output with low setup overhead.
3. **Recovery Persona:** Needs smart rest + routine balancing to avoid burnout.

## MVP Features
- AI Dynamic Planner (day context + energy-aware suggestions)
- 1-Tap Habit Capture
- Adaptive Reminder Engine
- Streak Integrity + Offline Recovery
- Insight Cards with confidence rationale

## Code Scaffolding

tsx
interface Habit {
  id: string
  label: string
  frequency: 'daily' | 'weekly'
  adaptive: boolean
}

interface Recommendation {
  id: string
  habitId: string
  message: string
  confidence: number
}
`

function Button({ className, children, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function ConfidenceRing({ value }) {
  return (
    <div
      className="relative h-16 w-16 rounded-full"
      style={{
        background: `conic-gradient(#6d8bff ${value * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
      }}
    >
      <div className="absolute inset-1.5 grid place-items-center rounded-full bg-[#111115] text-xs font-semibold text-white">
        {value}%
      </div>
    </div>
  )
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState('Finance')
  const [query, setQuery] = useState('AI habit tracker for Indian users with irregular schedules')
  const [activeTab, setActiveTab] = useState('market')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [analysisReady, setAnalysisReady] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState(opportunities[0])
  const [openPrd, setOpenPrd] = useState(false)
  const [downloadLabel, setDownloadLabel] = useState('Download Research Pack')

  useEffect(() => {
    if (!isAnalyzing) return undefined

    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < timelineSteps.length - 1 ? prev + 1 : prev))
    }, 1000)

    const finishTimer = setTimeout(() => {
      setIsAnalyzing(false)
      setAnalysisReady(true)
    }, 3000)

    return () => {
      clearInterval(stepInterval)
      clearTimeout(finishTimer)
    }
  }, [isAnalyzing])

  const statusLabel = useMemo(() => {
    if (isAnalyzing) return 'Analyzing'
    if (analysisReady) return 'Ready'
    return 'Idle'
  }, [analysisReady, isAnalyzing])

  const triggerAnalyze = () => {
    setAnalysisReady(false)
    setProgressStep(0)
    setIsAnalyzing(true)
  }

  const handleCategoryClick = (name) => {
    setSelectedCategory(name)
    setQuery(`${name} niche opportunity in underserved Indian Android segment`)
  }

  const triggerDownload = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      marketScope,
      category: selectedCategory,
      query,
      opportunities,
      gapClusters,
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `playintel-research-pack-${selectedCategory.toLowerCase()}.json`
    anchor.click()
    URL.revokeObjectURL(url)

    setDownloadLabel('Research Pack Downloaded')
    setTimeout(() => setDownloadLabel('Download Research Pack'), 1800)
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-10%] top-[-5%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,_rgba(88,74,198,0.28),_transparent_70%)]" />
        <div className="absolute bottom-0 right-[-8%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_rgba(96,53,181,0.24),_transparent_65%)]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0b0cae] px-4 py-4 backdrop-blur xl:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_10px_30px_rgba(9,9,20,0.3)]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Agentic Research Console</p>
            <h1 className="text-xl font-semibold">PlayIntel AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/30 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-200">
              <Target size={14} />
              Market Scope: {marketScope}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <ShieldCheck size={14} />
              System Status: {statusLabel}
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 xl:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/60">Step 1</p>
          <h2 className="mb-4 text-2xl font-semibold">Discovery Panel</h2>
          <p className="mb-4 inline-flex rounded-full border border-indigo-300/30 bg-indigo-400/10 px-3 py-1 text-xs text-indigo-100">
            India-only research context is locked.
          </p>
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, type: 'spring', stiffness: 120, damping: 16 }}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={clsx(
                    'group rounded-2xl border p-3 text-left transition',
                    selectedCategory === cat.name
                      ? 'border-indigo-300/50 bg-indigo-500/20'
                      : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]',
                  )}
                >
                  <div className="mb-2 inline-flex rounded-xl border border-white/10 bg-black/20 p-2">
                    <Icon size={18} className="text-indigo-200" />
                  </div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="mt-1 text-xs text-white/55">Scan category dynamics</p>
                </motion.button>
              )
            })}
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-white/45" size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-10 py-3 text-sm text-white placeholder:text-white/40 focus:border-indigo-300/55 focus:outline-none"
                placeholder="Enter a niche or problem space for India..."
              />
            </div>
            <Button
              onClick={triggerAnalyze}
              disabled={isAnalyzing}
              className="rounded-2xl border-indigo-400/30 bg-indigo-500/20 px-5 py-3 font-semibold"
            >
              {isAnalyzing ? <LoaderCircle className="animate-spin" size={16} /> : <Activity size={16} />}
              Analyze Market
            </Button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.08 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/60">Step 2</p>
          <h2 className="mb-4 text-2xl font-semibold">Research Workbench</h2>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            {timelineSteps.map((step, idx) => (
              <div key={step} className="inline-flex items-center gap-2">
                <div
                  className={clsx(
                    'h-2.5 w-2.5 rounded-full',
                    progressStep >= idx ? 'bg-indigo-300 shadow-[0_0_10px_rgba(122,142,255,0.8)]' : 'bg-white/20',
                  )}
                />
                <span className={clsx('text-sm', progressStep >= idx ? 'text-white' : 'text-white/50')}>{step}</span>
                {idx !== timelineSteps.length - 1 && <span className="mx-1 text-white/35">→</span>}
              </div>
            ))}
          </div>

          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-5 grid place-items-center rounded-2xl border border-indigo-300/20 bg-indigo-400/10 py-10"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                  className="h-20 w-20 rounded-2xl border border-indigo-200/50 bg-[linear-gradient(135deg,rgba(139,152,255,0.55),rgba(89,55,177,0.45))]"
                />
                <p className="mt-3 text-sm text-white/70">PlayIntel is thinking...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-3 inline-flex rounded-xl border border-white/10 bg-black/25 p-1">
            <button
              onClick={() => setActiveTab('market')}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-sm transition',
                activeTab === 'market' ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white',
              )}
            >
              Market Map
            </button>
            <button
              onClick={() => setActiveTab('gap')}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-sm transition',
                activeTab === 'gap' ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white',
              )}
            >
              Gap Radar
            </button>
          </div>

          {activeTab === 'market' && (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.06] text-white/80">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">App</th>
                    <th className="px-4 py-3 font-medium">Installs</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {marketApps.map((app) => (
                    <tr key={app.rank} className="border-t border-white/10 bg-black/20">
                      <td className="px-4 py-3 text-white/70">{app.rank}</td>
                      <td className="px-4 py-3 font-medium">{app.name}</td>
                      <td className="px-4 py-3">{app.installs}</td>
                      <td className="px-4 py-3">{app.rating}</td>
                      <td className="px-4 py-3">{app.reviews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-white/10 bg-black/20 px-4 py-2 text-xs text-white/55">
                Sample map scoped to India Play Store signals.
              </p>
            </div>
          )}

          {activeTab === 'gap' && (
            <div className="grid gap-3 md:grid-cols-2">
              {gapClusters.map((cluster) => (
                <div key={cluster.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-white/60">1-star cluster ({cluster.count})</p>
                  <h3 className="mt-1 font-semibold">{cluster.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{cluster.details}</p>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.14 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Step 3</p>
              <h2 className="text-2xl font-semibold">Opportunity Hub</h2>
            </div>
            <Button onClick={triggerDownload} className="rounded-xl border-emerald-300/25 bg-emerald-500/15">
              <Download size={16} />
              {downloadLabel}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className={clsx(
                  'rounded-2xl border p-4 backdrop-blur transition',
                  selectedOpportunity.id === opp.id ? 'border-indigo-300/50 bg-indigo-500/15' : 'border-white/10 bg-black/20',
                )}
              >
                <div className="mb-3 flex items-start justify-between">
                  <ConfidenceRing value={opp.confidence} />
                  <span className="rounded-full border border-white/15 bg-white/7 px-3 py-1 text-xs text-white/80">
                    Difficulty: {opp.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{opp.name}</h3>
                <p className="mt-2 text-sm text-white/72">{opp.pitch}</p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => setSelectedOpportunity(opp)} className="flex-1 text-xs">
                    Select
                  </Button>
                  <Button onClick={() => setOpenPrd(true)} className="flex-1 text-xs border-indigo-200/35 bg-indigo-500/15">
                    Expand for PRD
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      <AnimatePresence>
        {openPrd && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenPrd(false)}
              className="fixed inset-0 z-40 bg-black/55"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 110, damping: 18 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[#0d0d10] p-6"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Step 4</p>
                  <h2 className="text-2xl font-semibold">PRD Generator</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Editorial India-only draft for: {selectedOpportunity.name}
                  </p>
                </div>
                <Button onClick={() => setOpenPrd(false)} className="rounded-full p-2">
                  <X size={16} />
                </Button>
              </div>

              <article className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-10">
                <div className="prose prose-invert prose-headings:font-semibold prose-h1:text-3xl prose-h2:mt-8 prose-p:text-white/80">
                  <p className="text-xs uppercase tracking-[0.16em] text-indigo-200">PlayIntel India Editorial PRD</p>
                  {prdMarkdown.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) return <h1 key={idx}>{line.replace('# ', '')}</h1>
                    if (line.startsWith('## ')) return <h2 key={idx}>{line.replace('## ', '')}</h2>
                    if (line.startsWith('- ')) return <li key={idx}>{line.replace('- ', '')}</li>
                    if (!line.trim()) return <br key={idx} />
                    return <p key={idx}>{line}</p>
                  })}
                </div>
              </article>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
