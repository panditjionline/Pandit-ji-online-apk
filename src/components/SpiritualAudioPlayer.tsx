import React, { useState } from 'react';
import { SPIRITUAL_TRACKS } from '../data/mockData';
import { vedicAudio } from '../utils/audioSynthesizer';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Disc
} from 'lucide-react';

interface SpiritualAudioPlayerProps {
  isGlobalPlaying: boolean;
  onToggleGlobal: (freq?: number, mantraText?: string) => void;
  onOpenMantraJaap?: () => void;
}

export const SpiritualAudioPlayer: React.FC<SpiritualAudioPlayerProps> = ({
  isGlobalPlaying,
  onToggleGlobal,
  onOpenMantraJaap,
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [vocalEnabled, setVocalEnabled] = useState(vedicAudio.isVocalEnabled());
  const track = SPIRITUAL_TRACKS[currentTrackIndex];

  const handlePlayPause = () => {
    onToggleGlobal(track.toneFrequency, track.shortMantra || track.sanskritLyrics);
  };

  const handleSelectTrack = (idx: number) => {
    setCurrentTrackIndex(idx);
    const selected = SPIRITUAL_TRACKS[idx];
    if (isGlobalPlaying) {
      vedicAudio.playTrack(selected.toneFrequency, selected.shortMantra || selected.sanskritLyrics);
    } else {
      onToggleGlobal(selected.toneFrequency, selected.shortMantra || selected.sanskritLyrics);
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % SPIRITUAL_TRACKS.length;
    handleSelectTrack(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + SPIRITUAL_TRACKS.length) % SPIRITUAL_TRACKS.length;
    handleSelectTrack(prevIdx);
  };

  const handleToggleVocal = () => {
    const nextState = !vocalEnabled;
    setVocalEnabled(nextState);
    vedicAudio.setVocalEnabled(nextState);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-[#181109] to-slate-900 border border-amber-600/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Player Header / Compact Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handlePlayPause}
            className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex-shrink-0 relative cursor-pointer hover:bg-amber-500/30 transition-colors"
            title={isGlobalPlaying ? 'मंत्र ध्वनि रोकें' : 'मंत्र ध्वनि चलाएं'}
          >
            <Music className={`w-5 h-5 text-amber-400 ${isGlobalPlaying ? 'animate-pulse' : ''}`} />
            {isGlobalPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                वैदिक मंत्र ध्वनि एवं तानपुरा
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 font-mono">
                {track.toneFrequency} Hz
              </span>
              {isGlobalPlaying && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  ● ध्वनि चालू है
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-amber-100 truncate">
              {track.hindiTitle}
            </h4>
            <p className="text-xs text-amber-300/75 truncate">{track.deity} • {track.category}</p>
          </div>
        </div>

        {/* Playback Controls + Temple Sound Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Ring Temple Bell */}
          <button
            onClick={() => vedicAudio.playTempleBell(0.75)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border border-amber-600/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            title="मंदिर की घंटी बजाएं"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">घंटी</span>
          </button>

          {/* Blow Shankh */}
          <button
            onClick={() => vedicAudio.playShankh()}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border border-amber-600/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            title="मंगल शंख ध्वनि बजाएं"
          >
            <span>🐚</span>
            <span className="hidden md:inline">शंख</span>
          </button>

          {/* Toggle Vocal Chanting */}
          <button
            onClick={handleToggleVocal}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              vocalEnabled
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
            title="मंत्र स्वर उच्चारण चालू/बंद करें"
          >
            {vocalEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{vocalEnabled ? 'स्वर: चालू' : 'केवल धुन'}</span>
          </button>

          <button
            onClick={handlePrev}
            className="p-2 rounded-lg text-slate-300 hover:text-amber-200 hover:bg-amber-900/30 transition-colors cursor-pointer"
            title="पिछला मंत्र"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold hover:from-amber-500 hover:to-yellow-400 shadow-lg shadow-amber-600/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm"
            title={isGlobalPlaying ? 'मंत्र रोकें' : 'मंत्र चलाएं'}
          >
            {isGlobalPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>रोकें</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>मंत्र सुनें</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-lg text-slate-300 hover:text-amber-200 hover:bg-amber-900/30 transition-colors cursor-pointer"
            title="अगला मंत्र"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {onOpenMantraJaap && (
            <button
              onClick={onOpenMantraJaap}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Disc className="w-3.5 h-3.5 text-amber-400" />
              <span>108 जप काउंटर</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 transition-colors cursor-pointer"
            title="सभी मंत्र एवं अर्थ देखें"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Sloka, Meaning & All 12 Mantras Selector */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-amber-900/40 text-sm animate-fadeIn space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-800/40 text-center">
            <span className="text-[11px] text-amber-400 font-semibold block mb-1">
              ✨ मूल संस्कृत मंत्र (क्लिक करके सुनें व जप करें)
            </span>
            <p className="font-serif text-amber-100 text-base sm:text-lg leading-relaxed tracking-wide font-bold">
              {track.sanskritLyrics}
            </p>
            <p className="text-xs text-amber-200/80 mt-2">
              <span className="font-semibold text-amber-400">भावार्थ: </span>
              {track.meaning}
            </p>
          </div>

          {/* Quick Track Selection Pills for all 12 Mantras */}
          <div>
            <span className="text-[11px] text-amber-300/80 font-semibold block mb-1.5">
              🎵 सुनने के लिए मंत्र चुनें ({SPIRITUAL_TRACKS.length} सिद्ध वैदिक मंत्र):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SPIRITUAL_TRACKS.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTrack(idx)}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTrackIndex === idx
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900/80 text-slate-300 border border-amber-900/40 hover:bg-amber-900/40 hover:text-amber-200'
                  }`}
                >
                  <span>{currentTrackIndex === idx && isGlobalPlaying ? '🔊' : '🕉️'}</span>
                  <span>{t.hindiTitle.split(' (')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
