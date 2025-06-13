'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from 'react';

// Define the structure for a song
interface Song {
  src: string;
  title: string;
  artist?: string; // Optional
}

// Update the context type definition
interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  currentSong: Song | null;
  currentSongIndex: number; // Keep index if needed
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  play: () => void;
  pause: () => void;
  changeSong: (direction: 'next' | 'previous') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// --- Your Song Playlist --- 
// Using the filenames provided by the user (assuming .mp3)
const SONG_LIST: Song[] = [
  { src: '/first_song.mp3', title: 'Track 1' }, 
  { src: '/second_song.mp3', title: 'Track 2' }, 
  { src: '/third_song.mp3', title: 'Track 3' }, 
  { src: '/fourth_song.mp3', title: 'Track 4' }, 
];
// ------------------------

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setInternalVolume] = useState(0.5);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentSong = SONG_LIST[currentSongIndex] || null;

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
        console.error("Audio element not yet available.");
        return null;
    }
    return audioRef.current;
  }, []);

  const play = useCallback(() => {
    const audio = getAudio();
    if (audio) {
        // Ensure src is correct before playing
        const expectedSrc = SONG_LIST[currentSongIndex]?.src;
        if (expectedSrc && audio.currentSrc !== new URL(expectedSrc, window.location.origin).toString()) {
             audio.src = expectedSrc;
             audio.load();
        }
        // Attempt to play
        audio.play().catch(error => {
            console.error("Audio play failed:", error);
            setIsPlaying(false);
        });
    }
  }, [getAudio, currentSongIndex]); // Depend on index

  const pause = useCallback(() => {
    const audio = getAudio();
    if (audio) {
        audio.pause();
    }
  }, [getAudio]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setVolume = useCallback((newVolume: number) => {
    const audio = getAudio();
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    if (audio) {
        audio.volume = clampedVolume;
    }
    setInternalVolume(clampedVolume);
  }, [getAudio]);

  // Function to change song (corrected dependencies and logic)
  const changeSong = useCallback((direction: 'next' | 'previous') => {
      setCurrentSongIndex((prevIndex) => {
          let newIndex;
          if (direction === 'next') {
              newIndex = (prevIndex + 1) % SONG_LIST.length;
          } else {
              newIndex = (prevIndex - 1 + SONG_LIST.length) % SONG_LIST.length;
          }
          return newIndex;
      });
      // Note: Actual source change and play logic is handled by the useEffect below
  }, []); // No dependencies needed here, relies on setCurrentSongIndex updater form

  // Effect for event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => changeSong('next'); // Go to next song when one finishes

    audio.volume = volume;
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded); // Listen for ended event

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume, changeSong]); // Add changeSong dependency for handleEnded

  // Effect to update audio source when song index changes
  useEffect(() => {
    const audio = audioRef.current;
    const newSong = SONG_LIST[currentSongIndex];
    if (audio && newSong) {
        // Only update src and load if it's different
        // Construct absolute URL for comparison to handle relative paths correctly
        const absoluteSrc = new URL(newSong.src, window.location.origin).toString();
        if (audio.currentSrc !== absoluteSrc) {
            console.log('Changing audio source to:', newSong.src);
            audio.src = newSong.src;
            audio.load(); // Load the new source
            if (isPlaying) {
                // If was playing, try to play new song after a short delay
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.error("Error auto-playing next song:", e);
                        setIsPlaying(false); // Update state if autoplay fails
                    });
                }
            }
        }
    }
  }, [currentSongIndex, isPlaying]); // Rerun when index or playing state changes

  return (
    <AudioContext.Provider value={{ isPlaying, volume, currentSong, currentSongIndex, togglePlayPause, setVolume, play, pause, changeSong }}>
      {/* Initial src set here, but useEffect handles changes */}
      <audio ref={audioRef} src={SONG_LIST[currentSongIndex]?.src || ''} loop={false} />
      {children}
    </AudioContext.Provider>
  );
};

// useAudio hook remains the same
export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}; 