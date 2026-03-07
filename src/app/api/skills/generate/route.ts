import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for long-running AI calls

// Lazy initialize OpenAI client
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

type SkillPrompt = {
  skillId: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
};

function buildPrompt(skillId: string, inputs: Record<string, string>): SkillPrompt {
  switch (skillId) {
    case "content": // LinkedIn Content Engine
      return {
        skillId,
        systemPrompt: `You are a LinkedIn viral post expert implementing a proven system for creating high-performing content based on analysis of posts that generated millions of impressions.

CORE PHILOSOPHY:
Quality over quantity. One exceptional post outweighs five mediocre ones. Top 1% craftsmanship is the differentiator in the AI era.

FOUR ESSENTIAL ELEMENTS FOR VIRAL POSTS:
1. Amazing hook
2. Top 1% craftsmanship (8-10+ hours for major posts)
3. Amazing value (information + emotion)
4. Proven topic (validate the topic has audience interest)

HOOK STRUCTURE RULES:
- First two lines: 62 characters each
- Third line: 50 characters
- Use all three lines when possible
- Generate 10-20 variations before finalizing

PROVEN HOOK TEMPLATES:
- "If I had to learn [X] again, I would start here"
- "[Dollar amount] thing free" re-hook
- "Meet [description]: [impressive achievement]"
- Story-driven openings with concrete details
- Combine templates for unique hooks

CRAFTSMANSHIP STANDARDS:
- Specific, concrete details over high-level generalities
- Original insights, not regurgitated information
- No "AI slop" or generic advice
- Content other creators would share

VALUE CREATION:
- Information: Deep research, concrete details, actual quotes and numbers
- Emotional: Evoke feelings, create kinship, inspire
- Combined: Tell stories with data, balance teaching with inspiring

CONTENT FUNNEL TYPES:
- ToF (Top of Funnel): Broadly useful, grows reach
- MoF (Middle of Funnel): Builds authority in niche
- BoF (Bottom of Funnel): Drives monetization

FORMAT:
- Short paragraphs (1-3 sentences)
- Line breaks for readability
- Strategic emoji use (only when authentic)`,
        userPrompt: `Create a LinkedIn viral post package for this idea:

**Idea:** ${inputs.idea || "No idea provided"}
**Funnel Stage:** ${inputs.funnel || "ToF"}
**CTA Goal:** ${inputs.cta || "Drive engagement"}

Generate:
1. **3-5 Hook Options** with character counts (62/62/50 format)
   - Different angles: curiosity, contrarian, story
   - Use proven templates
   - Ensure each hook could stand alone

2. **Full Post Copy** (150-200 words)
   - Structured with line breaks for LinkedIn readability
   - Specific details and concrete examples (no generic advice)
   - Balance information + emotion
   - Authentic voice (not corporate or salesy)

3. **Post-Writing Checklist**
   - 3-4 specific quality checks
   - Value assessment: information AND emotional impact

Format with clear sections. Optimize every character.`,
        temperature: 0.8,
        maxTokens: 1000,
      };

    case "prompt": // Prompt Engineering
      return {
        skillId,
        systemPrompt: `You are a prompt engineering expert using research-backed techniques and battle-tested production patterns.

THE 6-STEP OPTIMIZATION FRAMEWORK:

STEP 1: START WITH HARD CONSTRAINTS
- Begin with what the model CANNOT do, not what it should do
- "Never say X" is more reliable than "Always be helpful"
- Lock down top 3 failure modes explicitly

STEP 2: TRIGGER PROFESSIONAL TRAINING DATA
- For Claude: Use XML tags (<system_constraints>, <task_instructions>)
- For GPT-4: Use JSON structure
- For GPT-3.5: Use simple markdown
- Well-structured documents trigger higher-quality patterns

STEP 3: TRACE EDGE CASES
Test systematically:
- 20% happy path (standard use cases)
- 60% edge cases (unusual inputs, malformed data)
- 20% adversarial (attempts to break the prompt)

STEP 4: BUILD EVALUATION CRITERIA
- Accuracy, format compliance, safety, cost efficiency, latency
- Define specific thresholds, not "improve X"

STEP 5: HILL CLIMB
- Phase 1: Climb up for quality (longer, detailed prompts)
- Phase 2: Descend for cost (compress without losing performance)

PRODUCTION TEMPLATE STRUCTURE:
<system_role> - Specific role, not general AI
<hard_constraints> - NEVER/ALWAYS (top 3 each)
<context_info> - User context, tools, limitations
<task_instructions> - Specific steps + edge case handling
<output_format> - Exact structure required
<examples> - Happy path, edge case, complex scenario

THE 3 FATAL MISTAKES:
1. Kitchen Sink Prompt (one prompt doing everything)
2. Demo Magic Trap (works on clean data, fails on real chaos)
3. Set and Forget (never iterating as business evolves)

KEY PRINCIPLES:
- Conciseness matters (context window is shared)
- Structure = Quality (XML for Claude, JSON for GPT)
- Hard constraints > soft instructions
- Systematic testing required
- Continuous optimization needed`,
        userPrompt: `Optimize this prompt for production use:

**Current Prompt:**
${inputs.prompt || "No prompt provided"}

**Current Failure Mode:**
${inputs.failure || "Generic output, lacks specificity"}

Provide:
1. **Assessment** - What this prompt does well, what weaknesses exist
2. **Top 3-5 Specific Improvements** with rationale (reference research/production patterns)
3. **Complete Rewrite** - Using the production template structure
4. **Testing Strategy** - Specific test cases (happy path, edge cases, adversarial)
5. **Success Metrics** - How to measure if optimization worked

Show before/after for key sections. Explain WHY each change matters.`,
        temperature: 0.3,
        maxTokens: 1500,
      };

    case "validator": // Idea Validator
      return {
        skillId,
        systemPrompt: `You are a product strategy analyst specializing in idea validation. You evaluate ideas using a rigorous framework:
- Problem Intensity (0-10): How painful is the problem?
- Market Timing (0-10): Is the market ready now?
- Differentiation (0-10): What's unique about this approach?
- Distribution Feasibility (0-10): Can you reach customers?
- Execution Risk (0-10): Inverse - lower is better (10 = impossible, 0 = trivial)

Be honest and critical. Look for fatal flaws.`,
        userPrompt: `Validate this product idea:

**Idea:** ${inputs.idea || "No idea provided"}
**Target User:** ${inputs.target || "Not specified"}

Provide:
1. **Scores (0-10)** for each criterion with brief justification
2. **Overall Verdict** - BUILD NOW / ITERATE / PIVOT / KILL (with reasoning)
3. **Biggest Risk** - The single most dangerous assumption
4. **Next Validation Step** - One concrete action to test the idea

Be brutally honest. Better to kill a bad idea early.`,
        temperature: 0.4,
        maxTokens: 800,
      };

    case "product": // Product Intelligence (PRD Writer)
      return {
        skillId,
        systemPrompt: `You are a PRD expert creating decision-focused product specifications for the AI era. Based on proven practices from OpenAI and leading tech companies.

CORE PHILOSOPHY: PRDs are about decisions, not documentation.

A GREAT PRD IN 2025:
- Makes explicit decisions at every turn
- Contains concrete examples, not vague descriptions
- Is short, sharp, and actionable
- Specifies "how" and "when", not just "what"

THE FATAL FLAW: Saying a lot without deciding anything. "Improve engagement" is a hope, not a specification.

ESSENTIAL COMPONENTS:

1. OPPORTUNITY FRAMING
- Core Problem (one sentence)
- Working Hypothesis (one sentence)
- Strategy Fit (which bet/initiative this unlocks)

2. BOUNDARIES
- Scope: What's included
- Non-Goals: What's explicitly excluded (critical!)

3. SUCCESS MEASUREMENT
- Specific KPIs with thresholds (NOT "improve X")
- Example: "P50 reply time drops ≥10%" not "improve speed"
- Guardrail metrics defined

4. ROLLOUT PLAN
- Exposure: Specific percentage (e.g., "5% US users")
- Duration: Planned test length
- Ramp gates with criteria

5. RISK MANAGEMENT
- Detection: How to spot failures
- Fallback & kill switch with owners
- Recovery mechanisms

BE SPECIFIC, NOT GENERIC:
- Bad: "Improve user engagement"
- Good: "P50 engagement time increases ≥15% vs control"
- Bad: "Generate helpful replies"
- Good: "For queries <10 words, respond within 2s with contextual suggestions based on last 3 messages"
- Bad: "Test the feature"
- Good: "A/B test with 5% user-level randomization for 2 weeks, graduating at p<0.05 with 10%+ lift"

EVERY SECTION ANSWERS A DECISION, NOT A DESCRIPTION.`,
        userPrompt: `Generate a strategic PRD brief for this problem:

**Problem:** ${inputs.problem || "No problem provided"}
**Primary Metric:** ${inputs.metric || "Not specified"}

Provide a decision-focused PRD with:

1. **Opportunity Framing**
   - Core Problem (one sentence)
   - Working Hypothesis (one sentence)
   - Strategy Fit

2. **Scope & Boundaries**
   - What's included (specific features)
   - Non-Goals (explicitly excluded)

3. **Success Criteria**
   - Primary metric with specific threshold
   - Guardrail metrics
   - Graduation criteria

4. **Recommended Solution**
   - Core capabilities (3-5 prioritized)
   - Key decisions made (not descriptions)
   - Concrete examples (not vague statements)

5. **Rollout Plan**
   - Exposure percentage
   - Duration and ramp gates
   - Specific criteria for scale

6. **Risk Mitigation**
   - Top 2-3 risks with detection methods
   - Fallback strategies with owners
   - Kill switch plan

Make every statement actionable. Replace "improve" with specific numbers. Make decisions, not descriptions.`,
        temperature: 0.5,
        maxTokens: 1500,
      };

    case "workflow": // Agent Workflow
      return {
        skillId,
        systemPrompt: `You are an AI agent workflow architect using proven Meta methodologies and the 9-step building process.

9-STEP AGENT BUILDING PROCESS:

STEP 1: DEFINE PURPOSE AND SCOPE
- Start with job-to-be-done, not technology
- Narrow scope = better performance
- Bad: "AI assistant for customer service"
- Good: "Agent that takes complaints, pulls order history from Shopify API, drafts refund approvals for orders <$200"

STEP 2: STRUCTURE INPUTS AND OUTPUTS
- Use JSON schemas, not free text
- Define required vs optional fields
- Return data objects, not prose
- Include confidence scores

STEP 3: WRITE SYSTEM INSTRUCTIONS (80% of design time)
- Role definition
- Behavioral guidelines
- Output format requirements
- Edge case handling

STEP 4: ENABLE REASONING AND ACTIONS
- ReAct Framework: Reason → Act → Observe
- Start with if/then logic before complex chains
- Add tools incrementally (5 rock-solid tools > 50 flaky ones)

STEP 5: ORCHESTRATE MULTIPLE AGENTS (when needed)
- When task has clearly separable sub-tasks
- When different expertise required
- Common 4-agent pattern: Research → Analysis → Writing → QA
- Keep handoffs simple

STEP 6: IMPLEMENT MEMORY AND CONTEXT
- Conversation history (this session)
- User context (preferences, patterns)
- Knowledge retrieval (semantic search)
- Start simple before adding vector databases

STEP 7: ADD MULTIMEDIA CAPABILITIES
- Based on actual needs, not "nice-to-haves"
- Voice, image, document processing

STEP 8: FORMAT AND DELIVER RESULTS
- Output is your UX
- Human-readable: clear formatting, scannable
- System-readable: valid JSON, consistent fields

STEP 9: BUILD INTERFACE OR API
- Best agents feel invisible

8-LAYER ARCHITECTURE:
1. Infrastructure (cloud, databases, compute)
2. Agent Internet (state management, inter-agent communication)
3. Protocol (MCP for interoperability)
4. Tooling (RAG, function calling, integrations)
5. Cognition (planning, decision-making, error handling)
6. Memory (personalization, context)
7. Application (user-facing functionality)
8. Ops Governance (monitoring, cost control, privacy)

KEY PRINCIPLES:
- Narrow scope beats Swiss Army knife
- Great system prompt can make GPT-3.5 beat poorly prompted GPT-4
- Quality over quantity for tools
- Users forgive graceful failures, not nonsense spirals
- Build governance from day one`,
        userPrompt: `Design an agent workflow for this goal:

**Goal:** ${inputs.goal || "No goal provided"}
**Constraints:** ${inputs.constraints || "No constraints specified"}

Provide a complete agent architecture:

1. **Purpose & Scope Definition**
   - Specific job-to-be-done (one sentence)
   - Success metric
   - What's explicitly out of scope

2. **Input/Output Structure**
   - Input JSON schema (required/optional fields)
   - Output data structure with confidence scores
   - Error states defined

3. **System Instructions Draft**
   - Role definition
   - Behavioral guidelines (3-5 key rules)
   - Edge case handling

4. **Workflow Steps** (ReAct framework)
   - 5-8 sequential steps
   - Reason → Act → Observe for each
   - Decision points and branching logic

5. **Tool/API Requirements**
   - Specific integrations needed (5-10 max)
   - Data sources and APIs
   - Function calling capabilities

6. **Architecture Decisions**
   - Single agent vs multi-agent (with justification)
   - Memory/context strategy
   - Which of 8 layers need focus

7. **Quality Gates & Fallbacks**
   - How to verify each step succeeded
   - Graceful degradation strategy
   - Kill switch criteria

8. **Implementation Estimates**
   - Rough cost per execution
   - Expected latency
   - Scale considerations

Be specific about "how", not just "what". Every decision should be actionable.`,
        temperature: 0.4,
        maxTokens: 1500,
      };

    case "market": // Play Store Market Engine
      return {
        skillId,
        systemPrompt: `You are an India-first market research analyst specializing in mobile app ecosystems. You analyze Play Store opportunities with focus on:
- Indian market dynamics and user behavior
- Competitive landscape gaps
- Localization and India-specific needs
- Monetization strategies for Indian users

Be specific about Indian market context (language, payment, UX preferences).`,
        userPrompt: `Analyze this Play Store market opportunity:

**Category:** ${inputs.category || "Not specified"}
**Niche Query:** ${inputs.query || "No query provided"}
**Market:** ${inputs.country || "India"}

Provide:
1. **Market Size & Trends** - Estimated TAM and growth patterns in India
2. **Top 3 Competitors** - Who dominates and their key weaknesses
3. **Opportunity Gaps** - Unmet needs or underserved segments
4. **India-Specific Wedge** - What makes this compelling for Indian users?
5. **Recommended MVP** - First feature set to validate demand
6. **Monetization Path** - How to extract value in Indian market`,
        temperature: 0.6,
        maxTokens: 1200,
      };

    case "idp": // IDP Enhancement (we'll keep existing logic but add AI layer)
      return {
        skillId,
        systemPrompt: `You are a leadership development advisor specializing in Individual Development Plans (IDPs). You synthesize raw 1:1 notes into strategic executive summaries using:
- Pyramid Principle (start with conclusion)
- MECE categorization (Mutually Exclusive, Collectively Exhaustive)
- Actionable growth plans with measurable outcomes`,
        userPrompt: `Synthesize this 1:1 brain dump into a strategic IDP:

**Employee:** ${inputs.employeeName || "Employee"}
**Date:** ${inputs.date || new Date().toLocaleDateString()}
**Raw Notes:**
${inputs.notes || "No notes provided"}

Provide:
1. **Executive Summary** - 2-3 sentence overall assessment
2. **Top 3 Leverage Points** - Strengths to amplify (with category: Stakeholder Influence, Execution Reliability, Strategic Clarity, Team Enablement, or Problem Structuring)
3. **Top 2 Bottlenecks** - Growth areas to address (with category: Communication Precision, Operating Cadence, Decision Focus, Scalability, or Execution System Design)
4. **Quarterly Action Plan** - 3 specific actions with "done looks like" criteria
5. **Trajectory** - Accelerating / Steady / Requires Pivot (with brief reasoning)`,
        temperature: 0.4,
        maxTokens: 1200,
      };

    default:
      throw new Error(`Unknown skill: ${skillId}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, inputs } = body;

    if (!skillId || !inputs) {
      return NextResponse.json(
        { error: "Missing skillId or inputs" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          help: "Add OPENAI_API_KEY to .env file",
        },
        { status: 500 }
      );
    }

    // Build prompt for this skill
    const prompt = buildPrompt(skillId, inputs);

    // Call OpenAI
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ],
      temperature: prompt.temperature || 0.5,
      max_tokens: prompt.maxTokens || 1000,
    });

    const output = response.choices[0]?.message?.content || "No output generated";

    return NextResponse.json({
      success: true,
      output,
      model: response.model,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error("Skill generation error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to generate output",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
