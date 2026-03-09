## 2026-03-09

### Done this session
- Updated ecommerce ClientCard tiles: Spend / Conversions / Revenue / ROAS (with delta badges on all 4)
- Split Lifecykel (AU/UK/US) and SharkNinja (Shark AU, Ninja AU, Shark NZ, Ninja NZ) into separate client entries — each is its own tile and dashboard
- Removed SharkBeauty AU account
- Added InvestmentMarkets (lead-gen, customerId 3796315529) — data confirmed populated
- Fetched all 7 data files for all 7 new accounts via parallel background agents
- Fixed summary.json format inconsistency (some agents wrote `periods` wrapper / underscore keys) — normalized all to flat camelCase; updated CLAUDE.md with format warning
- Deleted old combined data/lifecykel/ and data/sharkninja/ directories

### Next steps
- Consider adding Milton & King accounts as separate entries (currently combined: Main + AU + UK) — Matt hasn't asked but same pattern
- Lifecykel AU quality.json capped at 500 rows (QS 1–8 only); same for Lifecykel UK (100 rows). Could improve if Bash available in agents
- adgroups.json and landingpages.json are empty [] for all 7 new accounts — may want to add those queries
- Consider a data freshness indicator per client (some accounts may get stale between refreshes)
- Dashboard auto-refresh / launchd daily job not yet set up

### Open questions / blockers
- Milton & King: should Main + AU + UK be split into separate tiles like Lifecykel/SharkNinja?
- Vinta Investment Group has 3 accounts (Coolangatta Hotel, Marketplace, The Strand) — split or keep combined?
- Storage Plus / Megabox has 2 accounts — keep combined or split?
