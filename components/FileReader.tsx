'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

interface FileReaderProps {
  onTextChange: (text: string) => void;
}

/**
 * FileReader component handles both file upload and direct text input
 * Supports .txt files only and provides fallback textarea for pasting
 */
export function FileReader({ onTextChange }: FileReaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');

  const handleFileRead = useCallback((file: File) => {
    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file only');
      return;
    }

    const reader = new window.FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        onTextChange(text);
        setFileName(file.name);
        setTextInput(text); // Clear manual input when file is loaded
        toast.success(`File "${file.name}" loaded successfully`);
      }
    };
    reader.onerror = () => {
      toast.error('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  }, [onTextChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileRead(files[0]);
    }
  }, [handleFileRead]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileRead(files[0]);
    }
    // Reset input to allow selecting the same file again
    e.target.value = '';
  }, [handleFileRead]);

  const handleTextChange = useCallback((text: string) => {
    setTextInput(text);
    onTextChange(text);
    if (fileName) {
      setFileName(''); // Clear file name when typing manually
    }
  }, [onTextChange, fileName]);

  const clearAll = useCallback(() => {
    setTextInput('');
    setFileName('');
    onTextChange('');
  }, [onTextChange]);

  return (
    <div className="w-full space-y-4 flex items-center justify-evenly">
      {/* File Upload Area */}
      
      <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <div className="space-y-3">
          <Upload className="w-8 mx-auto text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Drop your .txt file here or
            </p>
            <Label htmlFor="file-upload">
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <span className="cursor-pointer">Browse Files</span>
              </Button>
            </Label>
            <input
              id="file-upload"
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-500">
            Only .txt files are supported
          </p>
        </div>
      </div>
     
      {/* Show uploaded file info */}
      {fileName && (
        <div className="h-10 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <FileText className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800 flex-1">
            {fileName}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      </div>

      {/* Text Input Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-input">
            Or paste your transcript directly:
          </Label>
          {textInput && !fileName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs h-2 w-2"
            >
              Clear
            </Button>
          )}
        </div>
        <Textarea
          id="text-input"
          value={textInput}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Paste your meeting transcript here..."
          className="min-h-[150px] resize-none"
          disabled={!!fileName} // Disable when file is loaded
        />
      </div>
    </div>
  );
}