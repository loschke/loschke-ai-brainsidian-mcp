# Obsidian MCP - Product Requirements Document

> **Version:** 1.0  
> **Date:** 2025-10-10  
> **Author:** AI Generalist  
> **Status:** Ready for Development

---

## 1. Executive Summary

### Vision
Ein Model Context Protocol (MCP) Server, der Claude direkten Zugriff auf eine lokale Obsidian Vault gibt und intelligentes Wissensmanagement ermöglicht.

### Problem
Aktuell:
- Kein direkter Zugriff auf lokale Obsidian-Notizen
- Manuelle Erstellung und Organisation von Notizen
- Keine automatische Verlinkung oder Tag-Vorschläge
- Google Drive Sync notwendig für Claude-Zugriff (Latenz)

### Solution
Ein TypeScript-basiertes MCP, das:
- Direkt mit lokalem Obsidian Vault interagiert
- CRUD-Operationen für Notizen ermöglicht
- Template-basierte Notizen-Erstellung unterstützt
- Intelligente Suche und Verlinkung bietet
- Bestehende Vault-Struktur und Konventionen respektiert

### Success Criteria
- ✅ Claude kann Notizen lesen und erstellen
- ✅ Templates werden korrekt angewendet
- ✅ Tag-System wird eingehalten
- ✅ Wikilinks funktionieren
- ✅ Entwicklungsprozess dient als Learning-Material

---

## 2. Goals & Non-Goals

### Goals
- **Primary:** Direkter Read/Write-Zugriff auf Obsidian Vault
- **Secondary:** Template-Support für konsistente Notizen
- **Tertiary:** Intelligente Features (Search, Backlinks, Link-Suggestions)

### Non-Goals
- ❌ Obsidian Plugin (bleibt externes Tool)
- ❌ GUI/Dashboard (CLI/MCP only)
- ❌ Cloud-Sync (lokal only)
- ❌ Multi-Vault Support (erst später)
- ❌ Real-time collaboration

---

## 3. User Personas

### Primary User: Du (AI Generalist)
- **Context:** Wissensarbeiter mit 7 AI-Bereichen und 7 Output-Kanälen
- **Tech Level:** Intermediate, lernwillig
- **Usage Pattern:** Täglich, mehrfach, schnell iterativ
- **Pain Points:** Manuelle Ablage, fehlende Verlinkung, Inbox-Chaos

### Secondary User: Claude (AI Assistant)
- **Context:** Muss Kontext verstehen und Aktionen ausführen
- **Needs:** Klare Tool-Interfaces, Error-Feedback, Strukturierte Daten
- **Usage Pattern:** Auf Anfrage, reaktiv

---

## 4. Technical Requirements

### 4.1 Tech Stack

**Core:**
- Runtime: Node.js 20+
- Language: TypeScript 5+
- MCP SDK: `@modelcontextprotocol/sdk`

