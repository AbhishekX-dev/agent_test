# 🤖 AI Accessibility QA Agent
## Complete Vibe-Coding Implementation Guide
### QA Fraternity AI Agent Hackathon | 16 May 2026 | 3-Hour Build

---

> **How to use this file:**  
> Open Google AI Studio (Gemini). Paste each prompt block **exactly as written** into the chat.  
> Follow the steps in order. Do not skip. Do not improvise until the end.

---

## Pre-Hackathon Checklist (Do at 9:30 AM sharp, before problem reveal)

```
[ ] Node.js installed → node --version  (need v18+)
[ ] Git installed → git --version
[ ] VS Code or any editor open
[ ] Terminal open
[ ] MiniMax API key copied from platform.minimax.io  
[ ] GitHub account open, Personal Access Token ready
    → github.com → Settings → Developer Settings → Personal Access Tokens → Classic
    → Scopes: check "repo"
[ ] Gemini (Google AI Studio) tab open
[ ] This file open and readable
[ ] Laptop plugged in
```

---

## THE PITCH (Memorize this. Say it from memory at demo.)

> *"Every sprint, front-end developers push code that accidentally breaks accessibility —  
> missing labels, contrast failures, keyboard traps. QA teams spend hours triaging  
> which violations actually matter and who is impacted.  
> No existing tool closes this loop autonomously.  
> We built an AI agent that observes violations, reasons about real user impact,  
> assigns confidence-weighted severity, and automatically files GitHub issues —  
> without a human in the loop."*

---

## WHAT WE'RE BUILDING (Judge-Facing Summary)

```
Track: 06 — Accessibility Testing
Agent: AI Accessibility QA Agent
Input: Any URL
Output: GitHub Issues + Terminal Reasoning Trace
Loop: Observe (axe-core) → Reason (MiniMax M2) → Act (GitHub)
```

**The 6 Deliverables from your plan — all covered:**

| # | Deliverable | Where it shows |
|---|------------|----------------|
| 1 | Accessibility Scan Report | Terminal `[Observe]` phase |
| 2 | Intelligent Triage | Terminal `[Reason]` phase |
| 3 | Remediation Hints | GitHub issue body + terminal |
| 4 | Severity + Release Decision | Terminal summary card |
| 5 | Autonomous GitHub Issue Creation | Live GitHub repo |
| 6 | Live Agent Reasoning Trace | Entire terminal session |

---

## HOUR 1: PROJECT SETUP + SCANNER (0:00 – 1:00)

---

### STEP 1 — Create project (you do this, not AI) [5 min]

Open terminal and run exactly:

```bash
mkdir qa-agent && cd qa-agent
npm init -y
npm install @axe-core/playwright playwright commander dotenv
npx playwright install chromium
mkdir tools
touch agent.js tools/scanner.js tools/github.js .env
```

---

### STEP 2 — Create `.env` file (you do this) [2 min]

Open `.env` and paste, filling in your values:

```
MINIMAX_API_KEY=paste_your_minimax_key_here
GITHUB_TOKEN=paste_your_github_pat_here
GITHUB_REPO=yourusername/qa-hackathon-demo
```

> **GitHub repo**: create a new empty public repo on github.com right now.  
> Name it `qa-hackathon-demo`. That's your demo target.

---

### STEP 3 — Vibe-code the scanner [15 min]

**Paste this into Gemini:**

```
I am building an AI agent hackathon project in Node.js (ES modules, "type": "module" in package.json).

Create the file `tools/scanner.js` that exports an async function `scanPage(url)`.

It must:
1. Launch a headless Chromium browser using playwright
2. Navigate to the given URL (timeout 30000, waitUntil: 'networkidle')
3. Wait 1000ms for dynamic content
4. Inject axe-core using @axe-core/playwright's injectAxe function
5. Run axe via page.evaluate using window.axe.run() with WCAG 2.0 and 2.1 tags:
   runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
6. Close the browser
7. Map violations to a clean array with these fields:
   - id (string)
   - description (string)
   - impact (string: 'critical'|'serious'|'moderate'|'minor')
   - wcagCriteria (string: axe tags filtered to those starting with 'wcag', joined by ', ')
   - affectedNodes: first 3 nodes mapped to { element: n.html.substring(0,200), failureSummary: n.failureSummary, target: n.target[0] }
   - nodeCount (number)
8. Console.log with ANSI color codes:
   - '\x1b[36m[Observe]\x1b[0m Launching browser...'
   - '\x1b[36m[Observe]\x1b[0m Navigating to {url}'
   - '\x1b[36m[Observe]\x1b[0m Injecting axe-core accessibility scanner...'
   - '\x1b[36m[Observe]\x1b[0m Found X WCAG violations across Y passing rules'
9. Return the violations array

Use ES module syntax (import/export). No TypeScript.
```

