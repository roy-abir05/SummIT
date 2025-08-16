"use client";

import { useState, useCallback, useEffect } from "react";
import { FileReader } from "@/components/FileReader";
import { Editor } from "@/components/Editor";
import { EmailForm } from "@/components/EmailForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, Share2, Settings, X } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [transcript, setTranscript] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSummaryFocused, setIsSummaryFocused] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Load saved data on mount
  // useEffect(() => {
  //   const savedSummary = localStorage.getItem("ai-summarizer-summary");
  //   const savedInstructions = localStorage.getItem(
  //     "ai-summarizer-instructions"
  //   );

  //   if (savedSummary) setSummary(savedSummary);
  //   if (savedInstructions) setInstructions(savedInstructions);
  // }, []);

  // Auto-save instructions
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (instructions) {
  //       localStorage.setItem("ai-summarizer-instructions", instructions);
  //     }
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, [instructions]);

  const handleTranscriptChange = useCallback((text: string) => {
    setTranscript(text);
  }, []);

  const handleGenerateSummary = async () => {
    if (!transcript.trim()) {
      toast.error("Please provide a transcript to summarize");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          instruction: instructions.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      // setSummary(data.html);
      setSummary(data.summary);
      setHasUnsavedChanges(false);

      toast.success("Summary generated successfully!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSummaryChange = useCallback((newSummary: string) => {
    setSummary(newSummary);
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveDraft = () => {
    localStorage.setItem("ai-summarizer-summary", summary);
    setHasUnsavedChanges(false);
    toast.success("Draft saved to local storage");
  };

  const placeholderInstructions = `Examples of custom instructions:

• Focus on action items and deadlines
• Highlight key decisions and their rationale
• Summarize technical discussions for stakeholders
• Extract budget and resource requirements
• Identify risks and mitigation strategies`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className={`text-center mb-8 ${isSummaryFocused ? "hidden" : ""}`}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">SummIT</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your meeting transcripts into actionable summaries with
            AI-powered analysis and easy sharing.
          </p>
        </div>

        <div
          className={`h-[70vh] grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-300 ${
            isSummaryFocused ? "lg:grid-cols-1" : ""
          }`}
        >
          {/* Left Column - Input */}
          <div
            className={`lg:col-span-1 space-y-6 transition-all duration-300 ${
              isSummaryFocused ? "hidden" : ""
            }`}
          >
            {/* File Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Transcript Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileReader onTextChange={handleTranscriptChange} />
                {transcript && (
                  <div className="mt-4">
                    <Badge variant="secondary" className="mb-2">
                      {transcript.length} characters loaded
                    </Badge>
                    <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto text-sm">
                      {transcript.substring(0, 200)}
                      {transcript.length > 200 && "..."}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Custom Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="instructions">
                    Customize how you want the summary formatted (optional)
                  </Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder={placeholderInstructions}
                    className="min-h-[40px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateSummary}
              disabled={!transcript.trim() || isGenerating}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>

          {/* Middle Column - Summary Display */}
          <div
            className={`relative h-[70vh] lg:col-span-1 space-y-6 transition-all duration-300 cursor-pointer ${
              isSummaryFocused
                ? "col-span-1 lg:col-span-1 w-full max-w-4xl mx-auto z-20"
                : ""
            }`}
            onClick={() => {
              if (!isSummaryFocused) setIsSummaryFocused(true);
            }}
          >
            {/* Show collapse/back button when focused */}
            {isSummaryFocused && (
              <button
                className="absolute top-4 left-4 z-30 bg-white/80 hover:bg-white rounded-full shadow p-2 border border-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSummaryFocused(false);
                }}
                aria-label="Back"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <Card
              className="h-full cursor-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Summary
                  </CardTitle>
                  {hasUnsavedChanges && (
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-300"
                    >
                      Unsaved changes
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="w-full h-[85%] box-border">
                <div className="w-full h-full flex flex-col items-center justify-between box-border">
                  <textarea
                    value={summary ?? ""}
                    readOnly={summary?.length == 0}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Your Generated Summary will appear here..."
                    className={`w-[75%] h-[75%] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none `}
                  />
                  <Button
                    onClick={() => {
                      setIsEmailModalOpen(true);
                    }}
                    // disabled={summary?.length == 0}
                    className="w-[75%] h-[10%] text-base gap-x-2"
                    size="lg"
                  >
                    <Share2></Share2>
                    Share via Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Email Sender */}
      {isEmailModalOpen && (
        <div className="absolute w-screen h-screen top-0 left-0 bg-[rgba(146,173,186,0.5)] rounded-lg z-50 p-6 flex items-center justify-center">
          <div
            className={`transition-all duration-300 ${
              isSummaryFocused ? "hidden" : ""
            }`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Share Summary
                  </div>
                  <button onClick={() => setIsEmailModalOpen(false)}><X></X></button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmailForm summary={summary} disabled={!summary.trim()} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
