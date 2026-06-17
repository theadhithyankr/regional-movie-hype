'use client';

import React, { useState } from 'react';
import { Play, Activity, Settings } from 'lucide-react';

export default function ScriptControls() {
  const [running, setRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const runScript = async (scriptName: string) => {
    setRunning(scriptName);
    setMessage(null);
    try {
      const res = await fetch('/api/run-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptName }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to run script');
      
      setMessage({ text: `${scriptName} completed successfully!`, type: 'success' });
      // Reload page to fetch fresh data after script completes
      window.location.reload();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">System Controls</h2>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => runScript('analyzer.py')}
          disabled={running !== null}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {running === 'analyzer.py' ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Activity className="w-4 h-4 text-green-400" />
          )}
          Run Analyzer (Groq AI)
        </button>

        <button 
          onClick={() => runScript('yt_collector.py')}
          disabled={running !== null}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {running === 'yt_collector.py' ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Play className="w-4 h-4 text-red-500" />
          )}
          Run YouTube Collector
        </button>

        <button 
          onClick={() => runScript('collector.py')}
          disabled={running !== null}
          className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {running === 'collector.py' ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Activity className="w-4 h-4 text-orange-500" />
          )}
          Start Reddit Stream (Background)
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
