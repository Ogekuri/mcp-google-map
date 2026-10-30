# Changelog

## [0.4.0](https://github.com/Ogekuri/mcp-google-map/compare/v0.3.0..v0.4.0) - 2026-10-30
### 🚜  Changes
- enable startup update check by default with opt-out [useReq] *(auto-update)*
  - Add auto-update check at MCP server startup (stdio + HTTP), enabled by
  - default (REQ-082), comparing running version vs npm registry latest.
  - Add inverse-polarity disable variable MCP_AUTO_UPDATE_DISABLED
  - (1/true/yes case-insensitive) skipping all registry calls (REQ-083).
  - Report newer versions on stderr only with upgrade command (REQ-084);
  - fire-and-forget execution tolerates all failures without blocking
  - startup (REQ-085).
  - New src/utils/autoUpdate.ts with injectable fetch/logger/env; new
  - tests/autoUpdate.unit.test.ts covering TST-011 (55/55 pass).
  - Document variable in .env.example and docs/CONFIGURATION.md (REQ-086);
  - update REQUIREMENTS.md, WORKFLOW.md, REFERENCES.md.
- enforce publish version guard via prepublishOnly [useReq] *(packaging)*
  - Add PKG-017 to SRS 2.3: npm publish MUST fail when package.json version is 0.0.0-based or carries a prerelease/build suffix (stray 0.0.0-stage incident).
  - Add scripts/check-publish-version.mjs (Doxygen-documented): strict X.Y.Z pattern plus 0.0.0 placeholder prefix check; wired as first stage of prepublishOnly, preserving PKG-005 chain (typecheck, tests, build).
  - Verified: tsc --noEmit clean, 41/41 unit tests, npm publish --dry-run full chain, refusal cases 0.0.0-stage and 1.2.3-rc.1 exit 1.
  - Ops: unpublished mcp-google-map@0.0.0-stage from the npm registry.

## [0.3.0](https://github.com/Ogekuri/mcp-google-map/compare/v0.2.0..v0.3.0) - 2026-10-29
### 🚜  Changes
- document pi CLI and OpenClaw MCP registration and Google API prerequisites [useReq] *(docs)*
  - Add PKG-015/PKG-016: MCP client registration docs and configuration
  - prerequisites for pi CLI and OpenClaw in README and CONFIGURATION
  - README: fix stale 'From npm (once published)', add pi CLI, OpenClaw
  - and configuration-prerequisites sections linked to the Google API table
  - docs/CONFIGURATION.md: add 'Registrazione nei client MCP' section
  - No source or test changes; typecheck and 41 unit tests pass

## [0.2.0](https://github.com/Ogekuri/mcp-google-map/releases/tag/v0.2.0) - 2026-10-29
### ⛰️  Features
- Initial Commit.

### 🐛  Bug Fixes
- Bug fix.
- Fix version number.

### 🚜  Changes
- migrate tag pipeline with master gate, npm publish and commit changelog *(release)*
  - Rewrite .github/workflows/release.yml from /tmp/release-npm.yml desiderata
  - Trigger only canonical tags v[0-9]+.[0-9]+.[0-9]+ gated on origin/master
  - Publish to npm with provenance (OIDC) and --access public via NPM_TOKEN
  - Changelog via mikepenz/release-changelog-builder v6 (COMMIT mode)
  - Release asset: npm tarball instead of raw sources (fail on unmatched)
  - SRS: PKG-008 modified, PKG-009..PKG-014 added [useReq]
- add publication readiness with CI, release workflow and README fixes *(packaging)*
  - Add PKG-001..008 packaging/publication requirements (SRS section 2.3)
  - Fix README: Node/TS badges, remove TODOs, working anchors, Feature Highlights and Install/Uninstall sections (npm, npx, cross-platform)
  - Add .github/workflows/ci.yml (node 22: npm ci, typecheck, unit tests; e2e excluded)
  - Add .github/workflows/release.yml (tag: verify, build, npm pack, GitHub Release)
  - Add prepublishOnly script; rename doctor package label; bump 0.0.0 -> 0.1.0 [useReq]
- align SRS and workflow with places pagination fix [useReq] *(docs)*
  - Analyze commit ab2a65c and update canonical docs to the true state.
  - REQ-029 rewritten: pageSize/maxResultCount translated to a single
  - maxResultCount field clamped 1-20 (SDK proto lacks pageSize)
  - REQ-081 added: nextPageToken surfaced when the API returns one
  - LIM-007 added: pageToken forwarded but dropped by @googlemaps/places
  - protos (<= v3.1.0), so pagination has no server-side effect
  - TST-003 extended to the pageSize-to-maxResultCount translation test
  - WORKFLOW.md searchTextFull trace node updated; REFERENCES.md regenerated
  - No source changes: commit ab2a65c already implemented the fix (41/41 tests pass)

### 📚  Documentation
- Update REFERENCES.md document. [useReq] *(references)*


# History

- \[0.2.0\]: https://github.com/Ogekuri/mcp-google-map/releases/tag/v0.2.0
- \[0.3.0\]: https://github.com/Ogekuri/mcp-google-map/releases/tag/v0.3.0
- \[0.4.0\]: https://github.com/Ogekuri/mcp-google-map/releases/tag/v0.4.0

[0.2.0]: https://github.com/Ogekuri/mcp-google-map/releases/tag/v0.2.0
[0.3.0]: https://github.com/Ogekuri/mcp-google-map/compare/v0.2.0..v0.3.0
[0.4.0]: https://github.com/Ogekuri/mcp-google-map/compare/v0.3.0..v0.4.0
