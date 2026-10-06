export interface ProjectActivity {
  id: string; projectId: string; authorId: string; authorRole: 'CARPENTER' | 'CUSTOMER';
  kind: 'COMMENT' | 'PHOTO' | 'REVIEW_REQUESTED' | 'COMPLETION_CONFIRMED' | 'ISSUE_REPORTED';
  message: string; fileName: string | null; contentType: string | null; createdAt: string;
}