**Dependencies:**
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "gray-matter": "^4.0.3",      // Frontmatter parsing
  "fast-glob": "^3.3.2",         // Fast file finding
  "date-fns": "^3.0.0",          // Date handling
  "zod": "^3.22.0"               // Schema validation
}
```

**Dev Dependencies:**
```json
{
  "@types/node": "^20.0.0",
  "typescript": "^5.0.0",
  "tsx": "^4.0.0",               // TS execution
  "vitest": "^1.0.0",            // Testing (optional Phase 3)
  "@types/jest": "^29.0.0"
}
```

### 4.2 Environment

**Development:**
- OS: macOS/Linux (primary), Windows (nice to have)
- Editor: Cursor/Cline
- Claude Desktop integration

**Production:**
- Same as development (local only)

### 4.3 Configuration

**Config File:** `config.json`
```json
{
  "vaultPath": "/Users/[user]/Documents/Obsidian Vault",
  "templatesPath": "Templates/",
  "defaultTags": {
    "wissensbereiche": [
      "ai-essentials",
      "ai-coding", 
      "ai-media",
      "ai-automation",
      "ai-strategy",
      "ai-tools",
      "ai-transformation"
    ],
    "outputTypen": [
      "blog",
      "saas",
      "vortrag",
      "video-kurs",
      "podcast",
      "documentation",
      "kunden-projekt"
    ],
    "status": [
      "idee",
      "in-arbeit",
      "fertig",
      "veröffentlicht",
      "archiviert"
    ]
  }
}
```

**Environment Variables:**
```bash
VAULT_PATH=/path/to/vault
LOG_LEVEL=info
```

---

## 5. Functional Requirements

### 5.1 Phase 1: Core CRUD (MVP)

#### FR-1.1: Read Note
**Priority:** P0 (Must Have)

**Description:**  
Read content of a note by path.

**Input:**
```typescript
{
  path: string  // Relative to vault root, e.g. "03-Fachwissen/AI Coding/MCP.md"
}
```

**Output:**
```typescript
{
  success: boolean,
  path: string,
  content: string,
  frontmatter: {
    erstellt: string,
    tags: string[],
    status: string,
    [key: string]: any
  }
}
```

**Edge Cases:**
- File doesn't exist → Error with clear message
- File is not Markdown → Error
- No frontmatter → Return empty object

---

#### FR-1.2: Create Note
**Priority:** P0 (Must Have)

**Description:**  
Create new note with template and frontmatter.

**Input:**
```typescript
{
  path: string,          // "03-Fachwissen/AI Coding/New Note.md"
  title: string,         // "New Note"
  template: string,      // "wissensnotiz" | "quick-note" | "projekt" | "content"
  tags: string[],        // ["ai-coding", "konzept"]
  content?: string       // Optional initial content
}
```

**Output:**
```typescript
{
  success: boolean,
  path: string,
  message: string
}
```

**Templates:**
1. `quick-note` - 80% der Notizen
2. `wissensnotiz` - Kern-Konzepte
3. `projekt` - Kunden/SaaS
4. `content` - Blog/Video/Podcast

**Behavior:**
1. Load template from `Templates/Template - [name].md`
2. Replace placeholders:
   - `{{date}}` → current date (YYYY-MM-DD)
   - `{{title}}` → provided title
3. Create YAML frontmatter with provided tags
4. Write file to path
5. Return success/error

**Edge Cases:**
- File already exists → Error (don't overwrite)
- Template doesn't exist → Error with list of available templates
- Invalid tags → Warning but proceed
- Parent directory doesn't exist → Create it

---

#### FR-1.3: Update Note
**Priority:** P1 (Should Have)

**Description:**  
Update existing note content or frontmatter.

**Input:**
```typescript
{
  path: string,
  content?: string,           // New content (optional)
  frontmatterUpdates?: {      // Partial frontmatter updates
    tags?: string[],
    status?: string,
    [key: string]: any
  }
}
```

**Output:**
```typescript
{
  success: boolean,
  path: string,
  message: string
}
```

**Behavior:**
- If content provided → replace entire content (keep frontmatter)
- If frontmatterUpdates → merge with existing frontmatter
- Preserve existing links and formatting

---

#### FR-1.4: Delete Note
**Priority:** P2 (Nice to Have)

**Description:**  
Move note to trash (Obsidian's .trash folder).

**Input:**
```typescript
{
  path: string
}
```

**Output:**
```typescript
{
  success: boolean,
  message: string,
  trashPath: string
}
```

**Behavior:**
- Don't permanently delete
- Move to `.trash/` folder in vault
- Keep folder structure

---

### 5.2 Phase 2: Search & Navigation

#### FR-2.1: Search Vault
**Priority:** P0 (Must Have)

**Description:**  
Search vault by tags, content, dates, etc.

**Input:**
```typescript
{
  tags?: string[],              // Match any of these tags
  tagsAll?: string[],           // Match all of these tags
  contains?: string,            // Full-text search
  path?: string,                // Search in specific folder
  modifiedAfter?: string,       // ISO date
  modifiedBefore?: string,      // ISO date
  limit?: number                // Max results (default: 50)
}
```

**Output:**
```typescript
{
  success: boolean,
  results: Array<{
    path: string,
    title: string,
    tags: string[],
    excerpt: string,       // First 200 chars or match context
    modified: string,
    created: string
  }>,
  totalCount: number
}
```

**Behavior:**
- Fast search using fast-glob
- Parse frontmatter for each file
- Filter by criteria
- Return sorted by relevance (if full-text) or date

---

#### FR-2.2: Find Backlinks
**Priority:** P1 (Should Have)

**Description:**  
Find all notes that link to a given note.

**Input:**
```typescript
{
  noteName: string    // e.g. "Chain-of-Thought" or full path
}
```

**Output:**
```typescript
{
  success: boolean,
  backlinks: Array<{
    path: string,
    title: string,
    context: string,      // Surrounding text where link appears
    linkCount: number     // How many times it links to target
  }>
}
```

**Behavior:**
- Search for `[[noteName]]` in all notes
- Also match variations: `[[noteName|Display Text]]`
- Extract context (line or paragraph)

---

#### FR-2.3: List Files in Folder
**Priority:** P1 (Should Have)

**Description:**  
List all notes in a specific folder.

**Input:**
```typescript
{
  folder: string,        // e.g. "08-Recherche/"
  recursive?: boolean    // Default: false
}
```

**Output:**
```typescript
{
  success: boolean,
  files: Array<{
    path: string,
    title: string,
    tags: string[],
    status: string,
    created: string,
    modified: string
  }>
}
```

**Use Case:**  
Inbox-Zero sessions → List all files in `08-Recherche/`

---

### 5.3 Phase 3: Intelligent Features

#### FR-3.1: Suggest Links
**Priority:** P2 (Nice to Have)

**Description:**  
Analyze note content and suggest relevant links to other notes.

**Input:**
```typescript
{
  path: string,            // Current note
  contentPreview?: string  // Optional: content not yet saved
}
```

**Output:**
```typescript
{
  success: boolean,
  suggestions: Array<{
    notePath: string,
    noteTitle: string,
    reason: string,          // Why suggested
    confidence: number       // 0-1
  }>
}
```

**Algorithm (Simple v1):**
1. Extract keywords from content (TF-IDF or simple frequency)
2. Search other notes for these keywords
3. Score by relevance
4. Return top 5-10

**Future:** Use embeddings or LLM for better matching

---

#### FR-3.2: Validate Tags
**Priority:** P1 (Should Have)

**Description:**  
Check if tags are valid according to tag system.

**Input:**
```typescript
{
  tags: string[]
}
```

**Output:**
```typescript
{
  valid: boolean,
  validTags: string[],
  invalidTags: string[],
  suggestions: Array<{
    invalid: string,
    didYouMean: string[]
  }>
}
```

**Behavior:**
- Check against `config.json` tag lists
- Suggest corrections for typos (Levenshtein distance)

---

#### FR-3.3: Health Check
**Priority:** P2 (Nice to Have)

**Description:**  
Analyze vault health and suggest improvements.

**Output:**
```typescript
{
  success: boolean,
  stats: {
    totalNotes: number,
    byFolder: Record<string, number>,
    byTag: Record<string, number>,
    byStatus: Record<string, number>
  },
  issues: Array<{
    type: "no-tags" | "no-links" | "broken-link" | "duplicate",
    severity: "high" | "medium" | "low",
    path: string,
    description: string,
    suggestion: string
  }>
}
```

**Checks:**
- Notes without tags
- Notes without links (isolated)
- Broken wikilinks
- Potential duplicates (similar names/content)

---

## 6. Non-Functional Requirements

### NFR-1: Performance
- Search < 2 seconds for 1000 notes
- File operations < 100ms
- Startup < 500ms

### NFR-2: Reliability
- No data loss (atomic writes)
- Graceful error handling
- Detailed error messages

### NFR-3: Maintainability
- Clean code structure
- TypeScript strict mode
- Comments for complex logic
- Modular architecture

### NFR-4: Usability (for Claude)
- Clear tool descriptions
- Helpful error messages
- Examples in descriptions

---

## 7. System Architecture

### 7.1 Project Structure

```
obsidian-mcp/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── config.ts                # Configuration loading
│   ├── tools/
│   │   ├── create-note.ts       # FR-1.2
│   │   ├── read-note.ts         # FR-1.1
│   │   ├── update-note.ts       # FR-1.3
│   │   ├── delete-note.ts       # FR-1.4
│   │   ├── search-vault.ts      # FR-2.1
│   │   ├── find-backlinks.ts    # FR-2.2
│   │   ├── list-files.ts        # FR-2.3
│   │   ├── suggest-links.ts     # FR-3.1 (Phase 3)
│   │   ├── validate-tags.ts     # FR-3.2
│   │   └── health-check.ts      # FR-3.3 (Phase 3)
│   ├── utils/
│   │   ├── vault.ts             # Vault path resolution
│   │   ├── frontmatter.ts       # YAML parsing/writing
│   │   ├── templates.ts         # Template loading
│   │   ├── validation.ts        # Input validation with Zod
│   │   ├── wikilinks.ts         # Wikilink parsing/extraction
│   │   └── search.ts            # Search algorithms
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── templates/                    # Template files (copied from Obsidian)
│   ├── Template - Quick Note.md
│   ├── Template - Wissensnotiz.md
│   ├── Template - Projekt.md
│   └── Template - Content.md
├── config.json                   # Configuration
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

