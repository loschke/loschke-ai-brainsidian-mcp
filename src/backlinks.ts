import fs from 'fs/promises';
import path from 'path';
import { PathFilter } from './pathfilter.js';

export interface BacklinkResult {
  path: string;
  title: string;
  context: string;
  linkCount: number;
}

export interface FindBacklinksResult {
  success: boolean;
  backlinks: BacklinkResult[];
  targetNote: string;
  totalLinks: number;
}

export class BacklinksService {
  constructor(
    private vaultPath: string,
    private pathFilter: PathFilter
  ) {}

  /**
   * Find all notes that link to a target note
   */
  async findBacklinks(noteName: string): Promise<FindBacklinksResult> {
    const backlinks: BacklinkResult[] = [];
    
    // Normalize note name (remove .md extension if present)
    const normalizedName = noteName.replace(/\.md$/i, '');
    
    // Create regex patterns for wikilinks
    // Matches: [[noteName]] or [[noteName|display text]]
    const linkPattern = new RegExp(
      `\\[\\[${this.escapeRegex(normalizedName)}(?:\\|[^\\]]+)?\\]\\]`,
      'gi'
    );

    try {
      // Get all markdown files
      const allFiles = await this.getAllMarkdownFiles(this.vaultPath);
      
      // Search each file
      for (const filePath of allFiles) {
        const matches = await this.searchFileForBacklinks(
          filePath,
          linkPattern
        );
        
        if (matches && matches.linkCount > 0) {
          backlinks.push(matches);
        }
      }

      // Sort by link count (most links first)
      backlinks.sort((a, b) => b.linkCount - a.linkCount);

      const totalLinks = backlinks.reduce((sum, bl) => sum + bl.linkCount, 0);

      return {
        success: true,
        backlinks,
        targetNote: normalizedName,
        totalLinks
      };
    } catch (error) {
      throw new Error(
        `Failed to find backlinks: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Search a single file for backlinks to the target note
   */
  private async searchFileForBacklinks(
    filePath: string,
    linkPattern: RegExp
  ): Promise<BacklinkResult | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Find all matches
      const matches: Array<{ line: number; text: string }> = [];
      let linkCount = 0;

      lines.forEach((line, index) => {
        const lineMatches = line.match(linkPattern);
        if (lineMatches) {
          linkCount += lineMatches.length;
          matches.push({
            line: index + 1,
            text: line.trim()
          });
        }
      });

      if (linkCount === 0) {
        return null;
      }

      // Extract title from frontmatter or filename
      const title = this.extractTitle(content, filePath);
      
      // Create context string (show first few matches)
      const contextLines = matches.slice(0, 3).map(m => 
        `Line ${m.line}: ${m.text.substring(0, 150)}${m.text.length > 150 ? '...' : ''}`
      );
      
      if (matches.length > 3) {
        contextLines.push(`... and ${matches.length - 3} more occurrence(s)`);
      }

      const relativePath = path.relative(this.vaultPath, filePath).replace(/\\/g, '/');

      return {
        path: relativePath,
        title,
        context: contextLines.join('\n'),
        linkCount
      };
    } catch (error) {
      // Skip files that can't be read
      return null;
    }
  }

  /**
   * Get all markdown files in vault recursively
   */
  private async getAllMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.vaultPath, fullPath).replace(/\\/g, '/');
        
        // Apply path filter
        if (!this.pathFilter.isAllowed(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this.getAllMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.match(/\.md$/i)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }

    return files;
  }

  /**
   * Extract title from frontmatter or use filename
   */
  private extractTitle(content: string, filePath: string): string {
    // Try to extract from frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch && frontmatterMatch[1]) {
      const titleMatch = frontmatterMatch[1].match(/^title:\s*(.+)$/m);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim().replace(/^["'](.+)["']$/, '$1');
      }
    }

    // Fallback to filename
    return path.basename(filePath, '.md');
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
