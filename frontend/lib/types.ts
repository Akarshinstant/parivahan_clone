// Shared types — kept in sync with backend/lib/types.ts
export type Role = 'citizen' | 'officer' | 'admin'

export type ApplicationStatus =
  | 'submitted'
  | 'assigned'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'test_scheduled'
  | 'licence_issued'

export type RejectionCode =
  | 'address_proof_unclear'
  | 'photo_quality_poor'
  | 'age_proof_missing'
  | 'identity_mismatch'
  | 'incomplete_form'
  | 'duplicate_application'
  | 'other'

export const REJECTION_MESSAGES: Record<RejectionCode, { title: string; fix: string }> = {
  address_proof_unclear: {
    title: 'Address proof document is unclear or incomplete',
    fix: 'Please re-upload your address proof — ensure the full address is visible, the document is less than 3 months old, and the image is not blurry.',
  },
  photo_quality_poor: {
    title: 'Passport-size photograph does not meet requirements',
    fix: 'Upload a new photo: white background, face clearly visible, taken within the last 6 months, no sunglasses.',
  },
  age_proof_missing: {
    title: 'Age proof document is missing or unreadable',
    fix: 'Please upload a valid age proof: birth certificate, 10th class marksheet, or Aadhaar card showing date of birth.',
  },
  identity_mismatch: {
    title: 'Name or details do not match across documents',
    fix: 'Ensure the name on your identity proof exactly matches the name entered in the form. Minor variations (e.g. initials) must be explained with a supporting document.',
  },
  incomplete_form: {
    title: 'Required fields in the application are incomplete',
    fix: 'Review your application form. Missing fields have been highlighted. Fill them and resubmit.',
  },
  duplicate_application: {
    title: 'A duplicate application was detected for this Aadhaar/DigiLocker ID',
    fix: 'You already have a pending application. If you cannot find it, contact support with your registered mobile number.',
  },
  other: {
    title: 'Application could not be processed',
    fix: 'Please review your application and resubmit. If the problem persists, contact support.',
  },
}

export type ApplicationStatus2 = ApplicationStatus

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Submitted',
  assigned: 'Assigned to Officer',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  test_scheduled: 'Test Scheduled',
  licence_issued: 'Licence Issued',
}

export const STATUS_ORDER: ApplicationStatus[] = [
  'submitted',
  'assigned',
  'under_review',
  'approved',
  'test_scheduled',
  'licence_issued',
]

export type FeedbackType = 'bug' | 'ux' | 'feature' | 'general'
export type FeedbackSeverity = 'critical' | 'high' | 'medium' | 'low'
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved'

export type FeedbackAiAnalysis = {
  root_cause: string
  severity: FeedbackSeverity
  category: string
  suggested_fix: string
  user_journey_impact: string
}

export type Feedback = {
  id: string
  type: FeedbackType
  title: string
  description: string
  page_url: string
  user_role: string | null
  ai_analysis: FeedbackAiAnalysis | null
  jira_ticket_id: string
  status: FeedbackStatus
  created_at: string
}

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: 'Bug Report',
  ux: 'UX / Usability Issue',
  feature: 'Feature Request',
  general: 'General Feedback',
}

export const SEVERITY_COLORS: Record<FeedbackSeverity, string> = {
  critical: 'text-red-700 bg-red-50 border-red-200',
  high: 'text-orange-700 bg-orange-50 border-orange-200',
  medium: 'text-amber-700 bg-amber-50 border-amber-200',
  low: 'text-blue-700 bg-blue-50 border-blue-200',
}
