# UX Quick Wins - Prioritized Implementation

## 🎯 Goal
Transform KWC from "tool palette" → "personal operating system"

---

## Week 1: Foundation (10 hours)

### Priority 1: Dashboard View (4h)
**File:** `src/app/page.tsx` (when no `?tool=` param)

**What to build:**
```tsx
<Dashboard>
  <Section title="Recent Activity">
    {last10Outputs.map(output => (
      <OutputCard
        title={output.title}
        skill={output.skillId}
        timestamp={output.createdAt}
        onClick={() => openOutput(output.id)}
      />
    ))}
  </Section>

  <Section title="Quick Actions">
    <QuickAction icon={Sparkles} label="Daily Signal" onClick={() => goto('signal')} />
    <QuickAction icon={WandSparkles} label="LinkedIn Post" onClick={() => goto('linkedin')} />
    <QuickAction icon={Search} label="Market Scan" onClick={() => goto('play-store')} />
    <QuickAction icon={GitBranch} label="Agent Workflow" onClick={() => goto('workflow')} />
  </Section>

  <Section title="Scheduled" hint="Coming soon">
    <EmptyState text="No automations yet. Add your first schedule." />
  </Section>
</Dashboard>
```

**Impact:** Immediate visibility into what your OS is doing

---

### Priority 2: Persistent Workspace Panel (3h)
**File:** `src/app/layout.tsx` (right rail)

**Current:**
```tsx
{isReadingExperience ? <SignalHistory /> : <Placeholder />}
```

**New:**
```tsx
<WorkspacePanel>
  <Tabs>
    <Tab label="Activity" icon={Activity}>
      <RunningJobs />
      <RecentOutputs limit={10} />
    </Tab>

    <Tab label="Saved" icon={Bookmark}>
      <PinnedOutputs />
      <SavedVault />
    </Tab>

    <Tab label="Queue" icon={Clock}>
      <ScheduledJobs />
      <FailedJobs />
    </Tab>
  </Tabs>
</WorkspacePanel>
```

**Impact:** Outputs don't disappear, always accessible

---

### Priority 3: Output Action Bar (2h)
**File:** `src/lib/legacy_page.tsx` (output modal)

**Add to modal footer:**
```tsx
<ActionBar>
  <Button icon={Copy} onClick={copyToClipboard}>Copy</Button>
  <Button icon={Save} onClick={saveToLibrary}>Save</Button>
  <Dropdown trigger={<Button icon={Share}>Chain to...</Button>}>
    <DropdownItem onClick={() => chainTo('product')}>Product Intelligence</DropdownItem>
    <DropdownItem onClick={() => chainTo('prd')}>PRD Generator</DropdownItem>
    <DropdownItem onClick={() => chainTo('linkedin')}>LinkedIn Writer</DropdownItem>
  </Dropdown>
  <Button icon={Pin} onClick={pinOutput}>Pin</Button>
  <Button icon={Download} onClick={exportMarkdown}>Export</Button>
</ActionBar>
```

**Impact:** Outputs become actionable, not dead ends

---

### Priority 4: Nav Status Icons (1h)
**File:** `src/app/layout.tsx` (nav items)

**Add metadata to nav:**
```tsx
<Link href={`/?tool=${item.id}`}>
  {item.label}
  <Badges>
    {item.scheduled && <Badge>⏰</Badge>}
    {item.ai && <Badge>🤖</Badge>}
    {item.slow && <Badge title="30-60s">⏱️</Badge>}
  </Badges>
</Link>
```

**Icon key:**
- ⏰ = Scheduled/recurring
- 🤖 = AI-powered
- ⏱️ = Slow (>30s)
- ⚡ = Fast (<5s)

**Impact:** Visual scanning, know what to expect

---

## Week 2: Intelligence (8 hours)

### Priority 5: Smart Command Palette (4h)
**File:** New `src/components/CommandPalette.tsx`

**Replace basic search with cmdk:**
```tsx
import { Command } from 'cmdk'

<Command.Dialog open={open} onOpenChange={setOpen}>
  <Command.Input placeholder="Type a command or search..." />
  <Command.List>
    <Command.Group heading="Recent">
      {recentCommands.map(cmd => (
        <Command.Item onSelect={() => execute(cmd)}>
          {cmd.label}
        </Command.Item>
      ))}
    </Command.Group>

    <Command.Group heading="Skills">
      {filteredSkills.map(skill => (
        <Command.Item onSelect={() => goto(skill.id)}>
          <skill.icon />
          {skill.name}
        </Command.Item>
      ))}
    </Command.Group>

    <Command.Group heading="Actions">
      <Command.Item onSelect={() => refreshSignal()}>/refresh signal</Command.Item>
      <Command.Item onSelect={() => newAutomation()}>/new automation</Command.Item>
    </Command.Group>

    <Command.Group heading="Outputs">
      {searchResults.map(output => (
        <Command.Item onSelect={() => openOutput(output.id)}>
          {output.title}
          <span>{formatDate(output.createdAt)}</span>
        </Command.Item>
      ))}
    </Command.Group>
  </Command.List>
</Command.Dialog>
```

