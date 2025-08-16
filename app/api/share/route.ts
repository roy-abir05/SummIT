import { NextRequest, NextResponse } from 'next/server';
import { validateEmailList } from '@/lib/validation';
import nodemailer from 'nodemailer';

interface ShareRequest {
  html: string;
  recipients: string[];
  subject: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ShareRequest = await request.json();
    const { html, recipients, subject } = body;

    // Validate input
    if (!html || html.trim().length === 0) {
      return NextResponse.json(
        { error: 'Summary content is required' },
        { status: 400 }
      );
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    if (!subject || subject.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    // Validate email addresses
    const { validEmails, invalidEmails } = validateEmailList(recipients);
    
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid email addresses found',
          invalidEmails 
        },
        { status: 400 }
      );
    }

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses provided' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: validEmails.join(','),
      subject: subject,
      html: html,
    };

    const result = await transporter.sendMail(mailOptions);
    const messageId = result.messageId;

    return NextResponse.json({
      success: true,
      messageId: messageId,
      recipientCount: validEmails.length,
      sentTo: validEmails,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in share API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for testing API availability
 */
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Email sharing API is available',
    timestamp: new Date().toISOString(),
  });
}