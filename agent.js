import 'dotenv/config';
import { Command } from 'commander';
import { scanPage } from './tools/scanner.js';
import { createGitHubIssue } from './tools/github.js';
import {
  printBanner,
  printPhase,
  printLog,
  printViolationCard,
  printSummary,
  printSpinner
} from './ui.js';

// ─── MiniMax Reasoning Function ─────────────────────────────────────────────

async function reasonWithMiniMax(violations, url) {
  const prompt = `You are auditing the webpage: ${url}

Here are the accessibility violations found by axe-core:
${JSON.stringify(violations, null, 2)}

Analyze each violation and return a JSON array where each item has exactly this shape:
{
  "violationId": "string (axe rule id)",
  "description": "string (clear plain English description)",
  "affectedUsers": ["string array of affected user groups"],
  "businessImpact": "string (real-world business consequence)",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "confidence": number (0-100, how confident you are in this severity),
  "releaseRecommendation": "DO NOT SHIP | SHIP WITH WARNING | OK TO SHIP",
  "remediationHint": {
    "current": "string (broken HTML snippet)",
    "suggested": "string (fixed HTML snippet)",
    "explanation": "string (why this fix matters)"
  },
  "escalate": boolean
}

Return only the raw JSON array. No markdown. No explanation. No code fences.`;

  const groupId = process.env.MINIMAX_GROUP_ID;
  const apiKey = process.env.MINIMAX_API_KEY;
  const baseUrl = 'https://api.minimax.io/v1/text/chatcompletion_v2';
  const url_with_group = groupId && groupId !== 'paste_your_group_id_here'
    ? `${baseUrl}?GroupId=${groupId}`
    : baseUrl;

  const response = await fetch(url_with_group, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'MiniMax-M2',
      max_tokens: 4000,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are an expert accessibility QA engineer. Always respond with valid JSON only. No markdown, no explanation outside the JSON array. No code fences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

    if (!response.ok || (await response.clone().json()).base_resp?.status_code !== 0) {
      const data = await response.json();
      const errMsg = data.base_resp?.status_msg || data.error?.message || `HTTP ${response.status}`;
      
      // Fallback Mode: If API key fails, provide realistic mock data so the hackathon demo still works
      printLog('Warning', `MiniMax API error: ${errMsg}`, 'yellow');
      printLog('Info', 'Falling back to local Mock Reasoning Mode for Demo...', 'blue');
      
      return violations.map(v => {
        const confidence = v.impact === 'critical' ? 95 : v.impact === 'serious' ? 85 : 45;
        const severityStr = v.impact === 'critical' ? 'CRITICAL' : v.impact === 'serious' ? 'HIGH' : 'MEDIUM';
        return {
          violationId: v.id,
          description: v.description,
          affectedUsers: "[MOCK] Users relying on screen readers or keyboard navigation.",
          businessImpact: "[MOCK] Non-compliance risks legal action and blocks visually impaired users from core functionality.",
          severity: severityStr,
          confidence: confidence,
          releaseRecommendation: confidence >= 80 ? "DO NOT SHIP" : "SHIP WITH WARNING",
          remediationHint: {
            current: `<${v.nodes?.[0]?.html?.substring(0, 20) || 'Missing element'}...>`,
            suggested: `<!-- [MOCK FIX] Follow WCAG guidelines for ${v.id} -->`,
            explanation: "[MOCK] Implementing this fix ensures assistive technologies can parse the element."
          },
          escalate: confidence >= 80
        };
      });
    }

  const data = await response.json();
  let content = data.choices[0].message.content;

  // Strip markdown code fences if model ignores instructions
  content = content.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Raw MiniMax response:', content);
    throw new Error('Failed to parse MiniMax response as JSON');
  }
}

// ─── GitHub Issue Body Formatter ─────────────────────────────────────────────

function formatGitHubBody(issue, url) {
  const affected = Array.isArray(issue.affectedUsers)
    ? issue.affectedUsers.map(u => `- ${u}`).join('\n')
    : `- ${issue.affectedUsers}`;

  return `## 🤖 AI Accessibility QA Agent Report

| Field | Value |
|-------|-------|
| **URL Audited** | ${url} |
| **WCAG Rule** | \`${issue.violationId}\` |
| **Severity** | ${issue.severity} |
| **Confidence** | ${issue.confidence}% |
| **Release Recommendation** | ${issue.releaseRecommendation} |

---

## 👥 Affected Users

${affected}

---

## 💼 Business Impact

${issue.businessImpact}

---

## 🔧 Remediation

**Current (broken):**
\`\`\`html
${issue.remediationHint?.current || '(see violation above)'}
\`\`\`

**Suggested (fixed):**
\`\`\`html
${issue.remediationHint?.suggested || '(see remediation hint)'}
\`\`\`

**Why this matters:**
${issue.remediationHint?.explanation || ''}

---

*Generated by AI Accessibility QA Agent | QA Fraternity Hackathon 2026*`;
}

// ─── Main Audit Function ──────────────────────────────────────────────────────

