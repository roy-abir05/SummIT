'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { validateEmailList } from '@/lib/validation';

interface EmailFormProps {
  summary: string;
  disabled?: boolean;
}

/**
 * EmailForm component handles sending summaries via email
 * Includes validation and success feedback
 */
export function EmailForm({ summary, disabled = false }: EmailFormProps) {
  const [recipients, setRecipients] = useState<string>('');
  const [subject, setSubject] = useState<string>('Meeting Summary');
  const [isSending, setIsSending] = useState(false);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);

  const handleRecipientsChange = useCallback((value: string) => {
    setRecipients(value);
    
    // Validate emails in real-time
    if (value.trim()) {
      const emails = value.split(',').map(email => email.trim()).filter(Boolean);
      const { invalidEmails } = validateEmailList(emails);
      setEmailErrors(invalidEmails);
    } else {
      setEmailErrors([]);
    }
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!recipients.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject line');
      return;
    }

    const emails = recipients.split(',').map(email => email.trim()).filter(Boolean);
    const { validEmails, invalidEmails } = validateEmailList(emails);

    if (invalidEmails.length > 0) {
      toast.error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    if (validEmails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: summary,
          recipients: validEmails,
          subject: subject.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const data = await response.json();
      
      toast.success(
        `Summary sent successfully to ${validEmails.length} recipient${validEmails.length > 1 ? 's' : ''}!`,
        {
          description: `Message ID: ${data.messageId}`,
        }
      );

      // Clear form after successful send
      setRecipients('');
      setSubject('Meeting Summary');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [recipients, subject, summary]);

  const recipientCount = recipients.split(',').map(email => email.trim()).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Recipients */}
      <div className="space-y-2">
        <Label htmlFor="recipients">
          Email Recipients <span className="text-red-500">*</span>
        </Label>
        <Input
          id="recipients"
          type="email"
          value={recipients}
          onChange={(e) => handleRecipientsChange(e.target.value)}
          placeholder="john@company.com, jane@company.com"
          disabled={disabled}
          className={emailErrors.length > 0 ? 'border-red-300' : ''}
        />
        <p className="text-xs text-gray-500">
          Separate multiple emails with commas
        </p>
        
        {emailErrors.length > 0 && (
          <div className="text-xs text-red-600 space-y-1">
            <p>Invalid email addresses:</p>
            <ul className="list-disc list-inside">
              {emailErrors.map((email, idx) => (
                <li key={idx}>{email}</li>
              ))}
            </ul>
          </div>
        )}
        
        {recipientCount > 0 && emailErrors.length === 0 && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {recipientCount} valid recipient{recipientCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject Line <span className="text-red-500">*</span>
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Meeting Summary - [Date]"
          disabled={disabled}
        />
      </div>

      {/* Preview */}
      {summary && (
        <div className="space-y-2">
          <Label>Email Preview:</Label>
          <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
            <div className="text-xs text-gray-600 mb-2 border-b pb-2">
              <strong>To:</strong> {recipients || 'Recipients will appear here'}
              <br />
              <strong>Subject:</strong> {subject || 'Subject will appear here'}
            </div>
            <div 
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: summary.substring(0, 200) + (summary.length > 200 ? '...' : '')
              }}
            />
          </div>
        </div>
      )}

      {/* Send Button */}
      <Button
        onClick={handleSendEmail}
        disabled={disabled || isSending || !recipients.trim() || !subject.trim() || emailErrors.length > 0}
        className="w-full"
        size="lg"
      >
        {isSending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending Email...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Send Summary
          </>
        )}
      </Button>

      {disabled && (
        <p className="text-xs text-gray-500 text-center">
          Generate a summary first to enable email sharing
        </p>
      )}
    </div>
  );
}