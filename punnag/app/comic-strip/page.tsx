'use client';

import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader, Send } from 'lucide-react';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StarField } from '@/components/star-field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type Slide = {
  id: number;
  text: string;
  imageUrl: string;
  mimeType: string;
};

export default function ComicStripPage() {
  const [prompt, setPrompt] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slideshowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new slides are added
    if (slideshowRef.current) {
      slideshowRef.current.scrollTop = slideshowRef.current.scrollHeight;
    }
  }, [slides]);

  const generateComic = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setSlides([]);
    // Use a local variable for slide IDs
    let slideIdCounter = 0;

    try {
      const response = await fetch('/api/generate-comic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = ''; // Buffer for stream chunks

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });

        // Process the buffer to find pairs (add back 's' flag)
        const pairPattern = /(.*?)\[(data:image\/(\w+);base64,([A-Za-z0-9+\/=]+))\]/sg;
        let match;
        let processedIndex = 0;

        // Reset lastIndex for global regex each time we process the buffer
        pairPattern.lastIndex = 0;

        while ((match = pairPattern.exec(streamBuffer)) !== null) {
          const textPart = match[1].trim();
          const mimeType = `image/${match[3]}`;
          const base64Data = match[4];
          const imageUrl = `data:${mimeType};base64,${base64Data}`;

          // Only add slide if the text part is not empty
          if (textPart) {
            setSlides((prevSlides) => [
              ...prevSlides,
              {
                id: slideIdCounter++,
                text: textPart,
                imageUrl: imageUrl,
                mimeType: mimeType,
              },
            ]);
          }
          processedIndex = pairPattern.lastIndex;
        }
        // Keep the unprocessed part of the buffer
        streamBuffer = streamBuffer.substring(processedIndex);

      } // end while loop

      // Handle any final leftover text in the buffer
      if (streamBuffer.trim()) {
          console.warn("Stream ended with unprocessed text:", streamBuffer.trim());
          // Optional: Add final text slide here if desired
      }

    } catch (err: any) {
      console.error("Comic generation fetch error:", err);
      setError(err.message || "Failed to generate comic strip. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
      event.preventDefault();
      generateComic();
    }
  };

  return (
    <div className="min-h-screen bg-[#050a1f] text-white flex flex-col relative">
      <StarField />

      {/* Header */}
      <header className="py-4 px-4 border-b border-white/10 bg-[#050a1f]/80 backdrop-blur-md fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-xl font-serif absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Comic Strip Generator
            </span>
          </h1>
          {/* Optional: Add UserNav or other icons if needed */}
          <div></div> {/* Placeholder for right alignment */} 
        </div>
      </header>

      {/* Main Content Area */} 
      <main className="flex-1 flex flex-col pt-20 pb-24 relative"> {/* Added pb-24 for input spacing */} 
         {/* Mobile title */}
         <div className="md:hidden text-center pt-4 pb-2">
          <h1 className="text-xl font-serif">
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
               Comic Strip Generator
            </span>
          </h1>
        </div>

        {/* Slideshow Area */} 
        <div
          ref={slideshowRef}
          className={cn(
            "flex-1 overflow-y-auto p-4 space-y-6",
            !slides.length && "flex items-center justify-center" // Center placeholder if empty
          )}
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 #111' }} // Basic scrollbar styling
        >
          <AnimatePresence>
            {slides.length > 0 ? (
              slides.map((slide) => (
                <motion.div
                  key={slide.id}
                  className="bg-[#0a1535]/70 backdrop-blur-sm border border-white/10 rounded-lg p-4 max-w-xl mx-auto flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <img src={slide.imageUrl} alt={`Slide ${slide.id + 1}`} className="max-w-full h-auto rounded mb-3 bg-white" />
                  {/* Render parsed HTML from marked */} 
                  <div className="text-sm text-center prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: slide.text }}></div>
                </motion.div>
              ))
            ) : (
              !isLoading && (
                <div className="text-center text-gray-400">
                  Enter a prompt below to start generating your comic strip!
                </div>
              )
            )}
          </AnimatePresence>
            {isLoading && slides.length === 0 && (
                 <div className="text-center text-gray-400 flex flex-col items-center">
                     <Loader className="h-8 w-8 animate-spin mb-2 text-teal-400" />
                     Generating your comic...
                 </div>
            )}
        </div>

        {/* Input Area */} 
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#050a1f]/90 backdrop-blur-md border-t border-white/10 z-10">
           <div className="container mx-auto max-w-2xl flex items-end gap-2">
              {error && (
                 <Alert variant="destructive" className="mb-2 bg-red-900/50 border-red-500/30 text-red-200 p-2 text-xs">
                   <AlertDescription>{error}</AlertDescription>
                 </Alert>
              )}
             <Textarea
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Enter your comic prompt here (e.g., Explain how computers talk to each other)... Press Enter to generate."
               className="flex-1 resize-none bg-white/5 border-white/10 focus:border-teal-500/50 min-h-[40px] max-h-[150px] text-sm p-2"
               rows={1}
               disabled={isLoading}
               style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 #111' }}
             />
             <Button onClick={generateComic} disabled={isLoading || !prompt.trim()} size="icon" className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
               {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
               <span className="sr-only">Generate</span>
             </Button>
           </div>
        </div>
      </main>
    </div>
  );
} 