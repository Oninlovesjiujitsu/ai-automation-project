import { useState, useCallback } from 'react';

export type LogEvent = {
  timestamp: string;
  message: string;
};

export type EvalData = {
  score: number;
  passed: boolean;
  reason: string;
};

export function useTicketStream() {
  const [draft, setDraft] = useState<string>('');
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvalData | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const startStream = useCallback(async (ticketText: string, customerName: string) => {
    // Reset state
    setDraft('');
    setLogs([]);
    setSentiment(null);
    setEvaluation(null);
    setError(null);
    setIsStreaming(true);
    setLatencyMs(null);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/stream-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_text: ticketText, customer_name: customerName }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to stream');
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // Keep the last incomplete part in the buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '');
              try {
                const parsed = JSON.parse(dataStr);
                
                if (parsed.type === 'log') {
                  setLogs((prev) => [
                    ...prev,
                    { timestamp: new Date().toISOString(), message: parsed.content },
                  ]);
                } else if (parsed.type === 'sentiment') {
                  setSentiment(parsed.content);
                } else if (parsed.type === 'chunk') {
                  setDraft((prev) => prev + parsed.content);
                } else if (parsed.type === 'eval') {
                  setEvaluation(parsed.data);
                } else if (parsed.type === 'done') {
                  done = true;
                }
              } catch (e) {
                console.error("Failed to parse SSE line:", line, e);
              }
            }
          }
        }
      }
      
      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));
      
    } catch (err: any) {
      setError(err.message || 'Stream error');
      setLogs((prev) => [...prev, { timestamp: new Date().toISOString(), message: `Error: ${err.message}` }]);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return {
    draft,
    logs,
    sentiment,
    evaluation,
    isStreaming,
    error,
    latencyMs,
    startStream,
    // Provide a way to manually clear the response, similar to the old state
    clearResponse: useCallback(() => {
      setDraft('');
      setLogs([]);
      setSentiment(null);
      setEvaluation(null);
      setError(null);
      setLatencyMs(null);
    }, [])
  };
}
