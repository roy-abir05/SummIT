/**
 * Email validation utilities
 * Provides robust validation for email addresses and lists
 */

// RFC 5322 compliant email regex (simplified but robust)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validates a single email address
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const trimmed = email.trim();
  
  // Basic length check
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }
  
  // Check for basic structure
  if (!trimmed.includes('@') || trimmed.indexOf('@') !== trimmed.lastIndexOf('@')) {
    return false;
  }
  
  // Split into local and domain parts
  const [localPart, domainPart] = trimmed.split('@');
  
  // Check local part length (before @)
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    return false;
  }
  
  // Check domain part length (after @)
  if (!domainPart || domainPart.length === 0 || domainPart.length > 253) {
    return false;
  }
  
  // Check domain has at least one dot
  if (!domainPart.includes('.')) {
    return false;
  }
  
  // Use regex for final validation
  return EMAIL_REGEX.test(trimmed);
}

/**
 * Validates a list of email addresses
 * Returns valid and invalid emails separately
 */
export function validateEmailList(emails: string[]): {
  validEmails: string[];
  invalidEmails: string[];
} {
  const validEmails: string[] = [];
  const invalidEmails: string[] = [];
  
  for (const email of emails) {
    const trimmed = email.trim();
    
    if (trimmed.length === 0) {
      continue; // Skip empty strings
    }
    
    if (isValidEmail(trimmed)) {
      // Avoid duplicates
      if (!validEmails.includes(trimmed.toLowerCase())) {
        validEmails.push(trimmed.toLowerCase());
      }
    } else {
      invalidEmails.push(trimmed);
    }
  }
  
  return { validEmails, invalidEmails };
}

/**
 * Parses comma-separated email string into array
 */
export function parseEmailString(emailString: string): string[] {
  if (!emailString || typeof emailString !== 'string') {
    return [];
  }
  
  return emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

/**
 * Validates transcript content
 */
export function validateTranscript(transcript: string): {
  isValid: boolean;
  error?: string;
} {
  if (!transcript || typeof transcript !== 'string') {
    return { isValid: false, error: 'Transcript is required' };
  }
  
  const trimmed = transcript.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Transcript cannot be empty' };
  }
  
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Transcript is too short (minimum 10 characters)' };
  }
  
  if (trimmed.length > 50000) {
    return { isValid: false, error: 'Transcript is too long (maximum 50,000 characters)' };
  }
  
  return { isValid: true };
}

/**
 * Validates subject line
 */
export function validateSubject(subject: string): {
  isValid: boolean;
  error?: string;
} {
  if (!subject || typeof subject !== 'string') {
    return { isValid: false, error: 'Subject is required' };
  }
  
  const trimmed = subject.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Subject cannot be empty' };
  }
  
  if (trimmed.length > 200) {
    return { isValid: false, error: 'Subject is too long (maximum 200 characters)' };
  }
  
  return { isValid: true };
}