**Impact:** Fast navigation, scales to 20+ items

---

### Priority 6: Keyboard Shortcuts Overlay (2h)
**File:** New `src/components/KeyboardShortcuts.tsx`

**Trigger with `?` key:**
```tsx
<ShortcutsOverlay>
  <Section title="Navigation">
    <Shortcut keys={['⌘', 'K']} action="Open command palette" />
    <Shortcut keys={['⌘', '1-9']} action="Switch to skill" />
    <Shortcut keys={['⌘', 'H']} action="Go to dashboard" />
  </Section>

  <Section title="Actions">
    <Shortcut keys={['⌘', 'N']} action="New output" />
    <Shortcut keys={['⌘', 'R']} action="Refresh current" />
    <Shortcut keys={['⌘', 'S']} action="Save output" />
  </Section>

  <Section title="System">
    <Shortcut keys={['⌘', ',']} action="Settings" />
    <Shortcut keys={['Esc']} action="Cancel/Close" />
    <Shortcut keys={['?']} action="Toggle this help" />
  </Section>
</ShortcutsOverlay>
```

**Impact:** Power users get fast, mouse-free navigation

---

### Priority 7: First-Time Onboarding (2h)
**File:** New `src/components/WelcomeTour.tsx`

**Show on first visit (localStorage flag):**
```tsx
<WelcomeTour steps={[
  {
    target: '.dashboard',
    title: 'Your Dashboard',
    content: 'See all activity and recent outputs here'
  },
  {
    target: '.sidebar',
    title: 'Skills',
    content: 'Run one-off tasks like writing LinkedIn posts or analyzing markets'
  },
  {
    target: '.command-bar',
    title: 'Command Palette',
    content: 'Press Cmd+K to quickly navigate anywhere'
  },
  {
    target: '.workspace-panel',
    title: 'Persistent Workspace',
    content: 'Your outputs stay here so you can reference them anytime'
  }
]} />
```

**Impact:** New users understand the system immediately

---

## Week 3: Automation Prep (6 hours)

### Priority 8: Scheduler Data Model (2h)
**File:** New `src/lib/scheduler.ts`

**Schema:**
```typescript
type ScheduledJob = {
  id: string
  skillId: string
  name: string
  schedule: string // cron format
  enabled: boolean
  inputs: Record<string, string>
  lastRun?: string
  nextRun: string
  status: 'idle' | 'running' | 'failed'
  failureCount: number
}

// localStorage for now, DB later
export function saveSchedule(job: ScheduledJob): void
export function listSchedules(): ScheduledJob[]
export function toggleSchedule(id: string): void
export function deleteSchedule(id: string): void
```

**Impact:** Foundation for automation features

---

### Priority 9: Automation UI Scaffold (2h)
**File:** New `src/app/automation/page.tsx`

**Basic view:**
```tsx
<AutomationPage>
  <PageHeader>
    <h1>Automation & Scheduling</h1>
    <Button onClick={newAutomation}>+ New Automation</Button>
  </PageHeader>

  <Section title="Active Schedules">
    {schedules.map(schedule => (
      <ScheduleCard
        name={schedule.name}
        skill={schedule.skillId}
        schedule={schedule.schedule}
        nextRun={schedule.nextRun}
        enabled={schedule.enabled}
        onToggle={() => toggle(schedule.id)}
        onEdit={() => edit(schedule.id)}
        onDelete={() => delete(schedule.id)}
      />
    ))}
  </Section>

  <Section title="Execution History">
    {history.map(run => (
      <HistoryCard
        job={run.jobName}
        timestamp={run.executedAt}
        status={run.status}
        output={run.outputId}
      />
    ))}
  </Section>
</AutomationPage>
```

**Impact:** UI ready for when you implement scheduler backend

---

### Priority 10: Settings Panel (2h)
**File:** New `src/app/settings/page.tsx`

