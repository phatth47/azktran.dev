import React, { useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

interface JsonInputProps {
  className: string
  jsonInput: string
  error: string
  onClassNameChange: (name: string) => void
  onJsonInputChange: (json: string) => void
  onGenerate: () => void
}

const formatJson = (jsonString: string): string => {
  try {
    const obj = JSON.parse(jsonString)
    return JSON.stringify(obj, null, 2)
  } catch {
    return jsonString
  }
}

export const JsonInput: React.FC<JsonInputProps> = ({
  className,
  jsonInput,
  error,
  onClassNameChange,
  onJsonInputChange,
  onGenerate,
}) => {
  const handleFormat = () => {
    try {
      const formatted = formatJson(jsonInput)
      onJsonInputChange(formatted)
    } catch (err) {
      // Keep original if invalid JSON
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <div className="space-y-4">
        {/* Class Name Input */}
        <div>
          <label htmlFor="className" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Class Name
          </label>
          <input
            id="className"
            type="text"
            placeholder="Enter class name"
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 
                     transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 
                     dark:border-gray-600"
            value={className}
            onChange={(e) => onClassNameChange(e.target.value)}
          />
        </div>

        {/* JSON Input */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              JSON Input
            </label>
            <button
              onClick={handleFormat}
              className="flex items-center gap-2 rounded-lg bg-gray-100 
                       px-3 py-1 text-sm 
                       text-gray-700 transition-colors 
                       hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Format JSON
            </button>
          </div>

          <div className="min-h-[400px] overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
            <CodeMirror
              value={jsonInput}
              height="400px"
              theme={document.documentElement.classList.contains('dark') ? vscodeDark : undefined}
              extensions={[json()]}
              onChange={onJsonInputChange}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                history: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-lg 
                   bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate Code
        </button>

        {/* Error Message */}
        {error && (
          <div
            className="border-l-4 border-red-500 bg-red-50 p-4 text-red-700 
                        dark:bg-red-900/50 dark:text-red-300"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
