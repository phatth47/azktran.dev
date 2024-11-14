import React, { useState } from 'react'
import { GeneratedCode } from '@/types/json-to-dart'

interface CodeOutputProps {
  generatedCodes: GeneratedCode[]
  selectedTab: 'entity' | 'model'
  selectedFile: string
  onSelectedFileChange: (file: string) => void
  onTabChange: (tab: 'entity' | 'model') => void
  onDownloadAll: () => void
}

const CodeLine: React.FC<{ content: string }> = ({ content }) => {
  const parts: React.ReactNode[] = []
  let currentIndex = 0

  const addStyledText = (text: string, className: string) => {
    parts.push(
      <span key={currentIndex} className={className}>
        {text}
      </span>
    )
    currentIndex++
  }

  let remainingContent = content

  // Preserve leading whitespace
  const leadingSpaces = content.match(/^(\s*)/)?.[0] || ''
  if (leadingSpaces) {
    parts.push(<span key={`space-${currentIndex}`}>{leadingSpaces}</span>)
    currentIndex++
    remainingContent = remainingContent.slice(leadingSpaces.length)
  }

  // Handle imports
  if (remainingContent.startsWith('import')) {
    const importMatch = remainingContent.match(/(import)(\s+)(['"][^'"]+['"])(?)/)
    if (importMatch) {
      const [_, importKw, space, path, semicolon] = importMatch
      addStyledText(importKw, 'text-purple-600')
      addStyledText(space, 'text-gray-600')
      addStyledText(path, 'text-green-600')
      addStyledText(semicolon || '', 'text-gray-600')
      return <>{parts}</>
    }
  }

  // Handle class declaration
  const classMatch = remainingContent.match(/(class\s+)(\w+)(Entity|Model)(\s+extends\s+)(\w+)(\s*{?)/)
  if (classMatch) {
    const [_, classKw, name, suffix, extendsKw, baseClass, bracket] = classMatch
    addStyledText(classKw, 'text-purple-600')
    addStyledText(name + suffix, 'text-yellow-600')
    addStyledText(extendsKw, 'text-purple-600')
    addStyledText(baseClass, 'text-blue-600')
    addStyledText(bracket || '', 'text-gray-600')
    return <>{parts}</>
  }

  // Handle properties with type
  const propertyMatch = remainingContent.match(/(final\s+)(\w+(?:<[^>]+>)?)(\s+\w+)(?)/)
  if (propertyMatch) {
    const [_, modifier, type, name, semicolon] = propertyMatch
    addStyledText(modifier, 'text-purple-600')
    addStyledText(type, 'text-blue-600')
    addStyledText(name, 'text-gray-700')
    addStyledText(semicolon || '', 'text-gray-600')
    return <>{parts}</>
  }

  // Handle constructor
  const constructorMatch = remainingContent.match(/(const\s+)(\w+Entity)(\s*{)/)
  if (constructorMatch) {
    const [_, constKw, name, bracket] = constructorMatch
    addStyledText(constKw, 'text-purple-600')
    addStyledText(name, 'text-yellow-600')
    addStyledText(bracket, 'text-gray-600')
    return <>{parts}</>
  }

  // Handle required parameters
  const requiredMatch = remainingContent.match(/(required\s+)(this\.)(\w+)(,?)/)
  if (requiredMatch) {
    const [_, requiredKw, thisKw, name, comma] = requiredMatch
    addStyledText(requiredKw, 'text-purple-600')
    addStyledText(thisKw, 'text-blue-600')
    addStyledText(name, 'text-gray-700')
    addStyledText(comma || '', 'text-gray-600')
    return <>{parts}</>
  }

  // Handle annotations
  const annotationMatch = remainingContent.match(/(@\w+)/)
  if (annotationMatch) {
    addStyledText(annotationMatch[1], 'text-green-600')
    return <>{parts}</>
  }

  // Handle method declarations (get props)
  const methodMatch = remainingContent.match(/(List<[^>]+>)(\s+get\s+props\s*=>)(\s*\[)/)
  if (methodMatch) {
    const [_, returnType, declaration, bracket] = methodMatch
    addStyledText(returnType, 'text-blue-600')
    addStyledText(declaration, 'text-purple-600')
    addStyledText(bracket, 'text-gray-600')
    return <>{parts}</>
  }

  // Handle copyWith method definition
  const copyWithMatch = remainingContent.match(/^(\s*)(\w+Entity)(\s+copyWith\s*\{)/)
  if (copyWithMatch) {
    const [_, space, className, method] = copyWithMatch
    addStyledText(space, '')
    addStyledText(className, 'text-yellow-600')
    addStyledText(method, 'text-purple-600')
    return <>{parts}</>
  }

  // Handle copyWith parameters
  const copyWithParamMatch = remainingContent.match(/^(\s*)([A-Za-z<>?]+)(\s+)(\w+)(,?)$/)
  if (copyWithParamMatch) {
    const [_, space, type, innerSpace, name, comma] = copyWithParamMatch
    addStyledText(space, '')
    addStyledText(type, 'text-blue-600')
    addStyledText(innerSpace, '')
    addStyledText(name, 'text-gray-700')
    addStyledText(comma || '', 'text-gray-600')
    return <>{parts}</>
  }

  // Handle return statement
  const returnMatch = remainingContent.match(/^(\s*)(return\s+)(\w+Entity)(\s*\()/)
  if (returnMatch) {
    const [_, space, returnKw, className, paren] = returnMatch
    addStyledText(space, '')
    addStyledText(returnKw, 'text-purple-600')
    addStyledText(className, 'text-yellow-600')
    addStyledText(paren, 'text-gray-600')
    return <>{parts}</>
  }

  // Handle property assignments in copyWith return
  const assignmentMatch = remainingContent.match(/^(\s*)(\w+)(\s+)(\w+\s*\?\?\s*this\.\w+)(,?)$/)
  if (assignmentMatch) {
    const [_, space, prop, innerSpace, value, comma] = assignmentMatch
    addStyledText(space, '')
    addStyledText(prop, 'text-gray-700')
    addStyledText(': ', 'text-gray-600') // Explicitly add colon
    addStyledText(value, 'text-blue-600')
    addStyledText(comma || '', 'text-gray-600')
    return <>{parts}</>
  }

  // Handle brackets and punctuation
  if (/^[{}(),[\]]+$/.test(remainingContent.trim())) {
    addStyledText(remainingContent, 'text-gray-600')
    return <>{parts}</>
  }

  // Default case
  parts.push(<span key="default">{remainingContent}</span>)
  return <>{parts}</>
}

export default CodeLine

export const CodeOutput: React.FC<CodeOutputProps> = ({
  generatedCodes,
  selectedTab,
  selectedFile, // Thêm prop này
  onSelectedFileChange, // Thêm prop này
  onTabChange,
  onDownloadAll,
}) => {
  const formatCode = (code: string): string => {
    const lines = code.split('\n')
    const formattedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i].trimEnd()
      const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : ''

      // Add current line
      formattedLines.push(currentLine)

      if (currentLine.trim() === '}' && nextLine !== '' && nextLine !== '}') {
        formattedLines.push('\n')
      }
    }

    // Remove consecutive empty lines
    return formattedLines
      .map((line) => line.trimEnd()) // Remove trailing spaces but keep the line
      .join('\n') // Join with actual newlines
  }

  const getCurrentCode = () => {
    const currentFile = generatedCodes.find((code) => code.name === selectedFile)
    if (!currentFile) return ''
    return formatCode(selectedTab === 'entity' ? currentFile.entityCode : currentFile.modelCode)
  }

  // Thêm state để hiện thông báo copy
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  const handleCopyFormatted = async () => {
    if (!selectedFile) return

    try {
      await navigator.clipboard.writeText(getCurrentCode())
      setShowCopyNotification(true)
      setTimeout(() => setShowCopyNotification(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
      {/* Header with Tabs */}
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex space-x-2">
            <button
              onClick={() => onTabChange('entity')}
              className={`rounded-lg px-4 py-2 transition-colors ${
                selectedTab === 'entity'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              Entities
            </button>
            <button
              onClick={() => onTabChange('model')}
              className={`rounded-lg px-4 py-2 transition-colors ${
                selectedTab === 'model'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              Models
            </button>
          </div>

          {generatedCodes.length > 0 && (
            <button
              onClick={onDownloadAll}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download All
            </button>
          )}
        </div>

        {/* File List */}
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {generatedCodes.map(({ name, fileName }) => (
              <button
                key={name}
                onClick={() => onSelectedFileChange(name)}
                className={`rounded px-3 py-1.5 text-sm transition-colors ${
                  selectedFile === name
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                {fileName}_{selectedTab}.dart
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div className="min-h-0 flex-1">
        {selectedFile && (
          <div className="h-full overflow-auto bg-gray-50 p-4 dark:bg-gray-900">
            <div className="relative">
              {/* Copy Button with Notification */}
              <div className="absolute right-2 top-2 z-50">
                {' '}
                {/* Increased z-index and used container */}
                <button
                  onClick={handleCopyFormatted}
                  className="rounded-lg bg-gray-100 p-2 text-gray-700 
                     transition-colors hover:bg-gray-200 dark:bg-gray-700 
                     dark:text-gray-200 dark:hover:bg-gray-600"
                  title="Copy code"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                {/* Notification */}
                {showCopyNotification && (
                  <div
                    className="absolute -top-8 right-0 z-50 whitespace-nowrap rounded bg-gray-800 
                         px-2 py-1 text-xs text-white shadow-lg"
                  >
                    Copied!
                  </div>
                )}
              </div>

              <pre className="font-mono text-sm leading-normal">
                {getCurrentCode()
                  .split('\n')
                  .map((line, index) => (
                    <div
                      key={index}
                      className={`px-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${line.trim() === '' ? 'h-4' : ''}`}
                    >
                      <CodeLine content={line} />
                    </div>
                  ))}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