**Basic settings:**
```tsx
<SettingsPage>
  <Section title="General">
    <Setting label="Default view" type="select" options={['Dashboard', 'Signal']} />
    <Setting label="Theme" type="select" options={['System', 'Light', 'Dark']} />
  </Section>

  <Section title="Skills">
    <Setting label="OpenAI API Key" type="password" value="sk-proj-***" />
    <Setting label="Default Model" type="select" options={['gpt-4o-mini', 'gpt-4o']} />
    <Setting label="Temperature" type="slider" min={0} max={1} step={0.1} />
  </Section>

  <Section title="Automation">
    <Setting label="Max concurrent jobs" type="number" />
    <Setting label="Retry failed jobs" type="toggle" />
    <Setting label="Email notifications" type="toggle" />
  </Section>

  <Section title="Data">
    <Setting label="History retention" type="select" options={['7 days', '30 days', 'Forever']} />
    <Setting label="Auto-save outputs" type="toggle" />
    <Button variant="danger">Clear All Data</Button>
  </Section>
</SettingsPage>
```

**Impact:** User control over system behavior

---

## Implementation Order

**Phase 1: Visibility (Week 1)**
✅ Dashboard → See what's happening
✅ Workspace panel → Outputs persist
✅ Action bar → Make outputs actionable
✅ Status icons → Quick scanning

**Phase 2: Efficiency (Week 2)**
✅ Command palette → Fast navigation
✅ Keyboard shortcuts → Power user features
✅ Onboarding → Help new users

**Phase 3: Automation Foundation (Week 3)**
✅ Scheduler data model → Backend prep
✅ Automation UI → Frontend scaffold
✅ Settings panel → Configuration

**Phase 4: Automation Implementation (Week 4+)**
- Cron scheduler backend
- Job queue system
- Notification system
- Trigger-based automation
- Chain workflows

---

## Success Metrics

**Week 1:**
- ✅ Dashboard shows last 10 outputs
- ✅ Can access any output from right rail
- ✅ Can copy/save/chain outputs
- ✅ Nav shows skill metadata

**Week 2:**
- ✅ Command palette responds <100ms
- ✅ Can navigate entire app without mouse
- ✅ New users complete onboarding

**Week 3:**
- ✅ Can view/edit schedules (even if not running yet)
- ✅ Can configure all settings
- ✅ Data persists across sessions

---

## Files to Create

```
src/
├── app/
│   ├── page.tsx (dashboard)
│   ├── automation/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── components/
│   ├── CommandPalette.tsx
│   ├── WorkspacePanel.tsx
│   ├── ActionBar.tsx
│   ├── KeyboardShortcuts.tsx
│   ├── WelcomeTour.tsx
│   ├── QuickAction.tsx
│   └── ScheduleCard.tsx
└── lib/
    ├── scheduler.ts
    ├── settings.ts
    └── shortcuts.ts
```

---

## Technical Debt to Address

1. **Persistent state:**
   - Move from modals to persistent panels
   - Use localStorage for now, migrate to DB later

2. **Navigation:**
   - Replace simple routing with app-level state
   - Implement workspace tabs (multiple outputs open)

3. **Real-time updates:**
   - WebSocket or polling for running jobs
   - Optimistic UI updates

4. **Error handling:**
   - Actionable error states
   - Retry mechanisms
   - Fallback UIs

---

## Blocked Until Automation Backend

These UX improvements need backend support:

- ❌ Live job status (needs scheduler)
- ❌ Push notifications (needs notification service)
- ❌ Job queue visualization (needs queue system)
- ❌ Chained workflows (needs orchestration)

**But you can build the UI scaffolding now!**

Show empty states, mock data, "coming soon" placeholders. When backend is ready, just wire it up.

---

## Design System Quick Reference

**Colors:**
- Primary action: violet-600
- Success: green-600
- Warning: amber-600
- Error: red-600
- Neutral: zinc-500

**Typography:**
- Page title: text-2xl font-bold
- Section header: text-sm font-bold uppercase tracking-widest
- Body: text-sm font-medium
- Caption: text-xs text-zinc-500

**Spacing:**
- Section gap: gap-6
- Card padding: p-4
- Icon size: 16px (inputs), 20px (nav)

**Animation:**
- Enter: fadeIn + slideUp (200ms)
- Exit: fadeOut (150ms)
- Hover: scale-105 + shadow-lg (100ms)

---

## Next Review Checkpoint

After Week 3, reassess:
- Is dashboard useful?
- Do users actually use command palette?
- What's the most common workflow?
- Where are friction points?

Then iterate on:
- Week 4: Automation backend
- Week 5: Workflow chaining
- Week 6: Integrations
- Week 7: Mobile companion app
