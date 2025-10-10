import type { TemplateConfig } from './templates.js';

export interface TagValidationResult {
  valid: boolean;
  validTags: string[];
  invalidTags: string[];
  suggestions: Array<{
    invalid: string;
    didYouMean: string[];
  }>;
}

export class ValidationService {
  private allValidTags: string[] = [];

  constructor(private config: TemplateConfig) {
    // Flatten all tag categories into one array
    this.allValidTags = [
      ...config.defaultTags.wissensbereiche,
      ...config.defaultTags.outputTypen,
      ...config.defaultTags.status
    ];
  }

  /**
   * Validate tags against configured tag system
   */
  validateTags(tags: string[]): TagValidationResult {
    const validTags: string[] = [];
    const invalidTags: string[] = [];
    const suggestions: Array<{ invalid: string; didYouMean: string[] }> = [];

    for (const tag of tags) {
      if (this.allValidTags.includes(tag)) {
        validTags.push(tag);
      } else {
        invalidTags.push(tag);
        
        // Find suggestions using Levenshtein distance
        const tagSuggestions = this.findSimilarTags(tag, 3);
        if (tagSuggestions.length > 0) {
          suggestions.push({
            invalid: tag,
            didYouMean: tagSuggestions
          });
        }
      }
    }

    return {
      valid: invalidTags.length === 0,
      validTags,
      invalidTags,
      suggestions
    };
  }

  /**
   * Find similar tags using Levenshtein distance
   */
  private findSimilarTags(tag: string, maxSuggestions: number = 3): string[] {
    const similarities = this.allValidTags.map(validTag => ({
      tag: validTag,
      distance: this.levenshteinDistance(tag.toLowerCase(), validTag.toLowerCase())
    }));

    // Filter by distance threshold (max 3 character differences)
    const threshold = Math.min(3, Math.ceil(tag.length * 0.4));
    
    return similarities
      .filter(s => s.distance <= threshold)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxSuggestions)
      .map(s => s.tag);
  }

  /**
   * Calculate Levenshtein distance between two strings
   * (minimum number of edits needed to transform one string into another)
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Create matrix
    const matrix: number[][] = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

    // Initialize first column and row
    for (let i = 0; i <= len2; i++) {
      matrix[i]![0] = i;
    }
    for (let j = 0; j <= len1; j++) {
      matrix[0]![j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        const cost = str2.charAt(i - 1) === str1.charAt(j - 1) ? 0 : 1;
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j]! + 1,     // deletion
          matrix[i]![j - 1]! + 1,     // insertion
          matrix[i - 1]![j - 1]! + cost  // substitution
        );
      }
    }

    return matrix[len2]![len1]!;
  }

  /**
   * Get all valid tags organized by category
   */
  getValidTagsByCategory(): {
    wissensbereiche: string[];
    outputTypen: string[];
    status: string[];
  } {
    return this.config.defaultTags;
  }

  /**
   * Get all valid tags as flat array
   */
  getAllValidTags(): string[] {
    return this.allValidTags;
  }

  /**
   * Check if a single tag is valid
   */
  isValidTag(tag: string): boolean {
    return this.allValidTags.includes(tag);
  }
}
