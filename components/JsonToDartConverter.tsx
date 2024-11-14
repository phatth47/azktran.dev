'use client'

import React, { useState } from 'react'
import { JsonInput } from './JsonInput'
import { CodeOutput } from './CodeOuput'
import { useCodeHandlers } from '@/hooks/useCodeHandlers'
import { GeneratedCode } from '@/types/json-to-dart'
import { collectGeneratedCodes } from '@/utils/dart-generators'

const JsonToDartConverter: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('')
  const [className, setClassName] = useState('')
  const [generatedCodes, setGeneratedCodes] = useState<GeneratedCode[]>([])
  const [selectedTab, setSelectedTab] = useState<'entity' | 'model'>('entity')
  const [selectedFile, setSelectedFile] = useState('')
  const [error, setError] = useState('')

  const { handleCopy, handleDownload, handleDownloadAll } = useCodeHandlers()

  const handleGenerate = () => {
    if (!className.trim()) {
      setError('Please enter a class name')
      return
    }

    try {
      const jsonData = JSON.parse(jsonInput)
      const allGeneratedCodes = collectGeneratedCodes(jsonData, className)
      setGeneratedCodes(allGeneratedCodes)
      // Auto select root entity file
      if (allGeneratedCodes.length > 0) {
        setSelectedFile(allGeneratedCodes[0].name)
        setSelectedTab('entity')
      }
      setError('')
    } catch (e) {
      setError('Invalid JSON input')
      setGeneratedCodes([])
      setSelectedFile('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto flex h-full max-w-7xl flex-col">
        <h1 className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
          JSON to Dart Generator
        </h1>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex h-full flex-col">
            <JsonInput
              className={className}
              jsonInput={jsonInput}
              error={error}
              onClassNameChange={setClassName}
              onJsonInputChange={setJsonInput}
              onGenerate={handleGenerate}
            />
          </div>
          <div className="flex h-full flex-col">
            <CodeOutput
              generatedCodes={generatedCodes}
              selectedTab={selectedTab}
              selectedFile={selectedFile}
              onSelectedFileChange={setSelectedFile}
              onTabChange={setSelectedTab}
              onDownloadAll={() => handleDownloadAll(generatedCodes)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default JsonToDartConverter
