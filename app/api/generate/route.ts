import { NextRequest, NextResponse } from "next/server";
// Add the correct import for Groq below. Adjust the import path/module as needed.
import Groq from "groq-sdk";

interface GenerateRequest {
  transcript: string;
  instruction?: string;
}


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(transcript: string, instruction: string) {

  const prompt = `
You are an AI meeting summarizer.
Summarize the following transcript into clear, concise notes.

Transcript:
${transcript}

--- END OF TRANSCRIPT ---

${instruction && `User Instructions:\n${instruction}`}

Return the summary strictly in text format with proper line breaks (\n\n after each section and bullet)
Format your response as:
- Use Line Breaks for clarity
- Key takeaways
- Important decisions made
- Key participants mentioned
- Next steps discussed
- Key bullet points
- Action items (with assignee if possible)
`;
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b", // or another Groq-supported model
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 500,
  });

  // Extract the summary text
  const groq_res = completion.choices[0]?.message?.content || "";

  function formatGroqResponse(raw: string): string {
    return (
      raw
        // Strip bold/italic markdown
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")

        // Add newlines before section headers
        .replace(/Key Takeaways/g, "\n\nKey Takeaways:\n")
        .replace(/Important Decisions Made/g, "\n\nImportant Decisions Made:\n")
        .replace(
          /Key Participants Mentioned/g,
          "\n\nKey Participants Mentioned:\n"
        )
        .replace(/Next Steps Discussed/g, "\n\nNext Steps Discussed:\n")
        .replace(/Key Bullet Points/g, "\n\nKey Bullet Points:\n")
        .replace(/Action Items/g, "\n\nAction Items:\n")

        // Convert inline bullets into proper list format
        .replace(/\s*-\s*/g, "\n- ")

        // Add spacing around long dashes (for Action Items like "Task – Person")
        .replace(/\s*–\s*/g, " – ")

        // Normalize multiple newlines
        .replace(/\n{2,}/g, "\n\n")
        .trim()
    );
  }

  // return groq_res;
  return formatGroqResponse(groq_res);
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { transcript, instruction } = body;

    // Validate input
    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    if (transcript.length > 50000) {
      return NextResponse.json(
        { error: "Transcript too long. Maximum 50,000 characters allowed." },
        { status: 400 }
      );
    }

    const summary = await getGroqChatCompletion(transcript, instruction || "");

    return NextResponse.json({
      success: true,
      html: "",
      summary: summary,
      processingTime: "2.3s",
      wordCount: transcript.split(" ").length,
    });
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
