'use client';

import React from 'react';
import { Play, Pause, Volume1, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { useAudio } from '@/contexts/audio-context';
import { Button } from '@/components/ui/button';
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AudioControls() {
  const { isPlaying, volume, togglePlayPause, setVolume, changeSong, currentSong } = useAudio();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const VolumeIcon = () => {
    if (volume === 0) {
      return <VolumeX className="h-4 w-4" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="h-4 w-4" />;
    }
    return <Volume2 className="h-4 w-4" />;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-gray-900/70 p-2 backdrop-blur-sm border border-white/10 shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeSong('previous')}
              className="rounded-full text-white hover:bg-white/20 w-8 h-8"
              aria-label="Previous song"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={5} className="bg-black/70 text-xs border-white/10">
            Previous Song
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="rounded-full text-white hover:bg-white/20 w-8 h-8"
              aria-label={isPlaying ? 'Pause background music' : 'Play background music'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={5} className="bg-black/70 text-xs border-white/10">
            {isPlaying ? 'Pause' : 'Play'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeSong('next')}
              className="rounded-full text-white hover:bg-white/20 w-8 h-8"
              aria-label="Next song"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={5} className="bg-black/70 text-xs border-white/10">
            Next Song
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1 w-24 group">
          <VolumeIcon />
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={[volume]}
            onValueChange={handleVolumeChange}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child_span]:bg-white/50 [&>span:first-child_span]:group-hover:bg-white/80 [&_button]:bg-white [&_button]:w-3 [&_button]:h-3 [&_button]:border-0 [&_button:hover]:scale-110 [&_button:hover]:shadow-md transition-all"
            aria-label="Volume control"
          />
        </div>

        {currentSong && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="hidden sm:inline text-xs text-gray-300 max-w-[100px] truncate cursor-default">
                {currentSong.title}
              </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={5} className="bg-black/70 text-xs border-white/10">
              {currentSong.title}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
} 