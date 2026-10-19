import React, { useState } from 'react';
import { OFFICIAL_YOUTUBE_VIDEOS } from '../data/mockData';
import { YouTubeVideo } from '../types';
import { Youtube, ExternalLink, Play, Eye, Clock, Sparkles, BookOpen, Flame, Compass, Heart } from 'lucide-react';

export const YouTubeFeed: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVideoModal, setSelectedVideoModal] = useState<YouTubeVideo | null>(null);

  const categories = [
    { id: 'all', label: 'सभी वीडियो (All)', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'puja_vidhi', label: 'पूजा विधि', icon: <Flame className="w-4 h-4" /> },
    { id: 'vrat_tyohar', label: 'व्रत-त्योहार जानकारी', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'jyotish_gyan', label: 'ज्योतिष ज्ञान', icon: <Compass className="w-4 h-4" /> },
    { id: 'pravachan', label: 'अध्यात्म व गोत्र', icon: <Heart className="w-4 h-4" /> },
  ];

  const filteredVideos = activeCategory === 'all'
    ? OFFICIAL_YOUTUBE_VIDEOS
    : OFFICIAL_YOUTUBE_VIDEOS.filter((v) => v.category === activeCategory);

  return (
    <section className="space-y-6">
      {/* YouTube Channel Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/70 via-[#1e1014] to-amber-950/70 border border-red-700/40 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-4 rounded-2xl bg-red-600 text-white shadow-xl shadow-red-600/30 flex-shrink-0">
              <Youtube className="w-8 h-8 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-xl sm:text-2xl font-bold font-vedic text-white">
                  Pandit ji online
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold uppercase">
                  Official Channel
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-200/80 mt-1">
                पण्डित शशांक शर्मा द्वारा प्रमाणित पूजा विधि, व्रत नियम, पंचांग एवं ज्योतिष ज्ञान के नियमित वीडियो।
              </p>
              <div className="text-xs text-amber-300 font-mono mt-1">
                youtube.com/@panditjionlineofficial
              </div>
            </div>
          </div>

          <a
            href="https://youtube.com/@panditjionlineofficial?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Youtube className="w-5 h-5 fill-current" />
            <span>चैनल सब्सक्राइब करें (Subscribe)</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="flex flex-col justify-between bg-gradient-to-b from-[#131b2e] to-[#0c1220] border border-amber-900/30 hover:border-red-600/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl group"
          >
            {/* Custom Vedic Video Thumbnail Placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-amber-950 via-slate-900 to-red-950 flex flex-col justify-between p-4 border-b border-amber-900/20">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {video.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded font-mono">
                  {video.duration}
                </span>
              </div>

              {/* Play Button Overlay */}
              <div className="self-center my-auto">
                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  {video.views}
                </span>
                <span>{video.publishedDate}</span>
              </div>
            </div>

            {/* Video Meta & Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-100 group-hover:text-red-300 transition-colors line-clamp-2">
                  {video.hindiTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                  {video.description}
                </p>

                {/* Key Takeaways */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                    मुख्य सूत्र (Key Takeaways):
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-slate-300">
                    {video.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-amber-500">•</span>
                        <span className="truncate">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold transition-colors"
                >
                  <Youtube className="w-4 h-4 fill-current" />
                  <span>YouTube पर देखें</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <button
                  onClick={() => setSelectedVideoModal(video)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium transition-colors"
                  title="विवरण देखें"
                >
                  विवरण
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Details Modal */}
      {selectedVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1424] border border-amber-600/40 rounded-2xl p-6 relative">
            <h3 className="text-lg font-bold font-vedic text-amber-100">
              {selectedVideoModal.hindiTitle}
            </h3>
            <p className="text-xs text-amber-400/80 mt-1">{selectedVideoModal.title}</p>
            
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              {selectedVideoModal.description}
            </p>

            <div className="mt-4 p-3 bg-amber-950/30 rounded-xl border border-amber-900/40">
              <span className="text-xs font-bold text-amber-300 block mb-2">
                इस वीडियो के मुख्य शास्त्रोक्त बिंदु:
              </span>
              <ul className="space-y-1 text-xs text-amber-100/90">
                {selectedVideoModal.keyTakeaways.map((k, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedVideoModal(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                बंद करें
              </button>
              <a
                href={selectedVideoModal.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                <Youtube className="w-4 h-4 fill-current" />
                <span>YouTube पर पूरा वीडियो देखें</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