### 7.2 Core Components

#### MCP Server (index.ts)
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import all tools
import { createNoteHandler } from './tools/create-note.js';
import { readNoteHandler } from './tools/read-note.js';
// ... etc

const server = new Server(
  { name: 'obsidian-vault', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'create_note',
      description: 'Create new note in Obsidian vault',
      inputSchema: { /* Zod schema */ }
    },
    // ... all tools
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch(name) {
    case 'create_note':
      return await createNoteHandler(args);
    case 'read_note':
      return await readNoteHandler(args);
    // ... etc
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

#### Config Manager (config.ts)
```typescript
interface Config {
  vaultPath: string;
  templatesPath: string;
  defaultTags: {
    wissensbereiche: string[];
    outputTypen: string[];
    status: string[];
  };
}

export function loadConfig(): Config {
  // Load from config.json
  // Validate with Zod
  // Resolve paths
}

export const config = loadConfig();
```

#### Frontmatter Utils (utils/frontmatter.ts)
```typescript
import matter from 'gray-matter';

export function parseFrontmatter(content: string) {
  const { data, content: body } = matter(content);
  return { frontmatter: data, body };
}

export function createFrontmatter(data: Record<string, any>): string {
  return matter.stringify('', data);
}

export function updateFrontmatter(
  content: string, 
  updates: Record<string, any>
): string {
  const { data, content: body } = matter(content);
  const newData = { ...data, ...updates };
  return matter.stringify(body, newData);
}
```

#### Template Loader (utils/templates.ts)
```typescript
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config.js';

const TEMPLATES = {
  'quick-note': 'Template - Quick Note.md',
  'wissensnotiz': 'Template - Wissensnotiz.md',
  'projekt': 'Template - Projekt.md',
  'content': 'Template - Content.md'
};

export async function loadTemplate(templateName: string): Promise<string> {
  const filename = TEMPLATES[templateName];
  if (!filename) {
    throw new Error(`Unknown template: ${templateName}. Available: ${Object.keys(TEMPLATES).join(', ')}`);
  }
  
  const templatePath = path.join(config.vaultPath, config.templatesPath, filename);
  return await fs.readFile(templatePath, 'utf-8');
}

export function replaceTemplatePlaceholders(
  template: string, 
  replacements: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}
```

---

## 8. Development Phases

### Phase 1: MVP (Week 1)
**Goal:** Basic read/write functionality

**Deliverables:**
- ✅ Project setup with TypeScript
- ✅ MCP server running
- ✅ FR-1.1: Read Note
- ✅ FR-1.2: Create Note (basic, no templates yet)
- ✅ Integration with Claude Desktop
- ✅ Manual testing

**Success Criteria:**
Claude can read and create simple notes.

**Estimated Time:** 4-6 hours

---

### Phase 2: Templates & Search (Week 2)
**Goal:** Production-ready CRUD + Search

**Deliverables:**
- ✅ FR-1.2: Template support (all 4 templates)
- ✅ FR-1.3: Update Note
- ✅ FR-2.1: Search Vault
- ✅ FR-2.3: List Files
- ✅ FR-3.2: Validate Tags
- ✅ Error handling
- ✅ Config file

**Success Criteria:**
Can manage daily workflow (Inbox Zero, note creation, search).

**Estimated Time:** 6-8 hours

---

### Phase 3: Intelligence (Week 3+)
**Goal:** Smart features

**Deliverables:**
- ✅ FR-2.2: Find Backlinks
- ✅ FR-3.1: Suggest Links
- ✅ FR-3.3: Health Check
- ✅ Unit tests (optional)
- ✅ Documentation
- ✅ Blog post draft

**Success Criteria:**
System actively helps with knowledge management.

**Estimated Time:** 4-6 hours

---

## 9. Testing Strategy

### Manual Testing (Phase 1 & 2)
**Checklist per feature:**
- [ ] Happy path works
- [ ] Error cases handled
- [ ] Claude understands tool
- [ ] Real vault not corrupted

### Automated Testing (Phase 3, optional)
**Test Structure:**
```typescript
// tests/tools/create-note.test.ts
import { describe, it, expect } from 'vitest';
import { createNoteHandler } from '../../src/tools/create-note';

describe('create_note', () => {
  it('creates note with template', async () => {
    const result = await createNoteHandler({
      path: 'test.md',
      title: 'Test',
      template: 'quick-note',
      tags: ['test']
    });
    
    expect(result.success).toBe(true);
    // ... more assertions
  });
  
  it('errors on duplicate', async () => {
    // ... test error case
  });
});
```

**Test Coverage Goals:**
- Utils: 80%+
- Tools: 60%+
- Integration: Manual (priority)

---

## 10. Claude Desktop Integration

### Setup Steps:

1. **Build MCP:**
```bash
npm run build
```

2. **Configure Claude Desktop:**

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": [
        "/path/to/obsidian-mcp/dist/index.js"
      ],
      "env": {
        "VAULT_PATH": "/Users/[user]/Documents/Obsidian Vault"
      }
    }
  }
}
```

3. **Restart Claude Desktop**

4. **Test:**
```
User: "Claude, list tools"
Claude: [Should show obsidian tools]

