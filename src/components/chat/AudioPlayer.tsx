import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  isUser: boolean;
  darkMode?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, isUser, darkMode = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
      };

      const setAudioTime = () => setCurrentTime(audio.currentTime);

      audio.addEventListener('loadeddata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('ended', () => setIsPlaying(false));

      return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 w-64`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button onClick={togglePlayPause} className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-white text-blue-600' : (darkMode ? 'bg-gray-500 text-white' : 'bg-gray-600 text-white')}`}>
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="flex-1 flex items-center gap-2">
        <div className="w-full h-1.5 rounded-full bg-opacity-30" style={{ backgroundColor: isUser ? 'rgba(255,255,255,0.3)' : (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: isUser ? 'white' : (darkMode ? '#60a5fa' : '#3b82f6') }} />
        </div>
        <span className={`text-xs w-10 text-right ${isUser ? 'text-white' : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>
          {formatTime(currentTime)}
        </span>
      </div>
    </div>
  );
};
