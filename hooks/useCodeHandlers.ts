// hooks/useCodeHandlers.ts
import { useState } from 'react';
import { GeneratedCode } from '@/types/json-to-dart';

export const useCodeHandlers = () => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = (code: string, name: string, type: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase()}_${type}.dart`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadAll = (generatedCodes: GeneratedCode[]) => {
    generatedCodes.forEach(({ name, entityCode, modelCode }) => {
      handleDownload(entityCode, name, 'entity');
      handleDownload(modelCode, name, 'model');
    });
  };

  return {
    copySuccess,
    handleCopy,
    handleDownload,
    handleDownloadAll,
  };
};