async function audit(url) {
  try {
    // ── PHASE 1: OBSERVE ──────────────────────────────────────────
    printBanner();
    printPhase('OBSERVE', `Scanning ${url}`);

    const spinner1 = printSpinner('Launching browser and scanning for WCAG violations...');
    spinner1.start();

    let violations;
    try {
      violations = await scanPage(url);
    } catch (err) {
      spinner1.fail(`Scanner error: ${err.message}`);
      throw err;
    }

    spinner1.stop(`Found ${violations.length} WCAG violations`);

    if (violations.length === 0) {
      printLog('Action', '✓ No violations found! Page is accessible.', 'green');
      return;
    }

    // ── PHASE 2: REASON ───────────────────────────────────────────
    printPhase('REASON', `Sending ${violations.length} violations to MiniMax M2`);
    printLog('Reason', 'Analyzing who is affected by each violation...', 'magenta');
    printLog('Reason', 'Calculating business impact and severity...', 'magenta');
    printLog('Reason', 'Generating confidence scores and remediation hints...', 'magenta');

    const spinner2 = printSpinner('MiniMax M2 is reasoning...');
    spinner2.start();

    let reasonedIssues;
    try {
      reasonedIssues = await reasonWithMiniMax(violations, url);
    } catch (err) {
      spinner2.fail(`Reasoning error: ${err.message}`);
      throw err;
    }

    spinner2.stop(`Reasoning complete — ${reasonedIssues.length} issues analyzed`);

    // ── PHASE 3: DECIDE + ACT ─────────────────────────────────────
    const githubEnabled = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'paste_your_github_pat_here');

    printPhase('DECIDE', 'Applying confidence-based decision logic');
    printLog('Decision', `confidence ≥ 80%   →  AUTO ESCALATE ${githubEnabled ? '(GitHub issue)' : '(terminal only — GitHub not configured)'}`, 'yellow');
    printLog('Decision', 'confidence 50–80%  →  HUMAN REVIEW required', 'yellow');
    printLog('Decision', 'confidence < 50%   →  LOG ONLY', 'yellow');
    if (!githubEnabled) {
      printLog('Decision', '⚠  GitHub token not set — issue creation skipped', 'gray');
    }

    let autoEscalated = 0;
    let humanReview = 0;
    let logOnly = 0;
    const issuesCreated = [];

    for (const issue of reasonedIssues) {
      const confidence = issue.confidence ?? 0;
      const decision = confidence >= 80 ? 'AUTO_ESCALATE'
                     : confidence >= 50 ? 'HUMAN_REVIEW'
                     : 'LOG_ONLY';

      printViolationCard(issue);

      if (decision === 'AUTO_ESCALATE') {
        autoEscalated++;
        printLog('Decision', `Confidence ${confidence}% ≥ 80% → AUTO ESCALATING`, 'yellow');

        if (githubEnabled) {
          printLog('Action', 'Creating GitHub issue...', 'green');
          const title = `[${issue.severity}] ${issue.description} — AI Accessibility Agent`;
          const body = formatGitHubBody(issue, url);
          const labels = ['accessibility', 'ai-generated', (issue.severity || 'medium').toLowerCase()];

          try {
            const ghIssue = await createGitHubIssue({ title, body, labels });
            printLog('Action', `✓ Issue #${ghIssue.number} → ${ghIssue.html_url}`, 'green');
            issuesCreated.push({ number: ghIssue.number, url: ghIssue.html_url });
          } catch (err) {
            printLog('Error', `GitHub issue creation failed: ${err.message}`, 'red');
          }
        } else {
          printLog('Action', `[Would create issue] ${issue.severity}: ${issue.description}`, 'gray');
        }

      } else if (decision === 'HUMAN_REVIEW') {
        humanReview++;
        printLog('Decision', `Confidence ${confidence}% → Flagged for human review`, 'yellow');

      } else {
        logOnly++;
        printLog('Decision', `Confidence ${confidence}% → Logged only`, 'gray');
      }
    }

    // ── SUMMARY ───────────────────────────────────────────────────
    const hasCritical = reasonedIssues.some(
      i => i.severity === 'CRITICAL' && (i.confidence ?? 0) >= 80
    );

    printSummary({
      total: reasonedIssues.length,
      autoEscalated,
      humanReview,
      logOnly,
      issuesCreated,
      recommendation: hasCritical ? 'DO NOT SHIP' : 'REVIEW REQUIRED'
    });

  } catch (err) {
    printLog('Error', err.message, 'red');
    process.exit(1);
  }
}

// ─── Explain Command ──────────────────────────────────────────────────────────

async function explain(violationId) {
  try {
    printBanner();
    printPhase('REASON', `Explaining WCAG violation: ${violationId}`);

    const spinner = printSpinner(`Asking MiniMax M2 to explain '${violationId}'...`);
    spinner.start();

    const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMax-M2',
        max_tokens: 300,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `Explain WCAG violation '${violationId}' in plain English. Who does it affect, why does it matter, and give a concrete real-world example of the problem. Keep it under 150 words. Write for a developer who is not an accessibility expert.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      spinner.fail(`API error: ${response.status}`);
      throw new Error(errText);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    spinner.stop('Explanation ready');
    console.log('');
    explanation.split('\n').forEach(line => {
      printLog('Reason', line, 'magenta');
    });
    console.log('');

  } catch (err) {
    printLog('Error', err.message, 'red');
    process.exit(1);
  }
}

// ─── CLI Setup ────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('qa-agent')
  .description('AI Accessibility QA Agent — Observe, Reason, Act');

program
  .command('audit <url>')
  .description('Scan a URL for WCAG violations and auto-file GitHub issues')
  .action(audit);

program
  .command('explain <violationId>')
  .description('Explain a specific WCAG violation in plain English')
  .action(explain);

program.parse(process.argv);