Copy the output into `tools/scanner.js`.

---

### STEP 4 — Vibe-code the GitHub tool [10 min]

**Paste this into Gemini:**

```
Create the file `tools/github.js` for a Node.js ES module project.

Export an async function `createGitHubIssue({ title, body, labels })`.

It must:
1. Read GITHUB_TOKEN and GITHUB_REPO from process.env
2. POST to https://api.github.com/repos/{GITHUB_REPO}/issues
3. Headers: Authorization: token {GITHUB_TOKEN}, Content-Type: application/json, Accept: application/vnd.github.v3+json
4. Body: JSON.stringify({ title, body, labels })
5. If response is not ok, throw new Error with the GitHub error message
6. Return the parsed JSON response

Use ES module syntax. Use native fetch (Node 18+). No external dependencies.
```

Copy the output into `tools/github.js`.

---

### STEP 5 — Test scanner works [8 min]

Create a temporary file `test-scan.js`:

```js
import 'dotenv/config';
import { scanPage } from './tools/scanner.js';

const violations = await scanPage('https://example.com');
console.log('Violations found:', violations.length);
console.log('First:', JSON.stringify(violations[0], null, 2));
```

Run: `node test-scan.js`

✅ You should see `[Observe]` lines and a violation count.  
❌ If error: paste the error into Gemini and say "fix this error in my scanner.js"

Delete `test-scan.js` after it works.

---

### STEP 6 — Create the demo broken HTML page [5 min]

Create `demo/broken-demo.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Demo Shop</title></head>
<body>
  <div style="color:#aaa;background:#ccc;font-size:10px">
    Special offer today only
  </div>
  <img src="product.jpg">
  <input type="text" placeholder="Enter your email address">
  <input type="password" placeholder="Password">
  <button>
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  </button>
  <div onclick="buy()" style="cursor:pointer;background:#eee;padding:10px">
    Complete Purchase
  </div>
  <a href="#">Click here</a>
  <a href="#">Click here</a>
  <a href="#">Read more</a>
  <table>
    <tr><td>Product</td><td>Price</td></tr>
    <tr><td>Widget</td><td>$29</td></tr>
  </table>
</body>
</html>
```

Install serve: `npm install -g serve`  
Run: `serve demo -p 3001`  
Test scan: `node test-scan.js` with URL `http://localhost:3001/broken-demo.html`

This should produce **6-10 violations including CRITICAL ones**. This is your guaranteed demo URL.

---

## HOUR 2: THE BRAIN + TERMINAL UI (1:00 – 2:00)

---

### STEP 7 — Vibe-code the MiniMax reasoning function [20 min]

**Paste this into Gemini:**

```
I'm building an AI agent hackathon project. Create a Node.js ES module function called `reasonWithMiniMax(violations, url)` that I will add to my agent.js file.

This function must:
1. Call the MiniMax text completion API at: https://api.minimax.io/v1/text/chatcompletion_v2
2. Use fetch (native Node 18+)
3. Headers: Authorization: Bearer {process.env.MINIMAX_API_KEY}, Content-Type: application/json
4. Model: "MiniMax-M2"
5. Max tokens: 4000, temperature: 0.2
6. System message: "You are an expert accessibility QA engineer. Always respond with valid JSON only. No markdown, no explanation outside the JSON array. No code fences."

7. User message should be a prompt that:
   - States the URL audited
   - Embeds the violations array as JSON.stringify(violations, null, 2)
   - Asks the model to analyze each violation and return a JSON array where each item has:
     {
       violationId: string,
       description: string,
       affectedUsers: string[],  // e.g. ['screen-reader users', 'keyboard-only users']
       businessImpact: string,   // e.g. "Users cannot complete checkout independently"
       severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
       confidence: number,       // 0-100
       releaseRecommendation: 'DO NOT SHIP' | 'SHIP WITH WARNING' | 'OK TO SHIP',
       remediationHint: {
         current: string,        // the broken HTML snippet
         suggested: string,      // the fixed HTML snippet
         explanation: string
       },
       escalate: boolean
     }

8. After getting the response, extract data.choices[0].message.content
9. Strip any markdown code fences (replace ```json, ```)
10. Parse as JSON and return the array
11. If parsing fails, log the raw response and throw an error

Return the function as ES module compatible code.
```

