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

### Coming Soon 🔄
- **Template Support** (Phase 2): Create notes from customizable templates
- **Tag Validation**: Enforce your tag system with auto-suggestions
- **Backlink Discovery** (Phase 3): Find all notes linking to a target
- **Link Suggestions**: AI-powered recommendations for note connections
- **Vault Health Check**: Analyze and improve your knowledge base

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

### Example Conversations

**Basic Operations:**
- "List files in my Obsidian vault"
- "Read my note called 'project-ideas.md'"
- "Search for notes about machine learning"

**Content Creation:**
- "Create a new note with today's date"
- "Append this task to my daily note"
- "Add tags 'project' and 'urgent' to my task note"

**Knowledge Management:**
- "Show me all notes tagged with 'ai-coding'"
- "Find all notes in the Projects folder"
- "What's in my research note's frontmatter?"

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

### Phase 2: Templates & Validation 🔄
- [ ] Template loading and application
- [ ] Tag validation against config
- [ ] Placeholder replacement
- [ ] Smart note creation

### Phase 3: Intelligence Features 📅
- [ ] Backlink discovery
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

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/brainsidian-mcp/issues)
- **PRD**: See `docs/prd-brainsidian.md` for detailed specifications
- **Changes**: See `README-BRAINSIDIAN.md` for setup notes

---

**Made with ❤️ for the Obsidian community**
