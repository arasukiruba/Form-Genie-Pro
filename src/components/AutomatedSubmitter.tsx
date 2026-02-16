import React, { useState, useRef } from 'react';
import { ParsedForm, QuestionType } from '../types';
import { Play, Square, AlertCircle, CheckCircle, Activity, CreditCard } from 'lucide-react';
import { creditsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface AutomatedSubmitterProps {
  form: ParsedForm;
  answers: Record<string, any>;
  validateForm: () => boolean;
}

interface LogEntry {
  id: number;
  status: 'success' | 'error' | 'info' | 'stopped';
  message: string;
  time: string;
}

export const AutomatedSubmitter: React.FC<AutomatedSubmitterProps> = ({ form, answers, validateForm }) => {
  const { user, refreshCredits } = useAuth();
  const [targetCount, setTargetCount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Ref to track if we should abort the loop immediately
  const stopRequested = useRef(false);
  const logCounter = useRef(0);

  const addLog = (status: 'success' | 'error' | 'info' | 'stopped', message: string) => {
    logCounter.current++;
    const id = logCounter.current;
    setLogs(prev => [{ id, status, message, time: new Date().toLocaleTimeString() }, ...prev]);
    return id;
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Re-creates the payload generation logic to ensure latest answers are used
  const generateFormData = () => {
    const formData = new URLSearchParams();
    form.items.forEach(item => {
      const answer = answers[item.id];
      if (answer === undefined || answer === null || answer === '') return;

      if (item.type === QuestionType.MULTIPLE_CHOICE_GRID || item.type === QuestionType.CHECKBOX_GRID) {
        if (item.rows) {
          const gridAnswers = answer as Record<string, string | string[]>;
          item.rows.forEach(row => {
            const key = row.id || row.label;
            const rowAnswer = gridAnswers[key];
            if (row.id && rowAnswer) {
              if (Array.isArray(rowAnswer)) {
                rowAnswer.forEach(val => formData.append(`entry.${row.id}`, val));
              } else {
                formData.append(`entry.${row.id}`, rowAnswer);
              }
            }
          });
        }
      } else if (item.submissionId) {
        if (Array.isArray(answer)) {
          answer.forEach(val => formData.append(`entry.${item.submissionId}`, val));
        } else {
          formData.append(`entry.${item.submissionId}`, answer.toString());
        }
      }
    });
    return formData;
  };

  const handleStart = async () => {
    if (isSubmitting || !validateForm()) return;
    if (!form.actionUrl) {
      alert("Error: Cannot submit. Form action URL missing.");
      return;
    }

    setIsSubmitting(true);
    stopRequested.current = false;
    setLogs([]);
    setProgress(0);
    logCounter.current = 0;

    addLog('info', "Starting automated submission sequence...");
    await delay(800);
    let successCount = 0;
    let pendingDeductions = 0;

    const performDeduction = async (count: number) => {
      if (user?.role === 'admin') return;
      try {
        const result = await creditsApi.deduct(count);
        addLog('success', `💳 ${count} credits deducted incrementally. Balance: ${result.credits}`);
        refreshCredits();
      } catch (err: any) {
        addLog('error', `Incremental credit deduction failed: ${err.error || 'Unknown error'}`);
      }
    };

    for (let i = 1; i <= targetCount; i++) {
      // Check stop signal before starting iteration
      if (stopRequested.current) {
        setLogs(prev => [{ id: i, status: 'stopped', message: "Stopped by user", time: new Date().toLocaleTimeString() }, ...prev]);
        break;
      }

      try {
        const body = generateFormData();

        // Submit to Google Forms
        await fetch(form.actionUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body
        });

        // Small artificial delay to confirm submission transit
        await delay(500);

        addLog('success', `Submission #${i} finalized successfully`);
        successCount++;
        pendingDeductions++;

        // Deduct every 5 successes
        if (pendingDeductions === 5) {
          await performDeduction(5);
          pendingDeductions = 0;
        }
      } catch (error) {
        addLog('error', `Submission #${i} failed: Network error`);
      }

      setProgress(i);

      // Delay logic: Wait 2 seconds before next iteration, unless it's the last one or stopped
      if (i < targetCount && !stopRequested.current) {
        await delay(2000);
      }
    }

    // Deduct remaining successes
    if (pendingDeductions > 0) {
      await performDeduction(pendingDeductions);
    }

    await delay(500); // Final buffer
    setIsSubmitting(false);
  };

  const handleStop = () => {
    stopRequested.current = true;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-600" />
          Automated Submission
        </h3>
        <div className="text-xs font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
          Interval: 2.0s
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Total Submissions
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={targetCount}
            onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium"
          />
        </div>
        <div className="flex-none">
          {!isSubmitting ? (
            <button
              onClick={handleStart}
              className="flex items-center justify-center bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-md shadow-md transition-all font-bold min-w-[140px]"
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              START
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md shadow-md transition-all font-bold min-w-[140px]"
            >
              <Square className="w-4 h-4 mr-2" fill="currentColor" />
              STOP
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isSubmitting && (
        <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(progress / targetCount) * 100}%` }}
          />
        </div>
      )}

      {/* Logs */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between">
          <span>Activity Log</span>
          {logs.length > 0 && <span className="text-gray-400 font-normal">{logs.length} entries</span>}
        </div>
        <div className="max-h-60 overflow-y-auto p-0 scroll-smooth">
          {logs.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8 italic">
              Waiting to start...
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-white transition-colors">
                  <div className="flex items-center">
                    <span className="font-mono text-gray-400 w-10 text-xs">#{log.id}</span>
                    {log.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />}
                    {log.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />}
                    {log.status === 'stopped' && <Square className="w-3 h-3 text-red-400 mr-2 flex-shrink-0" />}
                    <span className={`font-medium ${log.status === 'success' ? 'text-gray-700' : 'text-red-600'}`}>
                      {log.message}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono ml-4">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};