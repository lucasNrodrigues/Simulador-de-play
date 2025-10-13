'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  url: string;
  cover: string;
}

export default function AudioSimulator() {
  const [playlist, setPlaylist] = useState<Track[]>([
    {
      id: 1,
      title: "Sweet child o' mine",
      artist: "guns n roses",
      duration: 0,
      url: "/musica.mp3",
      cover: "/imagem.png"
    },
    {
      id: 2,
      title: "Era Eu",
      artist: "Felipe Rodrigues",
      duration: 0,
      url: "/musica2.mp3",
      cover: "/imagem2.png"
    },
    {
      id: 3,
      title: "Interstellar X Experience",
      artist: "Tony Ann",
      duration: 0,
      url: "/musica3.mp3",
      cover: "/imagem3.png"
    }
  ]);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playlist[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    
    const handleLoadedMetadata = () => {
      const updatedPlaylist = [...playlist];
      updatedPlaylist[currentTrackIndex].duration = audio.duration;
      setPlaylist(updatedPlaylist);
    };
    
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all' || currentTrackIndex < playlist.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, repeatMode, playlist]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    if (isShuffleOn) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    }
    setCurrentTime(0);
    if (isPlaying && audioRef.current) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
    } else {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      setCurrentTime(0);
      if (isPlaying && audioRef.current) {
        setTimeout(() => audioRef.current?.play(), 100);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
  };

  const cycleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    if (isPlaying && audioRef.current) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800">
          <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-4">
            <h1 className="text-2xl font-bold text-white mb-1">Simulador de Áudio</h1>
            <p className="text-zinc-400 text-sm">Seu player de música completo</p>
          </div>

          <div className="p-6">
            <div className="bg-zinc-800/50 rounded-xl p-6 mb-4 border border-zinc-700">
              <div className="w-32 h-32 mx-auto mb-4 bg-zinc-700 rounded-xl flex items-center justify-center shadow-xl overflow-hidden">
                <img 
                  src={currentTrack.cover} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white mb-1">{currentTrack.title}</h2>
                <p className="text-zinc-400 text-sm">{currentTrack.artist}</p>
              </div>

              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={currentTrack.duration || 1}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${currentTrack.duration ? (currentTime / currentTrack.duration) * 100 : 0}%, #3f3f46 ${currentTrack.duration ? (currentTime / currentTrack.duration) * 100 : 0}%, #3f3f46 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-zinc-400 mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{currentTrack.duration ? formatTime(currentTrack.duration) : 'Carregando...'}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mb-4">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 rounded-full transition-all ${
                    isShuffleOn ? 'bg-white text-black' : 'bg-zinc-700 text-white hover:bg-zinc-600'
                  }`}
                  aria-label="Shuffle"
                >
                  <Shuffle size={16} />
                </button>
                
                <button
                  onClick={handlePrevious}
                  className="p-3 bg-zinc-700 text-white rounded-full hover:bg-zinc-600 transition-all"
                  aria-label="Previous"
                >
                  <SkipBack size={20} />
                </button>
                
                <button
                  onClick={togglePlayPause}
                  className="p-4 bg-white text-black rounded-full hover:scale-105 transition-all shadow-lg"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                
                <button
                  onClick={handleNext}
                  className="p-3 bg-zinc-700 text-white rounded-full hover:bg-zinc-600 transition-all"
                  aria-label="Next"
                >
                  <SkipForward size={20} />
                </button>
                
                <button
                  onClick={cycleRepeat}
                  className={`p-2 rounded-full transition-all relative ${
                    repeatMode !== 'off' ? 'bg-white text-black' : 'bg-zinc-700 text-white hover:bg-zinc-600'
                  }`}
                  aria-label="Repeat"
                >
                  <Repeat size={16} />
                  {repeatMode === 'one' && (
                    <span className="absolute -top-1 -right-1 text-xs bg-zinc-900 text-white rounded-full w-4 h-4 flex items-center justify-center">1</span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={toggleMute} className="text-white hover:text-zinc-300 transition-colors" aria-label="Mute">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${isMuted ? 0 : volume}%, #3f3f46 ${isMuted ? 0 : volume}%, #3f3f46 100%)`
                  }}
                />
                <span className="text-white text-xs w-10 text-right">{isMuted ? 0 : volume}%</span>
              </div>
            </div>

            <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-700">
              <h3 className="text-lg font-bold text-white mb-3">Playlist</h3>
              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      index === currentTrackIndex
                        ? 'bg-white text-black'
                        : 'bg-zinc-800/50 text-white hover:bg-zinc-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-700 flex-shrink-0">
                          <img 
                            src={track.cover} 
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{track.title}</div>
                          <div className={`text-xs ${index === currentTrackIndex ? 'text-zinc-700' : 'text-zinc-400'}`}>
                            {track.artist}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs ${index === currentTrackIndex ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        {track.duration ? formatTime(track.duration) : '--:--'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <audio ref={audioRef} src={currentTrack.url} />

        <style jsx>{`
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          }
        `}</style>
      </div>
    </div>
  );
}