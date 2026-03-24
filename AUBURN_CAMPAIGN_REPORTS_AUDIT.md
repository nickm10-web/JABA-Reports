# Auburn Campaign Reports Audit

## Executive Summary
This audit reviewed the three Auburn campaign reports exposed from the Auburn hub:

- Baumhower's in [AuburnCampaignOverview.tsx](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx)
- Dude Wipes in [AuburnDudewipesCampaign.tsx](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx)
- Amsterdam Cafe x Rocco's Chicken Joint in [AuburnAmsterdamCafeReport.tsx](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx)

The set is not production-ready as a coherent group. The main blockers are:

- Two reports still use root-relative asset paths that will break under non-root deployment.
- The Baumhower's report contains at least one materially incorrect comparison label and additional stale benchmark content.
- Navigation and deep-link behavior are inconsistent across the three reports.
- Benchmark methodology and reporting context are uneven, with Dude Wipes showing the most provenance and the other two relying on hard-coded claims without equivalent disclosure.

The highest priority fixes are deployment-safe asset loading, correction of mislabeled Baumhower's performance claims, and normalization of direct entry/back-navigation behavior.

## High-Severity Findings
### P1: Root-relative assets will break Baumhower's and Amsterdam/Rocco's under non-root deployment
File references:
- [AuburnCampaignOverview.tsx:21](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L21)
- [AuburnCampaignOverview.tsx:26](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L26)
- [AuburnCampaignOverview.tsx:49](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L49)
- [AuburnCampaignOverview.tsx:60](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L60)
- [AuburnCampaignOverview.tsx:191](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L191)
- [AuburnAmsterdamCafeReport.tsx:18](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L18)
- [AuburnAmsterdamCafeReport.tsx:23](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L23)
- [AuburnAmsterdamCafeReport.tsx:30](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L30)
- [AuburnAmsterdamCafeReport.tsx:48](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L48)
- [AuburnAmsterdamCafeReport.tsx:60](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L60)

Why it matters:
These reports will 404 images when the app is served from a base path instead of `/`, which makes them unsafe to deploy anywhere except root.

Evidence:
- Baumhower's references `/tahaad.png`, `/keshawn.png`, `/baumhowers-post.png`, and `/Untitled%20design%20(53).png` directly.
- Amsterdam/Rocco's references `/amsterdam_logo.png`, `/roccos_logo.png`, `/keshawn.png`, `/amsterdam-cafe-post.png`, and `/roccos-post.png` directly.
- Dude Wipes already avoids this for rendered assets by using `import.meta.env.BASE_URL` in [AuburnDudewipesCampaign.tsx:123](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L123).

Recommended fix direction:
Adopt a single asset-loading convention across all three reports based on `import.meta.env.BASE_URL` or imported assets and remove root-relative references from Auburn report code.

### P1: Baumhower's "Peak Engagement Lift" card is mislabeled against the underlying calculation
File references:
- [AuburnCampaignOverview.tsx:82](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L82)
- [AuburnCampaignOverview.tsx:89](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L89)
- [AuburnCampaignOverview.tsx:436](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L436)
- [AuburnCampaignOverview.tsx:439](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L439)

Why it matters:
This is a materially incorrect performance claim inside the report body. It changes the meaning of the number from a top-post comparison to a recent-post comparison.

Evidence:
- `engagementMultiplier` is defined as `31` with the comment `Top partnership (3,489) vs top non-partnership (111)`.
- The UI presents that same `31x` value as `Campaign post vs Baumhower's recent posts`.
- Those are not the same comparison set.

Recommended fix direction:
Either relabel the card to match the actual top-partnership vs top-non-partnership calculation or replace the value with a metric actually derived from recent Baumhower's posts.