Save this function. You'll paste it into `agent.js` in the next step.

---

### STEP 8 — Vibe-code the Claude Code-style terminal UI [25 min]

This is the most important visual part. **Paste this into Gemini:**

```
I'm building a CLI agent tool in Node.js (ES modules). I need a beautiful terminal output system inspired by Claude Code's terminal design.

Create a file `ui.js` that exports these functions. Use only ANSI escape codes (no external chalk dependency needed, but chalk is installed if needed).

Design requirements — Claude Code style:
- Clean monospace terminal feel  
- Cyan for [Observe] phase labels
- Magenta for [Reason] phase labels
- Yellow for [Decision] labels
- Green for [Action] success labels
- Red for CRITICAL severity
- Yellow for HIGH severity
- Cyan for MEDIUM severity
- Gray for LOW severity
- Use box-drawing characters (─ ═ │ ┌ ┐ └ ┘) for section headers
- Use spinner/progress indicators using \r to overwrite lines

Export these functions:

1. `printBanner()` — prints the startup banner:
   - A full-width line of ═ characters (60 wide)
   - "  🤖 AI Accessibility QA Agent" in bold white
   - "  QA Fraternity AI Agent Hackathon 2026" in gray  
   - "  Observe → Reason → Act" in cyan
   - Another ═ line

2. `printPhase(phase, message)` — phase header with box drawing:
   - phase is 'OBSERVE', 'REASON', 'DECIDE', 'ACT'
   - prints "┌─ [OBSERVE] ─────────────────────┐" style header with the message inside
   - Use appropriate color per phase

3. `printLog(tag, message, color)` — single log line:
   - Prints "[tag] message" with color
   - Pad tag to 10 chars for alignment
   - tag colors: Observe=cyan, Reason=magenta, Decision=yellow, Action=green, Error=red

4. `printViolationCard(issue)` — prints a triage card:
   - Top border line
   - Severity badge colored (CRITICAL=red, HIGH=yellow, MEDIUM=cyan, LOW=gray)
   - Description
   - "Affected: screen-reader users, keyboard-only users" 
   - "Impact: {businessImpact}"
   - "Confidence: {n}%" with a mini ASCII bar: ████████░░ (filled based on %)
   - "Recommendation: DO NOT SHIP" in appropriate color
   - Bottom border

5. `printSummary(stats)` — final summary box:
   - stats = { total, critical, autoEscalated, humanReview, logOnly, issuesCreated: [{number, url}], recommendation }
   - Bordered box with:
     - "📊 AGENT AUDIT COMPLETE" header
     - Stats grid
     - List of GitHub issue URLs
     - Final GO/NO-GO recommendation in big colored text

6. `printSpinner(message)` — returns a spinner controller:
   - { start(), stop(successMsg), fail(errorMsg) }
   - Uses setInterval with frames ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏']
   - Overwrites line using \r

Use ES module exports. No external libraries. Pure Node.js + ANSI codes.
```

Copy output into `ui.js`.

---

### STEP 9 — Vibe-code the main agent.js [20 min]

**Paste this into Gemini:**

