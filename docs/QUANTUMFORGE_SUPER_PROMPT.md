/* 
=====================================================
QUANTUMFORGE SUPER PROMPT — GUIDANCE FOR AI ASSISTANTS
=====================================================

You are assisting in building **QuantumForge**, a quantum-aware workflow automation platform with a React/Tauri frontend and Flask + quantum runtime backend.

Your primary goals are:
1. Implement features **robustly and smoothly** for end users.
2. Preserve and enhance the **workflow authoring UX** (canvas + dual sidebars + sticky outcome tabs).
3. Introduce **Micro AI** capabilities in carefully chosen areas without breaking security, performance, or tests.

-----------------------------------------------------
A. PRODUCT & FEATURE MAP CONTEXT
-----------------------------------------------------

Use this mental model of the system (and corresponding files):

1) FRONTEND UX (React / Tauri)
   - Files: `src/`, `index.html`, React components like `Card.tsx`, `Badge.tsx`, `MicroAgentPanel.tsx`.
   - Responsibilities:
     * Quantum-themed UI with workflow canvas and dual sidebars.
     * Node palette on the left, properties + outcome intelligence on the right.
     * Sticky outcome tabs, drag/drop nodes, responsive drawers for smaller screens.
     * Status instrumentation (backend connected, nodes count, run status).
   - Rule: Build reusable UI primitives first (Cards, Panels, Tabs, MicroAgentPanel) and use them across Dashboard, WorkflowEditor, WorkflowLibrary, QuantumSecurityPanel, and SettingsPanel.

2) WORKFLOW AUTHORING SURFACES
   - Surfaces: 
     * Dashboard
     * WorkflowEditor (canvas)
     * WorkflowLibrary
     * QuantumSecurityPanel
     * SettingsPanel
   - Responsibilities:
     * Canvas: node creation, connection routing, zoom/pan, context menus.
     * Properties: workflow/node configuration in right sidebar (top section).
     * Outcome Analytics: bottom right section with sticky tabs (Overview, Timeline, History, Metrics, Risks, Suggestions, Scenarios, Copy Preview).
   - Rule: Do NOT break core interactions (drag/drop, connect, zoom, pan). When in doubt, keep existing behavior and improve incrementally.

3) AI COPILOTS / MICRO AI
   - Files: `ConstructorAI.tsx`, `MicroAgentPanel.tsx`, `MICRO_AI_IMPLEMENTATION.md` (and any dist mock wiring).
   - Responsibilities:
     * "MotherAI" script that understands workflow graphs.
     * Micro-agents that handle small, focused tasks (e.g., suggesting nodes, explaining flows, risk analysis).
     * Automated workflow suggestions (e.g., "Add retry node", "Add error handling for HTTP Request").
   - Rule: Implement AI features in a way that is **explainable to the user** (show why suggestions are made).

4) SECURITY & AUTH
   - Files: `BB84_INTEGRATION.md`, `AUTHENTICATION_IMPLEMENTATION.md`, `auth.py`, Rust crypto hooks.
   - Responsibilities:
     * BB84 quantum key distribution.
     * JWT + CSRF protection.
     * Tier-based rate limits.
   - Rule: Never bypass or weaken auth/crypto checks. If a change touches auth, consult the above docs and update tests (`test_auth.py`, `test_csrf_integration.py`).

5) BACKEND SERVICES
   - Files: `app.py`, `quantum_config.py`, `test_api.py`.
   - Responsibilities:
     * REST API for workflow CRUD, quantum job dispatch, analytics, and integration endpoints.
   - Rule: Keep API contracts compatible with existing tests. When adding endpoints, add or update tests to match.

6) QUANTUM & AUTOMATION ENGINES
   - Files: `aeonmi_runtime.py`, `core/*.aeonmi`, `automation_platforms_catalog.md`.
   - Responsibilities:
     * Execute workflows, talk to automation connectors, and run quantum/BB84-secured jobs.
   - Rule: Respect configuration/transport patterns defined in docs. Do not hard-code secrets or transports.

7) NATIVE / DESKTOP PACKAGING
   - Files: `src-tauri`, `aeonmi_app.spec`.
   - Responsibilities:
     * Package the app for desktop via Tauri and PyInstaller.
   - Rule: Keep Tauri/Rust and PyInstaller builds functional when changing paths or environment variables.

8) DEPLOYMENT & OPS
   - Files: `docker-compose.yml`, `DEPLOYMENT.md`, `PRODUCTION_DEPLOYMENT.md`, `BUILD.bat`.
   - Responsibilities:
     * Containerized environments, prod hardening, monitoring hooks.
   - Rule: Changes to environment variables, ports, or services must be reflected in these docs and compose files.

9) ANALYTICS & MONITORING
   - Files: monitoring guidance in `README`, UI sparkline components, backend metrics endpoints.
   - Responsibilities:
     * Expose runtime KPIs in the UI (sparklines, log panels).
   - Rule: Keep analytics non-blocking; if metrics calls fail, the rest of the app should still work.

10) DOCUMENTATION
    - Files: `ADVANCED_WORKFLOW_TYPES.md`, `BACKEND_INTEGRATION.md`, `QUANTUMFORGE_ULTIMATE_PLATFORM.md`, etc.
    - Responsibilities:
      * Cross-team onboarding, hardware setup, workflow types, deployment modes.
    - Rule: Update relevant docs whenever you add/change major features.

-----------------------------------------------------
B. MICRO AI: WHERE TO IMPLEMENT IT FIRST
-----------------------------------------------------

Prioritize **Micro AI** features in these areas (Phase 1):

1) Outcome / Prediction Panel (Right Sidebar – Bottom)
   - Tabs: Overview, Timeline, History, Metrics, Risks, Suggestions, Scenarios, Copy Preview.
   - Micro AI abilities:
     * Generate a natural-language overview of the current workflow.
     * Suggest missing nodes (retries, error handlers, validation, logging).
     * Identify risks (missing API keys, unhandled branches, rate-limit issues).
     * Run simple "what-if" scenarios (10/100/1000 runs/day; cost and load estimates).
     * Draft example end-user copy for Copy Preview (emails, posts, notifications).
   - Implementation notes:
     * Use `ConstructorAI` and MicroAgent infrastructure rather than embedding raw prompts everywhere.
     * Always show the source data used for the suggestion (nodes list, triggers, outputs).

2) AI & Machine Learning Nodes in the Palette
   - Categories: Text Generation, Chat/LLM, Summarize, Optimize/Improve.
   - Micro AI abilities:
     * Suggest prompts based on workflow goal.
     * Explain what a node does in plain language when selected.
     * Auto-fill sensible defaults (temperature, max tokens, etc.) based on node type.
   - Implementation notes:
     * Keep node behavior deterministic where needed (e.g., don't randomize prompts silently).
     * Show suggested prompts as editable text, not hidden logic.

3) WorkflowLibrary & Templates
   - Micro AI abilities:
     * Recommend templates based on tags or recent workflows.
     * Show "This template is similar to your last N workflows" explanations.

Phase 2 (later):
- QuantumSecurityPanel helpers (explain BB84 flows).
- Auto-generated documentation snippets ("Explain this workflow for my team").
- Intelligent debugging guidance ("Run failed at node X because Y").

-----------------------------------------------------
C. UX BEHAVIOR RULES (ROBUST & SMOOTH)
-----------------------------------------------------

1) Right Sidebar
   - Top 60%: Properties (scrolls vertically inside).
   - Bottom 40%: Outcome / Prediction (sticky tab bar, scrollable content).
   - Outcome tab bar:
     * Uses horizontal scrolling when there isn't enough space for all tabs.
     * Tabs stay visible while content scrolls underneath.
   - Do NOT allow the sidebar to extend beyond viewport height; scroll inside panels instead.

2) Left Sidebar (Node Palette)
   - Default width: ~240px (shrink slightly on small screens).
   - All categories **collapsed by default** on initial load.
   - Search, then categorized nodes (AI & ML, Media, Social Integrations, API & HTTP, Logic & Flow, Data Processing, Quantum).
   - Drag-and-drop is primary interaction.

3) Canvas
   - Must remain usable: pan, zoom, select, connect, group.
   - Use a light grid and avoid heavy eye strain.
   - Don't block canvas interactions while AI is thinking; use non-blocking toasts/spinners.

4) Responsiveness
   - ≥1280px: left sidebar + canvas + right sidebar all visible.
   - 1024–1280px: narrow sidebars slightly but keep three-panel layout.
   - <1024px: allow left/right panels to become slide-in drawers; keep canvas as primary view.

-----------------------------------------------------
D. IMPLEMENTATION PRACTICES
-----------------------------------------------------

1) Before making major changes:
   - Skim relevant docs:
     * `MICRO_AI_IMPLEMENTATION.md` for AI features.
     * `BB84_INTEGRATION.md` and `AUTHENTICATION_IMPLEMENTATION.md` for security/auth.
     * `BACKEND_INTEGRATION.md` for API changes.
   - Identify which tests will be affected (`test_api.py`, `test_auth.py`, `test_csrf_integration.py`).

2) When editing code:
   - Prefer small, coherent changes rather than huge refactors.
   - Reuse existing components (Card, Panel, Tabs, MicroAgentPanel) where possible.
   - Keep types and props explicit; avoid "any" or weakly typed data where TypeScript is used.

3) After changes:
   - Ensure the app still builds (web + Tauri).
   - Run existing tests and add new ones when you add new endpoints or critical behaviors.
   - Update docs (the relevant *.md files) if you add or change functionality.

-----------------------------------------------------
E. WHAT TO OUTPUT WHEN ASKED
-----------------------------------------------------

When the user asks for a change or feature:
1. Identify which part of the Feature Map is involved.
2. Show a short explanation of the approach (1–3 sentences).
3. Provide code changes as focused diffs or functions, not entire files when avoidable.
4. Mention any tests/docs that should be updated.
5. Ensure Micro AI features are confined to the designated areas unless explicitly asked otherwise.

END OF SPEC
*/
