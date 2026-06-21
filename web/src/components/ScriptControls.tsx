'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Play, Activity, ActivitySquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ScriptControls() {
  const [running, setRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>('Idle');

  useEffect(() => {
    supabase.from('pipeline_status').select('status_text').eq('id', 1).single().then(({ data }) => {
      if (data) setLiveStatus(data.status_text);
    });

    const channel = supabase
      .channel('status-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipeline_status' }, (payload) => {
        if (payload.new && payload.new.status_text) {
          setLiveStatus(payload.new.status_text);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      if (!res.ok) throw new Error(data.error || 'Failed to start script');

      setMessage({ text: data.message || `${scriptName} started.`, type: 'success' });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setTimeout(() => setRunning(null), 1000);
    }
  };

  const isPipelineActive = liveStatus !== 'Idle' && !liveStatus.includes('Finished');

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">System Controls</h2>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <button 
          onClick={() => runScript('master_pipeline.py')}
          disabled={running !== null || isPipelineActive}
          className="flex items-center justify-center w-full md:w-auto gap-2 bg-primary hover:bg-[#D42A08] text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 shadow-md"
        >
          {running === 'master_pipeline.py' || isPipelineActive ? (
            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {isPipelineActive ? 'Pipeline Running...' : 'Run Autonomous Pipeline'}
        </button>

        <div className="flex-1 w-full bg-neutral-900 rounded-lg p-3 flex items-center gap-3 border border-neutral-800">
          <ActivitySquare className={`w-5 h-5 ${isPipelineActive ? 'text-primary animate-pulse' : 'text-neutral-500'}`} />
          <span className="font-mono text-sm text-neutral-300">
            {liveStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