```
Create the main file `agent.js` for my AI agent hackathon project. This is a Node.js ES module CLI tool.

It must be executable with: node agent.js audit <url>

Imports needed:
- 'dotenv/config'
- { Command } from 'commander'
- { scanPage } from './tools/scanner.js'
- { createGitHubIssue } from './tools/github.js'
- { printBanner, printPhase, printLog, printViolationCard, printSummary, printSpinner } from './ui.js'
- The reasonWithMiniMax function (paste inline, I'll give it to you)

[paste the reasonWithMiniMax function from Step 7 here when asking Gemini]

The agent logic:

async function audit(url):

PHASE 1 - OBSERVE:
  - printBanner()
  - printPhase('OBSERVE', 'Scanning ' + url)
  - spinner = printSpinner('Launching browser and scanning for WCAG violations...')
  - spinner.start()
  - violations = await scanPage(url)
  - spinner.stop('Found ' + violations.length + ' WCAG violations')
  - if violations.length === 0: print success and return

PHASE 2 - REASON:
  - printPhase('REASON', 'Sending ' + violations.length + ' violations to MiniMax M2')
  - printLog('Reason', 'Analyzing who is affected by each violation...', 'magenta')
  - printLog('Reason', 'Calculating business impact and severity...', 'magenta')
  - printLog('Reason', 'Generating confidence scores and remediation hints...', 'magenta')
  - spinner = printSpinner('MiniMax M2 is reasoning...')
  - spinner.start()
  - reasonedIssues = await reasonWithMiniMax(violations, url)
  - spinner.stop('Reasoning complete — ' + reasonedIssues.length + ' issues analyzed')

PHASE 3 - DECIDE + ACT:
  - printPhase('DECIDE', 'Applying confidence-based decision logic')
  - printLog('Decision', 'confidence > 80%  →  AUTO ESCALATE (GitHub issue)', 'yellow')
  - printLog('Decision', 'confidence 50–80%  →  HUMAN REVIEW required', 'yellow')
  - printLog('Decision', 'confidence < 50%   →  LOG ONLY', 'yellow')
  - blank line
  
  For each issue in reasonedIssues:
    - decision = confidence >= 80 ? 'AUTO_ESCALATE' : confidence >= 50 ? 'HUMAN_REVIEW' : 'LOG_ONLY'
    - printViolationCard(issue)
    
    if AUTO_ESCALATE:
      - printLog('Decision', 'Confidence ' + confidence + '% > 80% → AUTO ESCALATING', 'yellow')
      - printLog('Action', 'Creating GitHub issue...', 'green')
      - title = '[' + severity + '] ' + description + ' — AI Accessibility Agent'
      - body = formatGitHubBody(issue, url)  [see below]
      - ghIssue = await createGitHubIssue({ title, body, labels: ['accessibility', 'ai-generated', severity.toLowerCase()] })
      - printLog('Action', '✓ Issue #' + ghIssue.number + ' → ' + ghIssue.html_url, 'green')
      - push to issuesCreated array
    
    if HUMAN_REVIEW:
      - printLog('Decision', 'Confidence ' + confidence + '% → Flagged for human review', 'yellow')
    
    if LOG_ONLY:
      - printLog('Decision', 'Confidence ' + confidence + '% → Logged only', 'gray')

SUMMARY:
  - hasCritical = any issue with severity CRITICAL and confidence >= 80
  - printSummary({
      total: reasonedIssues.length,
      autoEscalated: count,
      humanReview: count,
      logOnly: count,
      issuesCreated: array of {number, url: html_url},
      recommendation: hasCritical ? 'DO NOT SHIP' : 'REVIEW REQUIRED'
    })

Also create formatGitHubBody(issue, url) function that returns a markdown string for the GitHub issue body:
- Header: "## 🤖 AI Accessibility QA Agent Report"
- URL, WCAG Rule, Severity, Confidence%, Release Recommendation
- "## 👥 Affected Users" with bullet list
- "## 💼 Business Impact"
- "## 🔧 Remediation" with before (❌ broken HTML) and after (✅ fixed HTML) in code blocks
- Footer: "Generated by AI Accessibility QA Agent | QA Fraternity Hackathon 2026"

CLI setup using Commander:
- program.name('qa-agent')
- command: 'audit <url>' with description and action calling audit(url)
- program.parse(process.argv)

ES modules. Handle errors with try/catch. On error: printLog('Error', err.message, 'red') and process.exit(1).
```

Copy into `agent.js`.

---

## HOUR 3: POLISH + DEMO PREP (2:00 – 3:00)

---

### STEP 10 — End-to-end test run [20 min]

