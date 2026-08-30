# Action Plan Planner — Design Exploration

## Three possible directions

### 1. Operational Ledger

**Very Brief Intro:** A precise, editorial operations workspace inspired by Swiss accounting forms and high-end financial terminals. It uses clear typographic hierarchy, generous table density, and calm status signals to make complex budget decisions feel controlled.

**Probability:** 0.04

### 2. Atlas Workshop

**Very Brief Intro:** A tactile planning room influenced by cartographic notebooks, color-coded country tabs, and paper-like surfaces. It makes multi-country coordination feel spatial, approachable, and human.

**Probability:** 0.07

### 3. Signal Room

**Very Brief Intro:** A cool, analytical command center with dark slate panels, strong metric typography, and restrained data illumination. It frames budget planning as a real-time operational control system.

**Probability:** 0.03

---

## Chosen approach: Operational Ledger

### Design Movement

**Swiss editorial systems design with financial-ledger discipline.** The interface borrows the visual rigor of professional accounting forms, using strong alignment, compact metadata, unexpected but disciplined typography, and clean quantitative emphasis.

### Core Principles

1. **Data earns visual priority.** Money, budget state, country context, and due dates are never visually ambiguous.
2. **Structured density without clutter.** Tables preserve the familiar spreadsheet mental model while side panels and summary bands make decisions faster.
3. **Intentional contrast.** Warm paper surfaces and deep ink establish calm; one saturated signal color reserves attention for action and risk.
4. **Audit-friendly clarity.** Visible filters, row counts, allocation notes, and timestamp-style metadata support collaboration and trust.

### Color Philosophy

The base is **warm bone** rather than sterile white, which softens long planning sessions and references physical budget ledgers. Deep **ink navy** holds navigation and headings, grounding the application in credibility. The ownable **vermilion red** is strictly a signal color: it identifies the active country, create actions, approaching budget limits, and budget overruns. Sage, amber, and restrained blue remain semantic states only, never decoration.

### Layout Paradigm

A **ledger rail** structure replaces a generic centered dashboard. A fixed dark left rail anchors task navigation and context. A horizontal country ribbon directly below the application header sets the planning context. Within pages, a narrow summary ledger runs alongside or above the main workspace, allowing the wide data sheet to dominate. On mobile, the rail becomes a controlled drawer and the country ribbon scrolls horizontally.

### Signature Elements

1. **Country ribbon:** compact country tabs with a live total and active vermilion underline.
2. **Budget ledger tiles:** narrow, ruled cards that show allocated, remaining, and percentage used for every brand.
3. **Red index marks:** understated vertical vermilion strokes that precede page titles, active navigation, and high-priority budget states.

### Interaction Philosophy

Interactions behave like a professional tool, not a marketing website. Direct actions are clear, keyboard-friendly, and confirm their effect immediately. Live allocation checks appear within the current row or drawer, without distracting modals. Destructive actions require explicit confirmation; edits and saves present clear success feedback.

### Animation

The interface uses restrained, purposeful motion. Drawers and dialogs enter over **180–260 ms** using a quick custom ease-out, while cards and table rows rely on subtle background and opacity transitions only. The country underline moves between tabs, and live remaining-budget values briefly tint when they change. Hover states never animate more than transform and opacity. All non-essential motion respects reduced-motion preferences.

### Typography System

**Space Grotesk** provides operational headings, numeric highlights, and table headers with a crisp, compact character. **Source Sans 3** supplies highly legible body text, form labels, and dense table content. Headings use a 600–700 weight with tight tracking; monetary figures use tabular numerals and medium-to-bold weights. Body text remains at least 14 px, while table contents use 13–14 px with carefully managed line height.

### Brand Essence

**Action Plan Planner is a shared budget-control workspace for market teams that need the speed of a spreadsheet with the certainty of live allocation control.**

**Personality:** Exacting, calm, collaborative.

### Brand Voice

Headlines are concise, directional, and specific. CTAs use strong verbs and state the object of the action. Microcopy gives plain-language context rather than generic reassurance.

> “Allocate spend with the full country picture in view.”

> “Add a shared activity and split the cost before it reaches the plan.”

### Wordmark & Logo

The mark is a bold **stacked ledger glyph**: three uneven horizontal bars interrupted by a single vermilion index stroke, communicating line items, categories, and a precise point of control. The wordmark pairs the glyph with uppercase Space Grotesk tracking, never a default font treatment.

### Signature Brand Color

**Ledger Vermilion — `#E64D3D`**

## Style Decisions

- The main sheet must preserve the source workbook’s 20-column order and remain intentionally spreadsheet-like, but the surrounding workspace will provide operational context that Excel cannot.
- Generated brand artwork should remain abstract, low-contrast, and utility-focused; it will be used only in prominent empty states or overview panels and never behind dense data.
- Charts must favour flat, legible data marks and direct labels over gradients, excessive rounding, or decorative effects.
- Every route uses the global workspace shell: the visible stacked ledger glyph and uppercase Action Plan wordmark stay anchored in the dark ink navigation rail.
- The horizontal country ribbon is the primary context switcher. Its active country uses a Ledger Vermilion underline; vermilion does not decorate secondary UI.
- Administration and shared allocation reuse the ledger’s ruled panels, compact metadata labels, and tabular monetary figures rather than generic form-card treatment.
