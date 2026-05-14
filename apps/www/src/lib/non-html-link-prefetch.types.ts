export interface AuditNonHtmlAnchorPrefetchInput {
  readonly rootDir: string;
  readonly sameOrigins?: readonly string[];
}

export interface FindNonHtmlAnchorPrefetchViolationsInput {
  readonly code: string;
  readonly filePath: string;
  readonly sameOrigins?: readonly string[];
}

export interface NonHtmlAnchorPrefetchViolation {
  readonly column: number;
  readonly filePath: string;
  readonly href: string;
  readonly line: number;
}
