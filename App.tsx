import React, { useState, useEffect } from 'react';
import { generateOrEditImage } from './services/geminiService';
import ImageUpload from './components/ImageUpload';
import Button from './components/Button';
import { ImageFile, AppStatus } from './types';
import { COMPLEX_PROMPT_EXAMPLE, SUGGESTED_EDITS } from './constants';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt describing what you want to generate or edit.");
      return;
    }

    setStatus(AppStatus.LOADING);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateOrEditImage({
        prompt: prompt.trim(),
        imageBase64: selectedImage?.base64,
        imageMimeType: selectedImage?.mimeType,
      });
      setGeneratedImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setGeneratedImage(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    // Keep the prompt in case they want to reuse it on a different image
  };

  const handleSamplePrompt = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-banana-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-banana-300 to-banana-600">
              Nano Banana Studio
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Powered by Gemini 2.5 Flash Image
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input Area */}
          <div className="flex flex-col gap-6">
            
            {/* 1. Image Upload Section */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">1. Source Image (Optional)</h2>
                {selectedImage && <span className="text-xs text-green-400 font-mono">Ready to edit</span>}
              </div>
              <ImageUpload 
                onImageSelected={setSelectedImage} 
                selectedImage={selectedImage}
                onClear={handleClear}
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload an image to edit it. Leave empty to generate a new image from scratch.
              </p>
            </div>

            {/* 2. Prompt Section */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex-grow flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-4">2. Describe your vision</h2>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={selectedImage ? "E.g., Add a retro filter, remove the background..." : "E.g., A futuristic cyberpunk city at night..."}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-banana-500 focus:border-transparent resize-none h-40 transition-all text-base leading-relaxed"
              />

              {/* Quick Actions / Suggestions */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Quick Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {selectedImage ? (
                    SUGGESTED_EDITS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSamplePrompt(suggestion)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-gray-600"
                      >
                        {suggestion}
                      </button>
                    ))
                  ) : (
                    <button
                      onClick={() => handleSamplePrompt(COMPLEX_PROMPT_EXAMPLE)}
                      className="text-xs bg-banana-900/30 hover:bg-banana-900/50 text-banana-200 px-3 py-1.5 rounded-full transition-colors border border-banana-800/50 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                      </svg>
                      Try Complex Example
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-auto pt-6 flex justify-end">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={status === AppStatus.LOADING}
                  disabled={!prompt.trim()}
                  className="w-full sm:w-auto px-8"
                >
                  {selectedImage ? 'Edit Image' : 'Generate Image'}
                </Button>
              </div>
            </div>

          </div>

          {/* Right Column: Result Area */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex flex-col min-h-[500px]">
            <h2 className="text-lg font-semibold text-white mb-4">3. Result</h2>
            
            <div className="flex-grow bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700/50 flex flex-col items-center justify-center relative overflow-hidden">
              
              {status === AppStatus.IDLE && !generatedImage && (
                <div className="text-center p-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 opacity-30">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  <p>Your creation will appear here.</p>
                </div>
              )}

              {status === AppStatus.LOADING && (
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-banana-500 mb-4"></div>
                  <p className="text-banana-400 animate-pulse font-medium">Dreaming up your image...</p>
                  <p className="text-gray-500 text-xs mt-2">This usually takes 5-10 seconds</p>
                </div>
              )}

              {status === AppStatus.ERROR && (
                <div className="text-center p-6 max-w-md">
                   <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-900/30 text-red-400 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008h-.008v-.008z" />
                      </svg>
                   </div>
                   <h3 className="text-white font-medium mb-1">Generation Failed</h3>
                   <p className="text-red-300 text-sm mb-4">{error}</p>
                   <Button variant="secondary" onClick={() => setStatus(AppStatus.IDLE)}>Dismiss</Button>
                </div>
              )}

              {generatedImage && (
                <div className="w-full h-full flex flex-col">
                  <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
                    <img 
                      src={generatedImage} 
                      alt="Generated Result" 
                      className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {generatedImage && (
               <div className="mt-6 flex justify-between items-center bg-gray-900 p-4 rounded-lg border border-gray-700">
                 <div className="text-sm text-gray-400">
                   <span className="block text-white font-medium mb-1">Result Ready</span>
                   Tap download to save
                 </div>
                 <a 
                   href={generatedImage} 
                   download={`banana-edit-${Date.now()}.png`}
                   className="inline-flex items-center px-4 py-2 bg-banana-500 hover:bg-banana-400 text-white text-sm font-medium rounded-md transition-colors shadow-lg shadow-banana-500/20"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                   </svg>
                   Download
                 </a>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;