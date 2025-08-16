# AI Transcript Summarizer

Transform your meeting transcripts into actionable summaries with AI-powered analysis and easy sharing.

## Features

- **📄 Flexible Input**: Upload `.txt` files or paste text directly
- **🤖 AI-Powered Summarization**: Convert transcripts into structured summaries
- **✏️ Editable Output**: Modify and refine generated summaries
- **📧 Email Sharing**: Share summaries with team members instantly
- **💾 Auto-Save**: Drafts saved automatically to local storage
- **📱 Responsive Design**: Works seamlessly on desktop and mobile

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

### 1. Input Your Transcript
- **Upload File**: Drag and drop a `.txt` file or click "Browse Files"
- **Paste Directly**: Use the textarea to paste meeting transcripts

### 2. Customize Instructions (Optional)
- Add specific requirements for your summary
- Examples: "Focus on action items", "Highlight decisions", "Extract budget info"

### 3. Generate Summary
- Click "Generate Summary" to create an AI-powered analysis
- The summary includes:
  - Key discussion points
  - Action items with owners
  - Decisions made
  - Participant list
  - Next steps

### 4. Edit & Refine
- Edit the generated summary directly in the editor
- Use keyboard shortcuts: `Ctrl+B` (bold), `Ctrl+I` (italic), `Ctrl+U` (underline)
- Changes are auto-saved to local storage

### 5. Share via Email
- Enter recipient email addresses (comma-separated)
- Customize the subject line
- Preview before sending
- Get confirmation with message ID

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate/route.ts      # AI summarization endpoint
│   │   └── share/route.ts         # Email sharing endpoint
│   ├── layout.tsx                 # Root layout with toast provider
│   ├── page.tsx                   # Main application interface
│   └── globals.css                # Global styles and CSS variables
├── components/
│   ├── FileReader.tsx             # File upload and text input
│   ├── Editor.tsx                 # Rich text editing component
│   └── EmailForm.tsx              # Email sharing form
├── lib/
│   ├── validation.ts              # Email and content validation
│   └── utils.ts                   # Utility functions
├── components.json                # shadcn/ui configuration
└── README.md
```

## API Endpoints

### `POST /api/generate`
Generates AI-powered summaries from transcripts.

**Request Body**:
```json
{
  "transcript": "Meeting transcript content...",
  "instruction": "Optional custom instructions"
}
```

**Response**:
```json
{
  "success": true,
  "html": "<div>Formatted summary...</div>",
  "summary": {
    "keyPoints": [...],
    "actionItems": [...],
    "decisions": [...],
    "participants": [...],
    "nextSteps": [...]
  }
}
```

### `POST /api/share`
Sends summaries via email.

**Request Body**:
```json
{
  "html": "<div>Summary HTML content...</div>",
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Meeting Summary"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "mock-123-abc",
  "recipientCount": 2,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# AI Service Configuration
GROQ_API_KEY=your_groq_api_key_here

# Email Service Configuration  
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@yourcompany.com
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **Validation**: Custom validation utilities

## Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   - Push code to GitHub/GitLab
   - Connect to Vercel dashboard

2. **Configure Environment**:
   - Add environment variables in Vercel dashboard
   - Set `GROQ_API_KEY` and email service credentials

3. **Deploy**:
   ```bash
   npm run build  # Test locally first
   ```
   - Vercel auto-deploys on push to main branch

### Other Platforms

The app is configured with `output: 'export'` for static deployment:

```bash
npm run build
```

Deploy the `out/` directory to any static hosting service.

## Replacing Mocks with Real Services

### AI Integration (Groq LLM)

Replace the mock in `app/api/generate/route.ts`:

```typescript
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: NextRequest) {
  const { transcript, instruction } = await request.json();
  
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a professional meeting summarizer..."
      },
      {
        role: "user", 
        content: `Transcript: ${transcript}\nInstructions: ${instruction}`
      }
    ],
    model: "mixtral-8x7b-32768",
    temperature: 0.3,
  });
  
  // Process and return the completion
  return NextResponse.json({
    success: true,
    html: formatSummary(completion.choices[0].message.content),
    summary: extractStructuredData(completion.choices[0].message.content)
  });
}
```

### Email Integration (Nodemailer)

Replace the mock in `app/api/share/route.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  const { html, recipients, subject } = await request.json();
  
  const result = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipients.join(','),
    subject: subject,
    html: html,
  });
  
  return NextResponse.json({
    success: true,
    messageId: result.messageId,
    recipientCount: recipients.length
  });
}
```

### Required Dependencies for Real Services

```bash
npm install groq-sdk nodemailer @types/nodemailer
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Check the [GitHub Issues](https://github.com/yourusername/ai-transcript-summarizer/issues)
- Review the documentation above
- Test with the mock APIs first before integrating real services

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**