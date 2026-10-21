'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Camera, Upload, RefreshCw, Send, Eye, ShieldAlert, Zap } from 'lucide-react';

export default function ShabdaMantraApp() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Starfield Mouse Reactive Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 150 }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      size: Math.random() * 1.5,
    }));

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) * 0.0005;
      mouseY = (e.clientY - height / 2) * 0.0005;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.fillStyle = '#05050a';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        star.z -= 0.5 + mouseX * 2;
        if (star.z <= 0) star.z = width;

        const k = 250 / star.z;
        const px = star.x * k + cx + mouseX * 50;
        const py = star.y * k + cy + mouseY * 50;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const pSize = Math.max(0, (1 - star.z / width) * star.size * 2);
          ctx.fillStyle = `rgba(216, 180, 254, ${1 - star.z / width})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setAnalysis('');

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, prompt: prompt || 'Analyze this image in detail using Claude 3.5 Sonnet.' }),
      });

      const data = await response.json();
      if (data.error) {
        setAnalysis(`Error: ${data.error}`);
      } else {
        setAnalysis(data.result);
      }
    } catch (err) {
      setAnalysis('Failed to connect to Claude API server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white flex flex-col items-center justify-start p-4 md:p-8">
      {/* 3D Starfield Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Glassmorphic Container */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
                शब्द मन्त्र
              </h1>
              <p className="text-xs text-purple-300/60">Claude 3.5 Sonnet Vision</p>
            </div>
          </div>
          <Zap className="w-5 h-5 text-amber-400" />
        </div>

        {/* Image Upload Area */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-purple-400" /> Input Image
          </label>
          <div className="relative border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 transition-all">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {image ? (
              <img src={image} alt="Upload preview" className="h-36 object-contain rounded-xl shadow-md" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center py-4">
                <Upload className="w-8 h-8 text-purple-400/80 animate-bounce" />
                <p className="text-xs text-slate-400">Tap or drag image to upload for vision analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Analysis Prompt</label>
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything about the image..."
            className="w-full bg-slate-950/60 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        {/* Action Button */}
        <button 
          onClick={handleAnalyze}
          disabled={loading || !image}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Analyzing with Claude...
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              Decode & Analyze
            </>
          )}
        </button>

        {/* Analysis Output Box */}
        {analysis && (
          <div className="flex flex-col gap-2 bg-slate-950/80 border border-purple-500/20 rounded-2xl p-4 max-h-60 overflow-y-auto">
            <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Vision Result</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{analysis}</p>
          </div>
        )}

      </div>
    </main>
  );
}
