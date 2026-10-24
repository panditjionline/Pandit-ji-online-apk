import React, { useState, useEffect } from 'react';
import { SPIRITUAL_TRACKS } from '../data/mockData';
import { vedicAudio } from '../utils/audioSynthesizer';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Volume2,
  VolumeX,
  Bell,
  ChevronDown,
  ChevronUp,
  Disc,
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
  const { tr, language, localizeVedicText } = useLanguage();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [vocalEnabled, setVocalEnabled] = useState(vedicAudio.isVocalEnabled());
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(() =>
    vedicAudio.getActiveSpeechId()
  );

  useEffect(() => {
    const unsubSpeech = vedicAudio.subscribeSpeech((id) => {
      setActiveSpeechId(id);
    });
    return unsubSpeech;
  }, []);

  const track = SPIRITUAL_TRACKS[currentTrackIndex];
  const speechIdForTrack = `spiritual-player-track-${track.id}`;

  const handlePlayPause = () => {
    onToggleGlobal(track.toneFrequency, track.sanskritLyrics || track.shortMantra);
  };

  const handleSelectTrack = (idx: number) => {
    setCurrentTrackIndex(idx);
    const selected = SPIRITUAL_TRACKS[idx];
    const textToChant = selected.sanskritLyrics || selected.shortMantra;
    if (isGlobalPlaying) {
      vedicAudio.playTrack(selected.toneFrequency, textToChant);
    } else {
      onToggleGlobal(selected.toneFrequency, textToChant);
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

  const handleSpeakCurrentMantraAloud = () => {
    if (activeSpeechId !== speechIdForTrack) {
      vedicAudio.playTempleBell(0.6);
    }
    vedicAudio.toggleSpeakText(
      `${track.hindiTitle}। ${track.sanskritLyrics}। अर्थ: ${track.meaning}`,
      speechIdForTrack
    );
  };

  const displayTrackTitle =
    language === 'en' || language === 'hinglish' ? track.title : track.hindiTitle;

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-[#181109] to-slate-900 border border-amber-600/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Player Header / Compact Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handlePlayPause}
            className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex-shrink-0 relative cursor-pointer hover:bg-amber-500/30 transition-colors"
            title={
              isGlobalPlaying
                ? tr('मंत्र ध्वनि रोकें', 'Pause Mantra Audio')
                : tr('मंत्र ध्वनि चलाएं', 'Play Mantra Audio')
            }
          >
            <Music className={`w-5 h-5 text-amber-400 ${isGlobalPlaying ? 'animate-pulse' : ''}`} />
            {isGlobalPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                {tr('वैदिक मंत्र ध्वनि एवं तानपुरा', 'Vedic Mantra Audio & Tanpura')}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 font-mono">
                {track.toneFrequency} Hz
              </span>
              {(isGlobalPlaying || activeSpeechId === speechIdForTrack) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  {tr('● ध्वनि चालू है', '● Playing Now')}
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-bold text-amber-100 truncate">
              {displayTrackTitle}
            </h4>
            <p className="text-xs text-amber-300/75 truncate">
              {localizeVedicText(track.deity || '')} • {localizeVedicText(track.category || '')}
            </p>
          </div>
        </div>

        {/* Playback Controls + Temple Sound Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Ring Temple Bell */}
          <button
            type="button"
            onClick={() => vedicAudio.playTempleBell(0.8)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border border-amber-600/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            title={tr('मंदिर की घंटी बजाएं', 'Ring Temple Bell')}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{tr('घंटी', 'Bell')}</span>
          </button>

          {/* Blow Shankh */}
          <button
            type="button"
            onClick={() => vedicAudio.playShankh()}
            className="px-2.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/70 text-amber-200 border border-amber-600/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
            title={tr('मंगल शंख ध्वनि बजाएं', 'Blow Sacred Shankh')}
          >
            <span>🐚</span>
            <span className="hidden md:inline">{tr('शंख', 'Shankh')}</span>
          </button>

          {/* Toggle Vocal Chanting */}
          <button
            type="button"
            onClick={handleToggleVocal}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
              vocalEnabled
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
            title={tr('मंत्र स्वर उच्चारण चालू/बंद करें', 'Toggle Vocal Mantra Chanting')}
          >
            {vocalEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {vocalEnabled ? tr('स्वर: चालू', 'Vocal: On') : tr('केवल धुन', 'Drone Only')}
            </span>
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-lg text-slate-300 hover:text-amber-200 hover:bg-amber-900/30 transition-colors cursor-pointer"
            title={tr('पिछला मंत्र', 'Previous Mantra')}
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePlayPause}
            className={`px-4 py-2.5 rounded-xl font-bold shadow-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm ${
              isGlobalPlaying
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-600/30'
                : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 shadow-amber-600/30'
            }`}
            title={isGlobalPlaying ? tr('मंत्र रोकें', 'Pause Mantra') : tr('मंत्र चलाएं', 'Play Mantra')}
          >
            {isGlobalPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>{tr('ध्वनि रोकें', 'Stop Audio')}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{tr('मंत्र व तानपुरा सुनें', 'Play Mantra & Tanpura')}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-lg text-slate-300 hover:text-amber-200 hover:bg-amber-900/30 transition-colors cursor-pointer"
            title={tr('अगला मंत्र', 'Next Mantra')}
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {onOpenMantraJaap && (
            <button
              type="button"
              onClick={onOpenMantraJaap}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Disc className="w-3.5 h-3.5 text-amber-400" />
              <span>{tr('108 जप काउंटर', '108 Jaap Counter')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 transition-colors cursor-pointer"
            title={tr('सभी मंत्र एवं अर्थ देखें', 'View All Mantras & Meaning')}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Sloka, Meaning & All 12 Mantras Selector */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-amber-900/40 text-sm animate-fadeIn space-y-3">
          <div
            onClick={handleSpeakCurrentMantraAloud}
            className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-amber-800/40 hover:border-amber-500/60 text-center cursor-pointer transition-all"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 mb-1.5">
              <span className="text-[11px] text-amber-400 font-semibold">
                {tr('✨ मूल संस्कृत मंत्र एवं अर्थ', '✨ Original Sanskrit Mantra & Meaning')}
              </span>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                  activeSpeechId === speechIdForTrack
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                }`}
              >
                {activeSpeechId === speechIdForTrack ? (
                  <>
                    <VolumeX className="w-3 h-3" />
                    <span>{tr('मंत्र व अर्थ सुनाया जा रहा है (रोकें)', 'Playing Mantra & Meaning (Stop)')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-yellow-400" />
                    <span>{tr('मंत्र व अर्थ आवाज़ में सुनें', 'Listen to Mantra & Meaning')}</span>
                  </>
                )}
              </span>
            </div>
            <p className="font-serif text-amber-100 text-base sm:text-lg leading-relaxed tracking-wide font-bold">
              {track.sanskritLyrics}
            </p>
            <p className="text-xs text-amber-200/80 mt-2">
              <span className="font-semibold text-amber-400">{tr('भावार्थ: ', 'Meaning: ')}</span>
              {track.meaning}
            </p>
          </div>

          {/* Quick Track Selection Pills for all 12 Mantras */}
          <div>
            <span className="text-[11px] text-amber-300/80 font-semibold block mb-1.5">
              {tr(
                `🎵 सुनने के लिए मंत्र चुनें (${SPIRITUAL_TRACKS.length} सिद्ध वैदिक मंत्र):`,
                `🎵 Select Sacred Mantra (${SPIRITUAL_TRACKS.length} Vedic Mantras):`
              )}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SPIRITUAL_TRACKS.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTrack(idx)}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTrackIndex === idx
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-900/80 text-slate-300 border border-amber-900/40 hover:bg-amber-900/40 hover:text-amber-200'
                  }`}
                >
                  <span>{currentTrackIndex === idx && isGlobalPlaying ? '🔊' : '🕉️'}</span>
                  <span>
                    {(language === 'en' || language === 'hinglish' ? t.title : t.hindiTitle).split(' (')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