User: "Read note 03-Fachwissen/AI Coding/MCP.md"
Claude: [Uses read_note tool]
```

---

## 11. Error Handling

### Error Types:

**File System Errors:**
```typescript
{
  error: 'FileNotFound',
  message: 'Note not found: 03-Fachwissen/NonExistent.md',
  suggestion: 'Check path or use search_vault to find it'
}
```

**Validation Errors:**
```typescript
{
  error: 'InvalidTags',
  message: 'Invalid tags: ai-koding, blogg',
  suggestion: 'Did you mean: ai-coding, blog?',
  validTags: ['ai-coding', 'blog', ...]
}
```

**Template Errors:**
```typescript
{
  error: 'TemplateNotFound',
  message: 'Template not found: wissensnotizz',
  suggestion: 'Available templates: quick-note, wissensnotiz, projekt, content'
}
```

### Error Response Format:
```typescript
{
  success: false,
  error: string,
  message: string,
  suggestion?: string,
  details?: any
}
```

---

## 12. Documentation Requirements

### README.md
- Quick Start (5 min setup)
- Prerequisites
- Installation
- Configuration
- Usage Examples
- Troubleshooting

### Code Comments
- JSDoc for all exported functions
- Complex algorithms explained
- TODO markers for future improvements

### Tool Descriptions (in MCP)
```typescript
{
  name: 'create_note',
  description: `
    Create new note in Obsidian vault with template.
    
    Templates available:
    - quick-note: Quick capture (80% of notes)
    - wissensnotiz: Knowledge concepts
    - projekt: Projects/Clients
    - content: Blog/Video/Podcast
    
    Example:
    {
      path: "03-Fachwissen/AI Coding/New Concept.md",
      title: "New Concept",
      template: "wissensnotiz",
      tags: ["ai-coding", "konzept"],
      content: "Initial thoughts..."
    }
  `,
  inputSchema: { /* ... */ }
}
```

---

## 13. Success Metrics

### Technical Metrics
- ✅ All P0 features working
- ✅ < 5 bugs in first week of use
- ✅ < 2s search time
- ✅ 0 data loss incidents

### Usage Metrics
- ✅ Used daily for 2+ weeks
- ✅ 10+ notes created via MCP
- ✅ 5+ successful Inbox-Zero sessions
- ✅ Search used 10+ times

### Learning Metrics
- ✅ Blog post published about process
- ✅ Can explain architecture to others
- ✅ Comfortable with TypeScript/MCP
- ✅ Can extend with new features independently

---

## 14. Future Enhancements (Post-MVP)

### Phase 4+
- **AI-Powered Link Suggestions:** Use embeddings for semantic search
- **Auto-Tagging:** LLM analyzes content, suggests tags
- **Graph Analysis:** Visualize knowledge graph, find clusters
- **Batch Operations:** Move/rename/tag multiple notes
- **Watch Mode:** Auto-update when files change externally
- **Multi-Vault:** Support multiple vaults
- **Export Tools:** Generate reports, summaries
- **Integration:** Connect to Google Drive for external docs

---

## 15. Risks & Mitigations

### Risk 1: Data Loss
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:** 
- Atomic writes (write to temp, rename)
- Backup before destructive operations
- Use `.trash` folder instead of delete
- Test extensively with test vault first

### Risk 2: Performance with Large Vaults
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:**
- Use fast-glob (optimized)
- Cache frontmatter when possible
- Limit search results
- Add pagination if needed

### Risk 3: Breaking Existing Vault
**Likelihood:** Low  
**Impact:** High  
**Mitigation:**
- Read-only operations first
- Test with duplicate vault
- Validate paths before write
- Respect Obsidian's file structure

### Risk 4: Complexity Creep
**Likelihood:** High  
**Impact:** Medium  
**Mitigation:**
- Stick to MVP scope
- Phase-based development
- Regular reviews with Claude
- "Done is better than perfect" mindset

---

## 16. Acceptance Criteria

### Phase 1 (MVP)
- [ ] MCP server starts without errors
- [ ] Claude can see obsidian tools
- [ ] Can read existing note
- [ ] Can create new note with basic template
- [ ] No corruption of existing vault
- [ ] Error messages are helpful

### Phase 2 (Production)
- [ ] All 4 templates work
- [ ] Search returns correct results
- [ ] Tags are validated
- [ ] Can manage daily Inbox-Zero workflow
- [ ] Config file works
- [ ] Used successfully for 3+ days

### Phase 3 (Intelligence)
- [ ] Backlinks found correctly
- [ ] Link suggestions are relevant
- [ ] Health check identifies real issues
- [ ] Documentation complete
- [ ] Blog post drafted

---

## 17. Getting Started (for Cline)

### Step 1: Project Setup
```bash
mkdir obsidian-mcp
cd obsidian-mcp
npm init -y
npm install @modelcontextprotocol/sdk gray-matter fast-glob date-fns zod
npm install -D typescript @types/node tsx
npx tsc --init
```

### Step 2: Create Initial Structure
```
Create folders: src/, src/tools/, src/utils/, src/types/, templates/
Copy template files from Obsidian Templates/
Create config.json with vault path
```

### Step 3: Implement Phase 1
1. Start with `src/index.ts` - minimal MCP server
2. Implement `utils/vault.ts` - path resolution
3. Implement `tools/read-note.ts` - FR-1.1
4. Test with Claude Desktop
5. Implement `tools/create-note.ts` (basic) - FR-1.2
6. Test end-to-end

### Step 4: Iterate
- Get feedback from user (me)
- Refine based on real usage
- Move to Phase 2

---

## 18. Resources & References

### Documentation
- [MCP SDK Docs](https://modelcontextprotocol.io)
- [Obsidian File Format](https://help.obsidian.md)
- [Gray Matter](https://github.com/jonschlinkert/gray-matter)
- [Fast Glob](https://github.com/mrmlnc/fast-glob)

### Related Projects
- [obsidian-mcp by different.ai](https://github.com/different-ai/obsidian-mcp)
- [mcp-obsidian by calclavia](https://github.com/calclavia/mcp-obsidian)

### Internal Docs
- Obsidian Leitfaden (see uploaded docs)
- Google Drive Leitfaden (see uploaded docs)
- User Profile (see uploaded docs)

---

## 19. Questions for Clarification

Before starting implementation, confirm:

1. **Vault Path:** Exact path to your Obsidian Vault?
2. **Templates:** Are current templates in Obsidian ready to copy?
3. **Claude Desktop:** Already installed and configured?
4. **Testing:** Use duplicate test vault or careful with real vault?
5. **Timeline:** Prefer aggressive (days) or relaxed (weeks)?

---

## 20. Changelog

**v1.0 (2025-10-10):**
- Initial PRD
- Defined 3 phases
- All functional requirements
- Architecture design
- Ready for Cline

---

## Appendix A: Tool Reference

### Quick Reference Table

| Tool | Priority | Phase | Complexity | Time Est. |
|------|----------|-------|------------|-----------|
| read_note | P0 | 1 | Low | 1h |
| create_note | P0 | 1-2 | Medium | 3h |
| update_note | P1 | 2 | Low | 1h |
| delete_note | P2 | 2 | Low | 0.5h |
| search_vault | P0 | 2 | Medium | 2h |
| list_files | P1 | 2 | Low | 1h |
| find_backlinks | P1 | 3 | Medium | 2h |
| suggest_links | P2 | 3 | High | 3h |
| validate_tags | P1 | 2 | Low | 1h |
| health_check | P2 | 3 | Medium | 2h |

**Total Estimated Time:** 17.5 hours across 3 phases

---

## Appendix B: Example Interactions

### Example 1: Daily Inbox Zero
```
User: "Claude, show me all files in 08-Recherche/"