In one terminal, serve the demo page:
```bash
serve demo -p 3001
```

In another terminal, run the full agent:
```bash
node agent.js audit http://localhost:3001/broken-demo.html
```

**What you should see:**
```
════════════════════════════════════════════════════════════
  🤖 AI Accessibility QA Agent
  QA Fraternity AI Agent Hackathon 2026
  Observe → Reason → Act
════════════════════════════════════════════════════════════

┌─ [OBSERVE] Scanning http://localhost:3001/broken-demo.html ─┐
  ⠋ Launching browser and scanning for WCAG violations...
  ✓ Found 8 WCAG violations

┌─ [REASON] Sending 8 violations to MiniMax M2 ──────────────┐
  [Reason   ] Analyzing who is affected by each violation...
  [Reason   ] Calculating business impact and severity...
  ⠋ MiniMax M2 is reasoning...
  ✓ Reasoning complete — 8 issues analyzed

┌─ [DECIDE] Applying confidence-based decision logic ─────────┐
  [Decision ] confidence > 80%  →  AUTO ESCALATE
  [Decision ] confidence 50-80% →  HUMAN REVIEW
  [Decision ] confidence < 50%  →  LOG ONLY

  ┌─ CRITICAL ──────────────────────────────────────┐
  │ Interactive element has no accessible name       │
  │ Affected: screen-reader users, keyboard users    │
  │ Impact: Users cannot complete checkout           │
  │ Confidence: 92% ████████████████████░░░░         │
  │ Recommendation: DO NOT SHIP                      │
  └─────────────────────────────────────────────────┘
  [Decision ] Confidence 92% > 80% → AUTO ESCALATING
  [Action   ] Creating GitHub issue...
  [Action   ] ✓ Issue #1 → https://github.com/you/qa-hackathon-demo/issues/1
```

---

### STEP 11 — Fix any issues [15 min]

**Common errors and exact Gemini prompts to fix them:**

If scanner crashes:
```
My Node.js scanner.js using @axe-core/playwright is throwing this error: [paste error]
The file uses ES modules. Fix the import and the injectAxe usage.
```

If MiniMax returns non-JSON:
```
My MiniMax API call returns this response but JSON.parse fails: [paste raw response]
Fix the parsing in my reasonWithMiniMax function to handle this format.
```

If GitHub returns 404:
```
My GitHub API call returns 404. My GITHUB_REPO env var is "username/repo-name".
The fetch URL is https://api.github.com/repos/${GITHUB_REPO}/issues.
What is wrong with my createGitHubIssue function?
```

If terminal colors don't show:
```
My ANSI color codes work in terminal but the box-drawing characters show as ???
Fix my ui.js to use simpler box characters or fallback ASCII: - = | + 
```

---

### STEP 12 — Add the `explain` command (bonus, if time allows) [10 min]

**Paste into Gemini:**

```
Add a second CLI command to my agent.js Commander setup:

Command: explain <violationId>
Description: "Explain a specific WCAG violation in plain English"

It should:
1. Call MiniMax M2 with a simple prompt: "Explain WCAG violation '{violationId}' in plain English. 
   Who does it affect, why does it matter, and give a concrete real-world example of the problem. 
   Keep it under 150 words. Write for a developer who is not an accessibility expert."
2. Print the response nicely in the terminal using printLog

Usage: node agent.js explain color-contrast
```

---

### STEP 13 — Demo rehearsal × 2 [20 min]

**Run your full demo twice. Time yourself.**

Round 1: Just run it, watch it work.  
Round 2: Narrate out loud as if presenting. Say these words as each section prints:

| When you see | Say out loud |
|---|---|
| `[Observe]` lines | "The agent is opening a headless browser and running axe-core — this is the Observe phase" |
| `⠋ MiniMax M2 is reasoning...` | "Now MiniMax M2 is analyzing every violation — reasoning about who is actually affected in the real world, not just which WCAG rule was broken" |
| `Confidence 92% →` | "The agent calculated 92% confidence — above our 80% threshold — so it's making the call to auto-escalate without asking us" |
| `✓ Issue #1 →` | "And there it is — GitHub issue created automatically. Let me show you that" (switch to browser tab showing the issue) |
| Summary box | "CRITICAL severity, 3 issues auto-escalated — agent says DO NOT SHIP. That's the whole loop: observe, reason, act." |

