import React, { useState, useRef, useEffect } from 'react';
import { Upload, Sparkles, Download, Image as ImageIcon, Type as TypeIcon, RefreshCw, Trash2 } from 'lucide-react';
import { generateMemeCaptions } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TEMPLATES = [
  { id: 'distracted', name: 'Distracted Boyfriend', url: 'https://picsum.photos/seed/distracted/800/600' },
  { id: 'drake', name: 'Drake Hotline Bling', url: 'https://picsum.photos/seed/drake/800/600' },
  { id: 'cat', name: 'Woman Yelling at Cat', url: 'https://picsum.photos/seed/cat/800/600' },
  { id: 'fine', name: 'This is Fine', url: 'https://picsum.photos/seed/fine/800/600' },
  { id: 'success', name: 'Success Kid', url: 'https://picsum.photos/seed/success/800/600' },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState('#ffffff');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draw meme whenever inputs change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      // Set canvas size to match image aspect ratio but keep reasonable max dimensions
      const maxWidth = 800;
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Text styling
      ctx.fillStyle = textColor;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = fontSize / 10;
      ctx.textAlign = 'center';
      ctx.font = `bold ${fontSize}px Impact, sans-serif`;
      ctx.textBaseline = 'top';

      // Draw Top Text
      if (topText) {
        const x = canvas.width / 2;
        const y = 20;
        ctx.strokeText(topText.toUpperCase(), x, y);
        ctx.fillText(topText.toUpperCase(), x, y);
      }

      // Draw Bottom Text
      ctx.textBaseline = 'bottom';
      if (bottomText) {
        const x = canvas.width / 2;
        const y = canvas.height - 20;
        ctx.strokeText(bottomText.toUpperCase(), x, y);
        ctx.fillText(bottomText.toUpperCase(), x, y);
      }
    };
  }, [image, topText, bottomText, fontSize, textColor]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setSuggestions([]); // Clear suggestions for new image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMagicCaption = async () => {
    if (!image) return;
    setIsGenerating(true);
    try {
      const mimeType = image.split(';')[0].split(':')[1] || 'image/png';
      const newSuggestions = await generateMemeCaptions(image, mimeType);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'ai-meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-2">
            AI Meme <span className="text-[#FF6321]">Magic</span>
          </h1>
          <p className="text-lg opacity-60 font-medium uppercase tracking-widest">Create chaos with Gemini 3.1 Pro</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-[#FF6321] transition-colors"
          >
            <Upload size={20} />
            Upload Image
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Canvas & Templates */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-xl border-2 border-black overflow-hidden flex items-center justify-center min-h-[400px]">
            {image ? (
              <canvas 
                ref={canvasRef} 
                className="max-w-full h-auto rounded-xl shadow-inner cursor-crosshair"
              />
            ) : (
              <div className="text-center space-y-4 opacity-40">
                <ImageIcon size={64} className="mx-auto" />
                <p className="text-xl font-bold uppercase italic">Select a template or upload your own</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Trending Templates</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setImage(t.url)}
                  className={cn(
                    "flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105",
                    image === t.url ? "border-[#FF6321] scale-105 ring-4 ring-[#FF6321]/20" : "border-black/10"
                  )}
                >
                  <img src={t.url} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Controls & AI */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Section */}
          <div className="bg-[#FF6321] p-6 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black uppercase italic text-white flex items-center gap-2">
                <Sparkles /> Magic Caption
              </h2>
              <button 
                onClick={handleMagicCaption}
                disabled={!image || isGenerating}
                className={cn(
                  "bg-white text-black p-2 rounded-full hover:rotate-180 transition-transform duration-500 disabled:opacity-50",
                  isGenerating && "animate-spin"
                )}
              >
                <RefreshCw size={24} />
              </button>
            </div>
            
            <div className="space-y-2">
              {!image ? (
                <p className="text-white/80 font-medium text-sm italic">Upload an image to unlock AI magic...</p>
              ) : isGenerating ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-white/20 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="grid gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setBottomText(s)}
                      className="bg-white/10 hover:bg-white/20 text-white text-left p-3 rounded-xl font-bold text-sm transition-colors border border-white/20"
                    >
                      "{s}"
                    </button>
                  ))}
                </div>
              ) : (
                <button 
                  onClick={handleMagicCaption}
                  disabled={!image}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic hover:bg-black hover:text-white transition-all disabled:opacity-50"
                >
                  Analyze & Suggest
                </button>
              )}
            </div>
          </div>

          {/* Manual Controls */}
          <div className="bg-white p-6 rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <TypeIcon size={14} /> Top Text
                </label>
                <input 
                  type="text" 
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="ENTER TOP TEXT"
                  className="w-full bg-[#F5F5F0] border-2 border-black p-3 rounded-xl font-bold uppercase focus:outline-none focus:ring-2 ring-[#FF6321]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                  <TypeIcon size={14} /> Bottom Text
                </label>
                <input 
                  type="text" 
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="ENTER BOTTOM TEXT"
                  className="w-full bg-[#F5F5F0] border-2 border-black p-3 rounded-xl font-bold uppercase focus:outline-none focus:ring-2 ring-[#FF6321]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Font Size</label>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-[#FF6321]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Color</label>
                <div className="flex gap-2">
                  {['#ffffff', '#000000', '#FF6321', '#00FF00'].map(c => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 border-black transition-transform hover:scale-110",
                        textColor === c && "scale-125 ring-2 ring-black ring-offset-2"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button 
                onClick={downloadMeme}
                disabled={!image}
                className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-2 hover:bg-[#FF6321] transition-all disabled:opacity-50"
              >
                <Download size={20} /> Download
              </button>
              <button 
                onClick={() => {
                  setImage(null);
                  setTopText('');
                  setBottomText('');
                  setSuggestions([]);
                }}
                className="bg-[#F5F5F0] text-black p-4 rounded-2xl border-2 border-black hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t border-black/10 flex justify-between items-center text-xs font-bold uppercase tracking-widest opacity-40">
        <p>© 2026 AI MEME MAGIC</p>
        <p>POWERED BY GEMINI 3.1 PRO</p>
      </footer>
    </div>
  );
}
