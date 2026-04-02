"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Upload, FileCheck, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdf-parser";

interface StepUploadProps {
  resumeFileName: string;
  resumeText: string;
  onFileSelect: (file: File | null, fileName: string, text: string) => void;
}

const DEMO_RESUME = `ALEX CHEN
Senior Software Engineer | San Francisco, CA
alex.chen@email.com | linkedin.com/in/alexchen

SUMMARY
Software engineer with 6 years of experience building web applications. Worked on various projects using React and Node.js. Good at problem solving and teamwork.

EXPERIENCE

Software Engineer, TechCorp Inc. — 2021-Present
- Built features for the main product
- Worked with the team on various projects
- Fixed bugs and improved performance
- Participated in code reviews

Junior Developer, StartupXYZ — 2018-2021
- Developed web pages using HTML, CSS, JavaScript
- Helped with backend development
- Attended team meetings and sprint planning
- Wrote some tests for the application

EDUCATION
B.S. Computer Science, State University — 2018

SKILLS
JavaScript, React, Node.js, Python, SQL, Git, HTML, CSS`;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StepUpload({
  resumeFileName,
  resumeText,
  onFileSelect,
}: StepUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setParseError(null);

      if (file.type !== "application/pdf") {
        setParseError("Please upload a PDF file.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setParseError("File must be under 10MB.");
        return;
      }

      setIsParsing(true);
      setFileSize(file.size);

      try {
        const text = await extractTextFromPDF(file);
        onFileSelect(file, file.name, text);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to parse PDF";
        setParseError(message);
        onFileSelect(null, "", "");
      } finally {
        setIsParsing(false);
      }
    },
    [onFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChangeFile = useCallback(() => {
    onFileSelect(null, "", "");
    setParseError(null);
    setFileSize(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onFileSelect]);

  const handleDemoResume = useCallback(() => {
    onFileSelect(null, "demo-resume.pdf", DEMO_RESUME);
    setParseError(null);
  }, [onFileSelect]);

  const hasFile = resumeFileName.length > 0 && resumeText.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display text-2xl font-bold text-forge-text">
        Upload Your Resume
      </h2>
      <p className="mt-2 text-sm text-forge-muted">
        Upload your resume as a PDF. We&apos;ll extract the text and prepare it
        for analysis.
      </p>

      <div className="mt-8 space-y-4">
        {/* Upload zone */}
        {!hasFile && !isParsing && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={clsx(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 transition-colors",
              isDragging
                ? "border-forge-accent bg-forge-accent-dim"
                : "border-forge-border hover:border-forge-border-bright",
            )}
          >
            <Upload
              className={clsx(
                "mb-4 h-10 w-10",
                isDragging ? "text-forge-accent" : "text-forge-muted",
              )}
            />
            <p className="text-sm font-medium text-forge-text">
              Drop your PDF here or click to browse
            </p>
            <p className="mt-1 text-xs text-forge-muted">
              PDF files up to 10MB
            </p>
          </div>
        )}

        {/* Parsing state */}
        {isParsing && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-forge-border bg-forge-surface px-6 py-16">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-forge-accent" />
            <p className="text-sm font-medium text-forge-text">
              Extracting text...
            </p>
            <p className="mt-1 text-xs text-forge-muted">
              Parsing your resume PDF
            </p>
          </div>
        )}

        {/* File selected state */}
        {hasFile && !isParsing && (
          <div className="rounded-xl border border-forge-border bg-forge-surface p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-forge-accent/10">
                <FileCheck className="h-5 w-5 text-forge-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-forge-text">
                  {resumeFileName}
                </p>
                {fileSize > 0 && (
                  <p className="text-xs text-forge-muted">
                    {formatFileSize(fileSize)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleChangeFile}
                className="text-xs font-medium text-forge-accent hover:text-forge-accent-hover transition-colors"
              >
                Change file
              </button>
            </div>

            {/* Text preview */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-forge-muted">
                Extracted Text Preview
              </p>
              <pre className="max-h-48 overflow-y-auto rounded-lg border border-forge-border bg-forge-bg p-3 text-xs leading-relaxed text-forge-muted whitespace-pre-wrap">
                {resumeText.slice(0, 500)}
                {resumeText.length > 500 && (
                  <span className="text-forge-accent">
                    {"\n"}... ({(resumeText.length - 500).toLocaleString()} more
                    characters)
                  </span>
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Error state */}
        {parseError && (
          <div className="flex items-start gap-3 rounded-xl border border-forge-danger/30 bg-forge-danger/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-forge-danger" />
            <p className="text-sm text-forge-danger">{parseError}</p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Demo resume button */}
        {!hasFile && !isParsing && (
          <button
            type="button"
            onClick={handleDemoResume}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-forge-border px-4 py-3 text-sm text-forge-muted transition-colors hover:border-forge-border-bright hover:text-forge-text"
          >
            <Sparkles className="h-4 w-4" />
            Use Demo Resume
          </button>
        )}
      </div>
    </motion.div>
  );
}
