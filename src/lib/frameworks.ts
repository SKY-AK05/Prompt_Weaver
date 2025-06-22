export interface PromptFramework {
  id: string;
  name: string;
  emoji?: string;
  whenToUse: string;
  structure: string;
  example: string;
}

export const frameworks: PromptFramework[] = [
  {
    id: 'rtf',
    name: 'R-T-F',
    emoji: '🟩',
    whenToUse: 'Quick, simple tasks. Fast, focused output with structure.',
    structure: 'Role, Task, Format',
    example: `Role: Act as a brand strategist  \nTask: Write a messaging hierarchy  \nFormat: Use a bulleted list with 3 core benefits`,
  },
  {
    id: 'solve',
    name: 'S-O-L-V-E',
    emoji: '🟨',
    whenToUse: 'Strategy, business plans, decision-making. Strategic plan with clear constraints.',
    structure: 'Situation, Objective, Limitations, Vision, Execution',
    example: `Situation: I run a new productivity app for freelancers  \nObjective: Increase daily active users by 30%  \nLimitations: Small team, limited ad budget  \nVision: Become the go-to app for remote workers  \nExecution: Suggest 3 campaigns with metrics to track`,
  },
  {
    id: 'tag',
    name: 'T-A-G',
    emoji: '🟪',
    whenToUse: 'Small tasks, UX tweaks, productivity prompts. Focused improvements or iterations.',
    structure: 'Task, Action, Goal',
    example: `Task: Improve our signup page  \nAction: Redesign copy and layout  \nGoal: Increase conversion rate by 15%`,
  },
  {
    id: 'race',
    name: 'R-A-C-E',
    emoji: '🟦',
    whenToUse: 'Persona-based communication (sales, cold emails). Consider the audience and desired outcome.',
    structure: 'Role, Action, Context, Expectation',
    example: `Role: Act as a SaaS email marketer  \nAction: Write a cold outreach email  \nContext: Our tool helps HR teams automate onboarding  \nExpectation: The email should drive 15%+ reply rate`,
  },
  {
    id: 'dream',
    name: 'D-R-E-A-M',
    emoji: '🟧',
    whenToUse: 'Research-based, complex planning tasks. Iterative, full-cycle help.',
    structure: 'Define, Research, Execute, Analyse, Measure',
    example: `Define: I want to launch an AI course for creators  \nResearch: Top competitors and pricing models  \nExecute: Draft a 4-week curriculum  \nAnalyse: Get feedback from beta users  \nMeasure: Track signups, completions, and NPS`,
  },
  {
    id: 'pact',
    name: 'P-A-C-T',
    emoji: '🟥',
    whenToUse: 'A/B testing, growth experiments. Variation and validation before launching.',
    structure: 'Problem, Approach, Components, Test',
    example: `Problem: Low click-through rate on landing page  \nApproach: Try 3 headline variations  \nComponents: Headline, subheadline, CTA  \nTest: Use A/B test and compare CTR over 7 days`,
  },
  {
    id: 'care',
    name: 'C-A-R-E',
    emoji: '🟫',
    whenToUse: 'Storytelling, testimonials, credibility. Persuasive proof or storytelling copy.',
    structure: 'Context, Action, Result, Example',
    example: `Context: Our client used to struggle with onboarding  \nAction: We implemented a 3-step automation flow  \nResult: Onboarding time reduced by 50%  \nExample: A case where this saved 3 hours per new hire`,
  },
  {
    id: 'rise',
    name: 'R-I-S-E',
    emoji: '⬛',
    whenToUse: 'Complex tasks, team ops, goal-setting. Need a system, not just an answer.',
    structure: 'Role, Input, Steps, Expectation',
    example: `Role: Act as a project manager  \nInput: We're building an AI assistant feature  \nSteps: Ideation, prototyping, user testing  \nExpectation: Provide a checklist and timeline with ownership per task`,
  },
  // Bonus Frameworks
  {
    id: 'score',
    name: 'S.C.O.R.E.',
    emoji: '🟩',
    whenToUse: 'Persuasive writing, testimonials.',
    structure: 'Situation, Challenge, Outcome, Response, Evidence',
    example: `Situation: Before they used us  \nChallenge: They had X problems  \nOutcome: After using our product, they achieved Y  \nResponse: What they said about it  \nEvidence: Data or stat backing it up`,
  },
  {
    id: 'idea',
    name: 'I.D.E.A.',
    emoji: '🟨',
    whenToUse: 'Creative brainstorming.',
    structure: 'Inspiration, Development, Execution, Analysis',
    example: `Inspiration: What triggered the idea  \nDevelopment: How we'll build it  \nExecution: How we'll launch it  \nAnalysis: How we'll learn from it`,
  },
  {
    id: 'mice',
    name: 'M.I.C.E.',
    emoji: '🟪',
    whenToUse: 'Storytelling.',
    structure: 'Milieu, Idea, Character, Event',
    example: `Milieu: World/setting  \nIdea: Concept or dilemma  \nCharacter: Who changes  \nEvent: What happens`,
  },
  {
    id: 'jobs',
    name: 'J.O.B.S.',
    emoji: '🟦',
    whenToUse: 'Job/career prompts.',
    structure: 'Job Role, Objectives, Barriers, Solutions',
    example: `Job Role: Product Designer  \nObjectives: Improve design-to-dev handoff  \nBarriers: Miscommunication and rework  \nSolutions: Design tokens, shared Figma libraries`,
  },
  {
    id: 'clear',
    name: 'C.L.E.A.R.',
    emoji: '🟧',
    whenToUse: 'Coaching and leadership.',
    structure: 'Clarify, Listen, Explore, Act, Review',
    example: `Clarify: What's the real issue?  \nListen: Reflect and understand  \nExplore: Generate possible options  \nAct: Choose one step forward  \nReview: Reflect on results and iterate`,
  },
  {
    id: 'create',
    name: 'C.R.E.A.T.E.',
    emoji: '🟥',
    whenToUse: 'Product or project creation.',
    structure: 'Customer, Research, Execution, Action Plan, Testing, Evaluation',
    example: `Customer: Who are we serving  \nResearch: What do they need  \nExecution: Build core solution  \nAction Plan: Timeline + milestones  \nTesting: Validate the idea  \nEvaluation: Reflect on results`,
  },
]; 