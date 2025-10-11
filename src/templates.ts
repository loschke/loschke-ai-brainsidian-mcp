import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

export interface TemplateConfig {
  vaultPath: string;
  templatesPath: string;
  templates: Record<string, string>;
  defaultTags: {
    wissensbereiche: string[];
    outputTypen: string[];
    status: string[];
  };
}

export interface TemplatePlaceholders {
  date?: string;
  title?: string;
  tags?: string[];
  [key: string]: any;
}

export class TemplateHandler {
  private config: TemplateConfig | null = null;
  private vaultPath: string;
  private configPath: string;

  constructor(vaultPath: string, configPath?: string) {
    this.vaultPath = vaultPath;
    // Default: look for config.json in project root (relative to this file)
    this.configPath = configPath || path.join(path.dirname(path.dirname(new URL(import.meta.url).pathname)), 'config.json');
  }

  /**
   * Load config.json from project root
   */
  async loadConfig(): Promise<TemplateConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(configContent) as TemplateConfig;
      this.config = config;
      return config;
    } catch (error) {
      throw new Error(`Failed to load config.json from ${this.configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load a template file from the vault's _Templates folder
   * Supports multiple naming patterns for flexibility
   */
  async loadTemplate(templateName: string): Promise<string> {
    const config = await this.loadConfig();
    const templatesDir = path.join(this.vaultPath, config.templatesPath);
    
    // Try multiple naming patterns (in priority order)
    const patterns = [
      config.templates[templateName], // 1. User's config (highest priority)
      `Template - ${this.capitalize(templateName)}.md`, // 2. Current convention
      `template-${templateName}.md`, // 3. Lowercase-dash (common convention)
      `${templateName}.md` // 4. Simple name
    ];
    
    // Try each pattern
    for (const pattern of patterns) {
      if (!pattern) continue;
      
      const templatePath = path.join(templatesDir, pattern);
      
      try {
        await fs.access(templatePath);
        const content = await fs.readFile(templatePath, 'utf-8');
        return content;
      } catch {
        continue; // Try next pattern
      }
    }
    
    // Not found - provide helpful error with available templates
    const available = await this.listActualTemplateFiles(templatesDir);
    const patternsTriedStr = patterns.filter(Boolean).join(', ');
    
    throw new Error(
      `Template "${templateName}" not found in ${templatesDir}\n\n` +
      `Patterns tried:\n  ${patternsTriedStr}\n\n` +
      `Available template files:\n  ${available.join('\n  ')}\n\n` +
      `Supported naming conventions:\n` +
      `  - Template - [Name].md (e.g., Template - Content.md)\n` +
      `  - template-[name].md (e.g., template-content.md)\n` +
      `  - [name].md (e.g., content.md)`
    );
  }

  /**
   * Replace placeholders in template content
   * Supported placeholders:
   * - {{date}} - Current date in YYYY-MM-DD format
   * - {{datetime}} - Current datetime in ISO format
   * - {{title}} - Provided title
   * - {{tags}} - Comma-separated tags (for frontmatter)
   */
  replaceTemplatePlaceholders(template: string, data: TemplatePlaceholders): string {
    let result = template;

    // Replace {{date}} with current date
    const currentDate = data.date || format(new Date(), 'yyyy-MM-dd');
    result = result.replace(/\{\{date\}\}/g, currentDate);

    // Replace {{datetime}} with current datetime
    const currentDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
    result = result.replace(/\{\{datetime\}\}/g, currentDateTime);

    // Replace {{title}} if provided
    if (data.title) {
      result = result.replace(/\{\{title\}\}/g, data.title);
    }

    // Replace {{tags}} if provided
    if (data.tags && Array.isArray(data.tags)) {
      const tagsString = data.tags.join(', ');
      result = result.replace(/\{\{tags\}\}/g, tagsString);
    }

    // Replace any custom placeholders
    for (const [key, value] of Object.entries(data)) {
      if (!['date', 'datetime', 'title', 'tags'].includes(key)) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(placeholder, String(value));
      }
    }

    return result;
  }

  /**
   * List all available templates
   */
  async listAvailableTemplates(): Promise<Array<{ name: string; file: string }>> {
    const config = await this.loadConfig();
    return Object.entries(config.templates).map(([name, file]) => ({
      name,
      file
    }));
  }

  /**
   * Validate if a template exists
   */
  async validateTemplate(templateName: string): Promise<boolean> {
    try {
      const config = await this.loadConfig();
      return templateName in config.templates;
    } catch {
      return false;
    }
  }

  /**
   * Get template info without loading content
   */
  async getTemplateInfo(templateName: string): Promise<{ 
    name: string; 
    file: string; 
    path: string;
    exists: boolean;
  }> {
    const config = await this.loadConfig();
    
    if (!config.templates[templateName]) {
      throw new Error(`Unknown template: ${templateName}`);
    }

    const fileName = config.templates[templateName];
    const templatePath = path.join(this.vaultPath, config.templatesPath, fileName);
    
    let exists = false;
    try {
      await fs.access(templatePath);
      exists = true;
    } catch {
      exists = false;
    }

    return {
      name: templateName,
      file: fileName,
      path: templatePath,
      exists
    };
  }

  /**
   * Capitalize template name (e.g., "quick-note" → "Quick-Note")
   */
  private capitalize(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  }

  /**
   * List actual template files in the directory
   */
  private async listActualTemplateFiles(dir: string): Promise<string[]> {
    try {
      const files = await fs.readdir(dir);
      return files
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));
    } catch {
      return ['(unable to read directory)'];
    }
  }
}
