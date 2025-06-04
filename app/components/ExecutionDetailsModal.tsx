'use client'

import { useEffect, useState } from 'react'

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  step: string;
}

export function ExecutionDetailsModal({ executionId }: { executionId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const eventSource = new EventSource(`/api/langflow/runs/${executionId}/stream`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setLogs(prev => [...prev, data])
    }

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      eventSource.close()
      setIsLoading(false)
    }

    return () => {
      eventSource.close()
      setIsLoading(false)
    }
  }, [executionId])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Execution Details</h2>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading && <div className="text-center">Loading logs...</div>}
          
          {logs.map((log, index) => (
            <div key={index} className="mb-2 p-2 border rounded">
              <div className="text-sm text-gray-500">{log.timestamp}</div>
              <div className={`text-sm ${log.level === 'ERROR' ? 'text-red-600' : 'text-gray-800'}`}>
                {log.step}: {log.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}