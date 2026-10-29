# Changelog

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

[0.2.0]: https://github.com/Ogekuri/mcp-google-map/releases/tag/v0.2.0
[0.3.0]: https://github.com/Ogekuri/mcp-google-map/compare/v0.2.0..v0.3.0
