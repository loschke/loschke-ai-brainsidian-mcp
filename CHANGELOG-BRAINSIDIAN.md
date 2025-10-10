# Changelog - Brainsidian MCP

All notable changes to the Brainsidian project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-10

### Added - Phase 1: Core Setup ✅

#### Project Setup
- Forked and adapted bitbonsai/mcp-obsidian as foundation
- Initialized new Git repository for Brainsidian
- Created comprehensive README.md with project vision
- Added config.json for vault and template configuration
- Set up Claude Desktop integration

#### Features (Inherited from bitbonsai)
- **read_note**: Read notes with parsed frontmatter
- **write_note**: Write/append/prepend content to notes
- **list_directory**: List files and folders in vault
- **delete_note**: Safely delete notes with confirmation
- **move_note**: Move or rename notes
- **search_notes**: Full-text search across vault (content + frontmatter)
- **read_multiple_notes**: Batch read up to 10 notes
- **get_frontmatter**: Extract only frontmatter metadata
- **update_frontmatter**: Update note metadata
- **manage_tags**: Add, remove, or list tags
- **get_notes_info**: Get file metadata without content

#### Security
- Path traversal protection with vault boundary validation
- Symbolic link safety checks
- Automatic filtering of system files (.obsidian, .git)
- YAML frontmatter validation before writing

#### Performance
- Token-optimized responses (40-60% reduction)
- Minified field names for API responses
- Efficient batch operations

#### Documentation
- Complete README with installation and usage guide
- Product Requirements Document (docs/prd-brainsidian.md)
- Setup notes (README-BRAINSIDIAN.md)
- Configuration examples

### Configuration
- Vault Path: Configured for local DigitalBrain vault
- Templates: _Templates folder integration prepared
- Tag System: Configured wissensbereiche, outputTypen, status tags
- MCP Server: "brainsidian" configured in Claude Desktop

### Technical Details
- **Runtime**: Node.js 18.0.0+
- **Language**: TypeScript 5+
- **Dependencies**: 243 packages
- **Build System**: TypeScript compiler (tsc)
- **Tests**: Vitest (76 tests inherited)

---

## [1.1.0] - 2025-10-10 - Phase 2: Template Support ✅

### Added
- **Template-Handler** (`src/templates.ts`)
  - Load templates from `_Templates` folder in vault
  - Automatic placeholder replacement: `{{date}}`, `{{datetime}}`, `{{title}}`, `{{tags}}`
  - Template validation and listing
  - Config loading from project root
- **create_note_from_template MCP Tool**
  - Create notes from 4 templates: quick-note, wissensnotiz, projekt, content
  - Smart filename sanitization
  - Optional folder parameter
  - Optional additional content append
- **date-fns dependency** for date formatting

### Fixed
- Windows compatibility for config.json path loading
- Explicit configPath in server.ts using __dirname

### Technical Details
- 3 commits on feature/phase-2-templates branch
- Zero breaking changes - all existing tools functional
- Backward-compatible implementation

**Time Invested**: 2 hours

---

## [Unreleased] - Phase 2: Tag Validation (Optional)

### Planned
- [ ] Tag validation against config.json
- [ ] Typo suggestions for tags (Levenshtein distance)
- [ ] Integration with manage_tags tool

**Estimated Time**: 1 hour

---

## [Unreleased] - Phase 3: Intelligence Features

### Planned
- [ ] find_backlinks: Discover notes linking to target (FR-2.2)
- [ ] suggest_links: AI-powered link recommendations (FR-3.1)
- [ ] health_check: Vault analysis and improvements (FR-3.3)
- [ ] Graph analysis capabilities

**Estimated Time**: 4-6 hours

---

## Technical Debt & Improvements

### To Consider
- [ ] Migrate from bitbonsai fork to independent implementation
- [ ] Add integration tests for Claude Desktop
- [ ] Implement embedding-based link suggestions
- [ ] Add vault statistics dashboard
- [ ] Support for multiple vaults

---

## Credits

**Based on**: [bitbonsai/mcp-obsidian](https://github.com/bitbonsai/mcp-obsidian) v0.6.4
**Author**: AI Generalist
**Created**: 2025-10-10
**License**: MIT

---

[1.0.0]: https://github.com/YOUR_USERNAME/brainsidian-mcp/releases/tag/v1.0.0