---

### STEP 14 — Prepare your fallback [5 min]

Record a 60-second screen recording of the agent running successfully.  
Use QuickTime (Mac), Xbox Game Bar (Windows), or OBS.

If the live demo breaks tomorrow, play the recording and narrate over it.  
Say: "Let me show you a recording from our test run while I restart the server."  
Judges respect composure. They penalize silence.

---

## Final File Structure

```
qa-agent/
├── agent.js          ← main CLI entry point
├── ui.js             ← Claude Code-style terminal UI
├── tools/
│   ├── scanner.js    ← Playwright + axe-core tool
│   └── github.js     ← GitHub Issues API tool
├── demo/
│   └── broken-demo.html   ← your guaranteed demo target
├── .env              ← API keys (never commit this)
└── package.json
```

---

## The Agent Loop (Say This to Judges If Asked)

```
OBSERVE:   Playwright opens the page, axe-core scans the DOM
           → returns structured JSON of WCAG violations

REASON:    MiniMax M2 receives all violations
           → reasons about affected users, business impact, severity
           → assigns confidence score per violation

DECIDE:    Agent applies confidence threshold logic autonomously
           → ≥80%: auto-escalate (no human needed)
           → 50–80%: flag for human review  
           → <50%: log only

ACT:       For auto-escalate decisions:
           → creates structured GitHub issue
           → includes WCAG rule, affected users, before/after fix, severity
```

This is a real agent loop. It observes tool output. It reasons dynamically.  
It makes decisions. It acts on external systems.  
Not a chatbot. Not a script. An agent.

---

## Answering Judge Questions

| Judge asks | You say |
|---|---|
| "Why MiniMax M2?" | "It's purpose-built for agentic workflows with native tool-calling and a 200K context window — I can send the entire violation JSON in one shot" |
| "Why axe-core and not a manual scan?" | "axe-core gives me structured data — element selectors, WCAG rules, DOM context — which is far richer input for the LLM than a screenshot" |
| "Why not just run axe-core without the AI?" | "axe-core tells you WHAT is broken. The agent tells you WHO is affected, WHY it matters for the business, and HOW to fix it. That's the gap we're filling." |
| "What would you add with more time?" | "GitHub Actions integration — this runs on every PR before merge. Zero human intervention in the accessibility review loop." |
| "What if the AI gets it wrong?" | "That's exactly why we have the confidence threshold. Below 80% it doesn't act — it asks for human review. Below 50% it just logs. The agent knows when it's uncertain." |
| Something you don't know | "I don't know the exact answer, but here's how I'd investigate it — [say one concrete next step]" |

---

## Emergency Commands

```bash
# Kill everything and restart
pkill -f playwright ; pkill -f serve

# Re-serve demo page  
serve demo -p 3001

# Run agent
node agent.js audit http://localhost:3001/broken-demo.html

# Test MiniMax key is working
curl -s -X POST https://api.minimax.io/v1/text/chatcompletion_v2 \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"MiniMax-M2","messages":[{"role":"user","content":"Reply with: API OK"}],"max_tokens":20}' | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); console.log(JSON.parse(d).choices[0].message.content)"

# Test GitHub token
curl -s https://api.github.com/user -H "Authorization: token $GITHUB_TOKEN" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); console.log(JSON.parse(d).login)"
```

---

## Timing Summary

| Time | What |
|---|---|
| 9:30 AM | Arrive, set up, verify all keys work |
| 9:45 AM | Problem statement revealed (note it, adapt if needed) |
| 9:50 AM | Start Step 1 |
| 10:50 AM | Hour 1 done — scanner + github tool working |
| 11:50 AM | Hour 2 done — full agent runs end-to-end |
| 12:50 PM | Hour 3 done — polished, tested, rehearsed |
| 1:00 PM | Buffer + second rehearsal |
| Demo time | You're ready |

---

> **Last thing:** The judges have seen 50 demos.  
> What they remember is not the code.  
> It's whether the agent made a real decision and they could see it happen.  
> Show them the reasoning. Narrate every line. Don't go silent.  
>   
> You've got this. 🍊
