"use client";

import { useState, useCallback, useEffect } from "react";
import { WizardState, ATSTarget } from "@/lib/types";

const STORAGE_KEY = "gdrWizard";

const initialState: WizardState = {
  step: 1,
  atsTarget: null,
  jobTitle: "",
  jobDescription: "",
  resumeFile: null,
  resumeFileName: "",
  resumeText: "",
};

function loadFromStorage(): WizardState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      ...parsed,
      resumeFile: null, // File objects can't be serialized
    };
  } catch {
    return initialState;
  }
}

function saveToStorage(state: WizardState) {
  try {
    const { resumeFile, ...serializable } = state;
    void resumeFile; // excluded intentionally
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // ignore storage errors
  }
}

export function clearWizardStorage() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useWizardState() {
  const [state, setState] = useState<WizardState>(initialState);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  // Persist to sessionStorage on every state change
  useEffect(() => {
    if (hydrated) {
      saveToStorage(state);
    }
  }, [state, hydrated]);

  const setAtsTarget = useCallback((target: ATSTarget) => {
    setState((prev) => ({ ...prev, atsTarget: target }));
  }, []);

  const setJobTitle = useCallback((title: string) => {
    setState((prev) => ({ ...prev, jobTitle: title }));
  }, []);

  const setJobDescription = useCallback((jd: string) => {
    setState((prev) => ({ ...prev, jobDescription: jd }));
  }, []);

  const setResumeFile = useCallback(
    (file: File | null, fileName: string, text: string) => {
      setState((prev) => ({
        ...prev,
        resumeFile: file,
        resumeFileName: fileName,
        resumeText: text,
      }));
    },
    [],
  );

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 3) }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const canProceed = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1:
          return state.atsTarget !== null;
        case 2:
          return state.jobDescription.trim().length > 20;
        case 3:
          return state.resumeText.length > 0;
        default:
          return false;
      }
    },
    [state],
  );

  const reset = useCallback(() => {
    clearWizardStorage();
    setState(initialState);
    setIsAnalyzing(false);
    setError(null);
  }, []);

  return {
    state,
    hydrated,
    isAnalyzing,
    setIsAnalyzing,
    error,
    setError,
    setAtsTarget,
    setJobTitle,
    setJobDescription,
    setResumeFile,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    reset,
  };
}
