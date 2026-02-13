import React, { useState } from 'react';
import { ParsedForm, GenerationState } from './types';
import { fetchUrlContent } from './services/proxyService';
import { parseFormHTML } from './services/parserService';
import { FormPreview } from './components/FormPreview';
import { Spinner } from './components/Spinner';
import { Link2, FileCode2, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [manualHtml, setManualHtml] = useState('');
  const [inputType, setInputType] = useState<'url' | 'html'>('url');
  const [parsedForm, setParsedForm] = useState<ParsedForm | null>(null);
  const [status, setStatus] = useState<GenerationState>({ status: 'idle' });

  const handleImport = async () => {
    if (inputType === 'url' && !url) return;
    if (inputType === 'html' && !manualHtml) return;

    try {
      let htmlContent = '';
      if (inputType === 'url') {
        setStatus({ status: 'fetching_html', message: 'Fetching form content...' });
        htmlContent = await fetchUrlContent(url);
      } else {
        htmlContent = manualHtml;
      }
      setStatus({ status: 'analyzing', message: 'Parsing form structure...' });
      await new Promise(resolve => setTimeout(resolve, 100));
      const formStructure = await parseFormHTML(htmlContent);

      setParsedForm(formStructure);
      setStatus({ status: 'success' });
    } catch (error: any) {
      setStatus({ status: 'error', message: error.message || 'Something went wrong.' });
    }
  };

  const reset = () => {
    setParsedForm(null);
    setStatus({ status: 'idle' });
    setUrl('');
    setManualHtml('');
  };

  const isLoading = status.status === 'fetching_html' || status.status === 'analyzing';
  const isDisabled = isLoading || (inputType === 'url' && !url) || (inputType === 'html' && !manualHtml);

  return (
    <AnimatePresence mode="wait">
      {parsedForm ? (
        <motion.div key="preview" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen">
          <FormPreview form={parsedForm} onBack={reset} />
        </motion.div>
      ) : (
        <motion.div key="import" variants={pageVariants} initial="initial" animate="animate" exit="exit"
          className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7fc] p-4 relative overflow-hidden"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {/* Soft Ambient Blobs */}
          <div className="fixed -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(66,133,244,0.12) 0%, transparent 70%)' }}></div>
          <div className="fixed -bottom-40 -right-40 w-[450px] h-[450px] rounded-full opacity-25 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)' }}></div>

          {/* Hero */}
          <motion.div className="mb-10 flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-2xl scale-[1.8]"></div>
              <div className="relative bg-gradient-to-br from-[#4285F4] to-[#5a9cf5] p-4 rounded-2xl shadow-lg shadow-blue-500/15 animate-float">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text tracking-tight">Form Genie</h1>
            <p className="text-gray-400 text-sm mt-1.5 tracking-wide font-medium">Smart Google Form Automation</p>
          </motion.div>

          {/* Main Card */}
          <motion.div className="w-full max-w-[560px] card overflow-hidden relative z-10"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
            {/* Top Gradient Accent */}
            <div className="h-[3px] w-full bg-gradient-to-r from-[#4285F4] via-[#5a9cf5] to-[#4285F4]"></div>

            <div className="p-7 pt-7">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Import Form</h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Enter a public Google Form URL or paste the HTML source to get started.
              </p>

              {/* Tab Switcher with animated indicator */}
              <div className="flex bg-gray-50 rounded-xl p-1 mb-6 border border-gray-100 relative">
                <button
                  onClick={() => setInputType('url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 ${inputType === 'url' ? 'text-[#4285F4]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Link2 className="w-4 h-4" /> Public URL
                </button>
                <button
                  onClick={() => setInputType('html')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 ${inputType === 'html' ? 'text-[#4285F4]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FileCode2 className="w-4 h-4" /> Source HTML
                </button>
                {/* Sliding indicator */}
                <motion.div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-gray-100"
                  animate={{ left: inputType === 'url' ? '4px' : 'calc(50% + 0px)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              </div>

              {/* Inputs with slide-and-fade */}
              <div className="space-y-5">
                <AnimatePresence mode="wait">
                  {inputType === 'url' ? (
                    <motion.div key="url-input" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Google Form Link</label>
                      <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://docs.google.com/forms/d/e/..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 outline-none focus:border-[#4285F4]/50 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all duration-300 text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" /> Try "Source HTML" if the URL is blocked by CORS.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div key="html-input" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Paste Page Source</label>
                      <textarea value={manualHtml} onChange={(e) => setManualHtml(e.target.value)}
                        placeholder="<html>...</html>" rows={6}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 outline-none focus:border-[#4285F4]/50 focus:bg-white focus:ring-3 focus:ring-blue-100 transition-all duration-300 font-mono text-xs leading-relaxed resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {status.status === 'error' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start">
                      <AlertCircle className="w-5 h-5 mr-2.5 flex-shrink-0 mt-0.5 text-red-400" />
                      <span>{status.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <div className="flex justify-end pt-1">
                  <button onClick={handleImport} disabled={isDisabled}
                    className="btn-primary font-semibold px-7 py-3 rounded-xl flex items-center justify-center text-sm tracking-wide">
                    {isLoading ? (
                      <><Spinner size="h-4 w-4" /><span className="ml-2.5">{status.message}</span></>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Import Form</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div className="mt-10 text-gray-300 text-xs text-center font-medium tracking-wide relative z-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Designed by Arasukirubanandhan <span className="text-red-300">❤️</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;