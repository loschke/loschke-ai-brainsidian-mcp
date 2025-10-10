# Brainsidian MCP

> An intelligent Model Context Protocol (MCP) server for Obsidian vault management, built on [bitbonsai/mcp-obsidian](https://github.com/bitbonsai/mcp-obsidian)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Vision

Brainsidian connects Claude Desktop to your local Obsidian vault, enabling intelligent knowledge management through AI. Create, read, search, and organize your notes using natural language - all while maintaining your vault's structure and conventions.

## ✨ Features

### Current (Phase 1) ✅
- **Full CRUD Operations**: Read, write, update, delete notes with frontmatter support
- **Intelligent Search**: Content and frontmatter search with regex support
- **Tag Management**: Add, remove, and list tags in your notes
- **Batch Operations**: Read multiple notes efficiently
- **Path Security**: Automatic filtering of system files and validation
- **Token-Optimized**: 40-60% smaller API responses for better performance

### Current (Phase 2) ✅
- **Template Support**: Create notes from 4 customizable templates
  - quick-note (80% of notes)
  - wissensnotiz (knowledge/concepts)
  - projekt (projects/clients)
  - content (blog/video/podcast)
- **Automatic Placeholder Replacement**: `{{date}}`, `{{title}}`, `{{tags}}`
- **Smart Filename Sanitization**: Automatic handling of invalid characters
- **Tag Validation**: Typo detection with smart suggestions (e.g., ai-koding → ai-coding)

### Current (Phase 3 - In Progress) 🔄
- **Backlink Discovery** ✅: Find all notes linking to a target note

### Coming Soon 📅
- **Link Suggestions** (Phase 3): AI-powered recommendations for note connections
- **Vault Health Check** (Phase 3): Analyze and improve your knowledge base

## 📦 Installation

### Prerequisites
- Node.js 18.0.0 or later
- An Obsidian vault (local directory with `.md` files)
- Claude Desktop

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/brainsidian-mcp.git
cd brainsidian-mcp
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the project:**
```bash
npm run build
```

4. **Configure Claude Desktop:**

Edit `claude_desktop_config.json`:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "brainsidian": {
      "command": "node",
      "args": [
        "/path/to/brainsidian-mcp/dist/server.js",
        "/path/to/your/obsidian/vault"
      ]
    }
  }
}
```

5. **Restart Claude Desktop**

## 🚀 Usage

### Available Tools

1. **read_note** - Read note content with parsed frontmatter
2. **write_note** - Write/append/prepend content to notes
3. **list_directory** - List files and folders in vault
4. **delete_note** - Safely delete notes (requires confirmation)
5. **move_note** - Move or rename notes
6. **search_notes** - Full-text search across vault
7. **read_multiple_notes** - Batch read up to 10 notes
8. **get_frontmatter** - Extract only frontmatter metadata
9. **update_frontmatter** - Update note metadata
10. **manage_tags** - Add, remove, or list tags
11. **get_notes_info** - Get file metadata without content
12. **create_note_from_template** ✨ - Create notes from templates with auto-placeholders
13. **find_backlinks** ✨ - Discover all notes linking to a target note

### Example Conversations

**Basic Operations:**
- "List files in my Obsidian vault"
- "Read my note called 'project-ideas.md'"
- "Search for notes about machine learning"

**Content Creation:**
- "Create a new note with today's date"
- "Append this task to my daily note"
- "Add tags 'project' and 'urgent' to my task note"

**Template-Based Creation:** ✨
- "Create a quick note titled 'Meeting Notes' with tags ai-strategy"
- "Create a wissensnotiz about 'MCP Architecture' in folder '03-Fachwissen'"
- "Create a content note for 'Blog: AI Templates' with tags blog, ai-tools"

**Knowledge Management:**
- "Show me all notes tagged with 'ai-coding'"
- "Find all notes in the Projects folder"
- "What's in my research note's frontmatter?"

**Knowledge Graph:** ✨
- "Find all notes that link to 'Chain-of-Thought'"
- "Show me backlinks for my MCP Architecture note"
- "Which notes reference my Prompt Engineering guide?"

## 🏗️ Project Structure

```
brainsidian-mcp/
├── src/
│   ├── filesystem.ts      # File operations with path validation
│   ├── frontmatter.ts     # YAML frontmatter handling
│   ├── pathfilter.ts      # Security and file filtering
│   ├── search.ts          # Search functionality
│   └── types.ts           # TypeScript definitions
├── dist/                  # Compiled JavaScript
├── docs/
│   └── prd-brainsidian.md # Product Requirements Document
├── config.json            # Vault and template configuration
├── server.ts              # MCP server entry point
└── package.json
```

## 📋 Configuration

Create a `config.json` in the project root:

```json
{
  "vaultPath": "/path/to/vault",
  "templatesPath": "_Templates",
  "templates": {
    "quick-note": "Template - Quick Note.md",
    "wissensnotiz": "Template - Wissensnotiz.md",
    "projekt": "Template - Projekt.md",
    "content": "Template - Content.md"
  },
  "defaultTags": {
    "wissensbereiche": ["ai-essentials", "ai-coding", ...],
    "outputTypen": ["blog", "saas", "vortrag", ...],
    "status": ["idee", "in-arbeit", "fertig", ...]
  }
}
```

## 🔒 Security

Brainsidian implements multiple security measures:

- **Path Traversal Protection**: All paths validated against vault boundaries
- **Symbolic Link Safety**: Resolved paths checked for security
- **File Filtering**: System files (`.obsidian`, `.git`) automatically excluded
- **Content Validation**: YAML frontmatter validated before writing
- **Least Privilege**: Server only accesses specified vault directory

## 🧪 Development

### Running Tests
```bash
npm test
```

### Development Mode
```bash
npm run dev "/path/to/your/vault"
```

### Building
```bash
npm run build
```

## 📖 Roadmap

### Phase 1: Core Operations ✅
- [x] Read/Write/Update/Delete notes
- [x] Search and directory listing
- [x] Tag management
- [x] Batch operations

### Phase 2: Templates & Validation ✅
- [x] Template loading and application
- [x] Placeholder replacement ({{date}}, {{title}}, {{tags}})
- [x] Smart note creation with 4 templates
- [x] Filename sanitization
- [x] Tag validation with typo suggestions

### Phase 3: Intelligence Features 🔄
- [x] Backlink discovery (find_backlinks)
- [ ] Link suggestions (AI-powered)
- [ ] Vault health check
- [ ] Graph analysis

## 🤝 Contributing

Contributions are welcome! Please read the PRD in `docs/prd-brainsidian.md` for detailed requirements and architecture.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built on top of [bitbonsai/mcp-obsidian](https://github.com/bitbonsai/mcp-obsidian) - a lightweight MCP server for Obsidian vault access.

Special thanks to:
- The MCP team at Anthropic
- The Obsidian community
- All contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/loschke/loschke-ai-brainsidian-mcp/issues)
- **PRD**: See `docs/prd-brainsidian.md` for detailed specifications
- **Setup**: See `SETUP.md` for detailed setup notes
- **Changelog**: See `CHANGELOG.md` for version history

---

**Made with ❤️ for the Obsidian community**
