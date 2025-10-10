import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
export class TemplateHandler {
    config = null;
    vaultPath;
    configPath;
    constructor(vaultPath, configPath) {
        this.vaultPath = vaultPath;
        // Default: look for config.json in project root (relative to this file)
        this.configPath = configPath || path.join(path.dirname(path.dirname(new URL(import.meta.url).pathname)), 'config.json');
    }
    /**
     * Load config.json from project root
     */
    async loadConfig() {
        if (this.config) {
            return this.config;
        }
        try {
            const configContent = await fs.readFile(this.configPath, 'utf-8');
            const config = JSON.parse(configContent);
            this.config = config;
            return config;
        }
        catch (error) {
            throw new Error(`Failed to load config.json from ${this.configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Load a template file from the vault's _Templates folder
     */
    async loadTemplate(templateName) {
        const config = await this.loadConfig();
        // Check if template exists in config
        if (!config.templates[templateName]) {
            const available = Object.keys(config.templates).join(', ');
            throw new Error(`Unknown template: ${templateName}. Available templates: ${available}`);
        }
        const templateFileName = config.templates[templateName];
        const templatePath = path.join(this.vaultPath, config.templatesPath, templateFileName);
        try {
            const content = await fs.readFile(templatePath, 'utf-8');
            return content;
        }
        catch (error) {
            throw new Error(`Failed to load template ${templateName} from ${templatePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Replace placeholders in template content
     * Supported placeholders:
     * - {{date}} - Current date in YYYY-MM-DD format
     * - {{datetime}} - Current datetime in ISO format
     * - {{title}} - Provided title
     * - {{tags}} - Comma-separated tags (for frontmatter)
     */
    replaceTemplatePlaceholders(template, data) {
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
    async listAvailableTemplates() {
        const config = await this.loadConfig();
        return Object.entries(config.templates).map(([name, file]) => ({
            name,
            file
        }));
    }
    /**
     * Validate if a template exists
     */
    async validateTemplate(templateName) {
        try {
            const config = await this.loadConfig();
            return templateName in config.templates;
        }
        catch {
            return false;
        }
    }
    /**
     * Get template info without loading content
     */
    async getTemplateInfo(templateName) {
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
        }
        catch {
            exists = false;
        }
        return {
            name: templateName,
            file: fileName,
            path: templatePath,
            exists
        };
    }
}