Claude: [Uses list_files]
Found 12 files in Inbox:
1. Screenshot 2025-10-10.png
2. Cursor Tips.md
3. Paper - Prompt Engineering.pdf
...

User: "Read the Cursor Tips note"

Claude: [Uses read_note]
This note contains tips about...

User: "Create a proper Wissensnotiz from this. 
      Call it 'Cursor Advanced Tips', tag it ai-coding"

Claude: [Uses create_note]
Created: 03-Fachwissen/AI Coding/Cursor Advanced Tips.md

User: "Delete the original from Inbox"

Claude: [Uses delete_note]
Moved to trash: 08-Recherche/Cursor Tips.md
```

### Example 2: Content Preparation
```
User: "Search for all my notes about Prompt Engineering"

Claude: [Uses search_vault with tags=['ai-essentials', 'prompt-engineering']]
Found 8 notes:
- Chain-of-Thought Prompting
- Few-Shot Learning
- Meta-Prompting Framework
...

User: "Create new content note for blog about this topic"

Claude: [Uses create_note with content template]
Created: 04-Content/Blog/2025-11 Prompt Patterns Guide.md

User: "What should I link to?"

Claude: [Uses suggest_links]
I suggest linking to:
- [[Chain-of-Thought Prompting]] (confidence: 0.9)
- [[Few-Shot Learning]] (confidence: 0.8)
- [[Projekt Kunde-X]] (has examples)
```

---

**END OF PRD**

*Ready for implementation with Cline. Start with Phase 1, iterate based on feedback.* 🚀