## Medium-Severity Findings
### P2: Baumhower's has no direct route, so only two of the three Auburn reports are shareable as standalone pages
File references:
- [AuburnReportHub.tsx:16](/Users/jaba/REPORTS/src/components/AuburnReportHub.tsx#L16)
- [AuburnReportHub.tsx:51](/Users/jaba/REPORTS/src/components/AuburnReportHub.tsx#L51)
- [AuburnReportHub.tsx:73](/Users/jaba/REPORTS/src/components/AuburnReportHub.tsx#L73)
- [App.tsx:234](/Users/jaba/REPORTS/src/App.tsx#L234)
- [App.tsx:237](/Users/jaba/REPORTS/src/App.tsx#L237)

Why it matters:
The report set behaves inconsistently. Dude Wipes and DDnD can be opened directly, while Baumhower's is only reachable through Auburn hub component state.

Evidence:
- The hub uses `activeView === 'baumhowers'` to render Baumhower's internally.
- `App.tsx` defines `/auburn/dudewipes`, `/auburn/heydude`, and `/auburn/ddnd`, but there is no `/auburn/baumhowers` route.

Recommended fix direction:
Add a first-class route for Baumhower's and use route-based navigation for all three Auburn reports.

### P2: Back-navigation behavior is inconsistent and disappears on direct entry for two routed reports
File references:
- [App.tsx:50](/Users/jaba/REPORTS/src/App.tsx#L50)
- [App.tsx:56](/Users/jaba/REPORTS/src/App.tsx#L56)
- [AuburnDudewipesCampaign.tsx:134](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L134)
- [AuburnAmsterdamCafeReport.tsx:192](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L192)
- [AuburnCampaignOverview.tsx:146](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L146)

Why it matters:
Direct visitors to `/auburn/dudewipes` and `/auburn/ddnd` may have no visible path back to the Auburn hub, while Baumhower's always has an in-app back button when opened from hub state.

Evidence:
- Route wrappers only pass `onBack` when `window.history.length > 2`.
- Both routed components render the button only if `onBack` exists.
- Baumhower's is not directly routable and relies on internal hub state, so its back path is structurally different.

Recommended fix direction:
Make the back target explicit and deterministic for all Auburn report routes instead of inferring it from browser history length.

### P2: Baumhower's includes stale athlete benchmark content that does not match the campaign being presented
File references:
- [AuburnCampaignOverview.tsx:17](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L17)
- [AuburnCampaignOverview.tsx:57](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L57)
- [AuburnCampaignOverview.tsx:118](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L118)
- [AuburnCampaignOverview.tsx:511](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L511)

Why it matters:
The report mixes campaign-specific data for Tahaad Pettiford and Keshawn Murphy with unrelated benchmark rows for Keyshawn Hall and Kevin Overton, which makes the athlete section look stale or copied from another report.

Evidence:
- Featured athletes are Tahaad Pettiford and Keshawn Murphy.
- Campaign posts and captions also reference those two athletes.
- The benchmark table instead displays Keyshawn Hall and Kevin Overton.

Recommended fix direction:
Replace the benchmark rows with campaign-relevant athletes or remove the section until verified benchmark data exists for the featured participants.

### P2: Dude Wipes contains unsupported summary claims that are not fully backed by the visible comparison sets
File references:
- [AuburnDudewipesCampaign.tsx:189](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L189)
- [AuburnDudewipesCampaign.tsx:304](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L304)
- [AuburnDudewipesCampaign.tsx:315](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L315)
- [AuburnDudewipesCampaign.tsx:388](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L388)
- [AuburnDudewipesCampaign.tsx:472](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L472)

Why it matters:
The report presents precise percentile-style conclusions, but the page itself only exposes an 18-post recent-likes slice and a 10-row top-collaborations slice. That leaves some headline claims unverifiable from the displayed evidence.

Evidence:
- The report says the reel `outperformed 93% of posts on the @dudewipes account`.
- The visible recent-post section compares against `@dudewipes' last 18 posts`.
- The alternate comparison mode shows only the top 10 collaboration rows, even though the text references all 38 collaborations.
- The page also states Auburn is the only partner to appear multiple times in the top 10, but the page does not surface the full top-10 provenance beyond the hard-coded array.

Recommended fix direction:
Either expose the full benchmark set and methodology on-page or soften the claims to match exactly what is displayed.

### P2: Dude Wipes EMV is derived from arbitrary constants embedded in the component, not a documented report methodology
File references:
- [AuburnDudewipesCampaign.tsx:119](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L119)
- [AuburnDudewipesCampaign.tsx:121](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L121)
- [AuburnDudewipesCampaign.tsx:281](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L281)
- [AuburnDudewipesCampaign.tsx:406](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L406)

Why it matters:
The page presents EMV as an analytic output, but the implementation uses hard-coded `likeValue` and `commentValue` constants with no reference to a shared model, source data, or standardized formula.

Evidence:
- EMV is calculated as `likes * 0.5 + comments * 1.5`.
- Non-campaign rows in the top-collaborations table use likes-only EMV estimates because comment data is unavailable.

Recommended fix direction:
Move EMV methodology into a shared, documented utility or label it more explicitly as a simplified internal estimate rather than a report metric.

### P2: Amsterdam/Rocco's lacks the benchmark provenance and timing disclosure present in Dude Wipes
File references:
- [AuburnAmsterdamCafeReport.tsx:69](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L69)
- [AuburnAmsterdamCafeReport.tsx:119](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L119)
- [AuburnAmsterdamCafeReport.tsx:206](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L206)
- [AuburnAmsterdamCafeReport.tsx:476](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L476)

Why it matters:
The report makes precise rank and multiplier claims, but unlike Dude Wipes it does not show when the data was pulled or what exact time window the analysis covers in the rendered UI.

Evidence:
- Amsterdam and Rocco's stats are hard-coded as `100 posts` and `48 posts`.
- The page header only says `Auburn Playfly NIL Max Campaign Report`.
- The all-time section says `Out of X posts analyzed` but does not disclose pull date or collection window.

Recommended fix direction:
Add the same level of source-window and pull-date disclosure that Dude Wipes already includes.

### P2: Baumhower's and Amsterdam/Rocco's fall back to third-party placeholder assets, creating branding and offline reliability risk
File references:
- [AuburnCampaignOverview.tsx:222](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L222)
- [AuburnCampaignOverview.tsx:562](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L562)
- [AuburnAmsterdamCafeReport.tsx:241](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L241)
- [AuburnAmsterdamCafeReport.tsx:271](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L271)
- [AuburnAmsterdamCafeReport.tsx:644](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L644)

Why it matters:
If a local asset fails, the reports swap to `via.placeholder.com` or an Unsplash image. That introduces network dependence and off-brand visual content into a client-facing report.

Evidence:
- Athlete images fall back to `https://via.placeholder.com/100`.
- Post cards fall back to an Unsplash restaurant image.

Recommended fix direction:
Use local fallback states or branded placeholders already shipped with the app instead of third-party URLs.

### P2: All three reports are high-edit-cost because campaign data and view logic are tightly coupled
File references:
- [AuburnCampaignOverview.tsx:7](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L7)
- [AuburnDudewipesCampaign.tsx:3](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L3)
- [AuburnAmsterdamCafeReport.tsx:8](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L8)
- [AuburnCampaignOverview.tsx:542](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L542)
- [AuburnAmsterdamCafeReport.tsx:624](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L624)

Why it matters:
Any future campaign refresh requires editing large inline data objects and duplicated presentational helpers in separate files, which increases the chance of stale claims and uneven fixes.

Evidence:
- Each report defines its own large campaign data objects in the component file.
- Baumhower's and Amsterdam/Rocco's each duplicate `MetricCard`, `PostCard`, and pill-style helper patterns.
- There is no shared Auburn campaign schema or renderer.

Recommended fix direction:
Separate campaign data from rendering and normalize shared presentation primitives even if the reports remain hand-authored.

## Low-Severity Findings
### P3: Report naming is inconsistent across hub labels, component names, and routes
File references:
- [AuburnReportHub.tsx:57](/Users/jaba/REPORTS/src/components/AuburnReportHub.tsx#L57)
- [AuburnReportHub.tsx:68](/Users/jaba/REPORTS/src/components/AuburnReportHub.tsx#L68)
- [AuburnReportHub.tsx:79](/Users/jaba/REPORTS/src/components/AuburnReportHub.tsx#L79)
- [App.tsx:50](/Users/jaba/REPORTS/src/App.tsx#L50)
- [App.tsx:56](/Users/jaba/REPORTS/src/App.tsx#L56)
- [AuburnCampaignOverview.tsx:155](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L155)

Why it matters:
The set reads as partially standardized and partially ad hoc, which weakens the perception that these are a deliberate family of reports.

Evidence:
- Hub label says `Dudewipes Report`, while the report itself says `Dude Wipes`.
- The DDnD route is `/auburn/ddnd`, while the hub card says `Diners, Drive-Ins & Dives`.
- Baumhower's lives in `AuburnCampaignOverview.tsx` but the hub presents it as `Baumhower's Report`.

Recommended fix direction:
Standardize one naming scheme across file names, route slugs, hub card labels, and on-page titles.

### P3: Cross-report visual structure is noticeably uneven
File references:
- [AuburnCampaignOverview.tsx:145](/Users/jaba/REPORTS/src/components/AuburnCampaignOverview.tsx#L145)
- [AuburnDudewipesCampaign.tsx:130](/Users/jaba/REPORTS/src/components/AuburnDudewipesCampaign.tsx#L130)
- [AuburnAmsterdamCafeReport.tsx:191](/Users/jaba/REPORTS/src/components/AuburnAmsterdamCafeReport.tsx#L191)

Why it matters:
The Auburn report set does not read as one product line. Dude Wipes looks like a more polished standalone campaign report, while Baumhower's and Amsterdam/Rocco's feel closer to internal mockups.

Evidence:
- Dude Wipes has a stronger source note, comparison toggle, and custom back-button treatment.
- Baumhower's and Amsterdam/Rocco's use simpler white headers and generic section pacing.

Recommended fix direction:
Define a minimum Auburn campaign-report shell so all three share header conventions, source-note placement, and comparison-section structure.

## Cross-Report Consistency Notes
| Dimension | Baumhower's | Dude Wipes | Amsterdam/Rocco's | Audit note |
| --- | --- | --- | --- | --- |
| Direct route | No | Yes | Yes | Inconsistent deep-link/share behavior |
| Back button on direct entry | N/A | Conditional on history length | Conditional on history length | Inconsistent exit path |
| Asset path strategy | Root-relative | `BASE_URL` for rendered assets | Root-relative | Only one report is deployment-safe |
| Source provenance shown in UI | No | Yes | No | Benchmark confidence is uneven |
| Report framing | "Campaign Overview" | Brand-specific campaign report | Multi-brand campaign report | Naming and shell are inconsistent |
| Benchmark transparency | Medium-low | Medium | Low | Dude Wipes is best, none are fully rigorous |
| Data coupling | High | High | High | All three are expensive to update safely |

## Recommended Next Actions
1. Fix deployment safety first by normalizing Auburn report assets away from root-relative paths.
2. Correct the mislabeled Baumhower's comparison card and remove stale athlete benchmark content.
3. Add a direct Baumhower's route and make all Auburn back-navigation deterministic.
4. Standardize report provenance blocks so each page states benchmark population, source window, and pull date.
5. Review and soften any percentile, EMV, or exclusivity claims that are not fully supported by visible on-page evidence.
6. As a follow-up refactor, split campaign data from rendering so future updates do not require hand-editing multiple large component files.
