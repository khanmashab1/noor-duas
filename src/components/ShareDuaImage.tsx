import { useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { Dua } from '@/hooks/useDuas';

interface ShareDuaImageProps {
  dua: Dua;
  onClose: () => void;
}

const TEMPLATES = [
  { id: 'emerald', bg: 'linear-gradient(135deg, #1a5632 0%, #0d3320 50%, #1a5632 100%)', text: '#e8f0e4', accent: '#c9a84c' },
  { id: 'midnight', bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', text: '#e2e8f0', accent: '#f59e0b' },
  { id: 'sand', bg: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 50%, #f5f0e8 100%)', text: '#2d2418', accent: '#8b6914' },
  { id: 'royal', bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)', text: '#e0e7ff', accent: '#a78bfa' },
] as const;

export const ShareDuaImage = ({ dua, onClose }: ShareDuaImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [generating, setGenerating] = useState(false);

  const template = TEMPLATES[selectedTemplate];

  const drawImage = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const [, startColor, , endColor] = template.bg.match(/#[a-f0-9]{6}/gi) || [];
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, startColor || '#1a5632');
    grad.addColorStop(0.5, endColor || '#0d3320');
    grad.addColorStop(1, startColor || '#1a5632');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative border
    ctx.strokeStyle = template.accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.4;
    const m = 50;
    ctx.strokeRect(m, m, W - m * 2, H - m * 2);

    // Corner ornaments
    const ornSize = 40;
    ctx.fillStyle = template.accent;
    [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, ornSize / 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Top decoration – crescent
    ctx.font = '120px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = template.accent;
    ctx.fillText('☪', W / 2, 220);

    // Divider line
    ctx.strokeStyle = template.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(200, 280);
    ctx.lineTo(W - 200, 280);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Arabic text
    ctx.fillStyle = template.text;
    ctx.font = 'bold 52px Amiri, serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    const arabicLines = wrapText(ctx, dua.arabic_text, W - 160, 52);
    let y = 420;
    arabicLines.forEach((line) => {
      ctx.fillText(line, W / 2, y);
      y += 80;
    });

    // Divider
    y += 30;
    ctx.strokeStyle = template.accent;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(300, y);
    ctx.lineTo(W - 300, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    y += 50;

    // English translation
    if (dua.english_translation) {
      ctx.font = 'italic 34px Inter, sans-serif';
      ctx.fillStyle = template.text;
      ctx.globalAlpha = 0.85;
      ctx.direction = 'ltr';
      const engLines = wrapText(ctx, dua.english_translation, W - 180, 34);
      engLines.forEach((line) => {
        ctx.fillText(line, W / 2, y);
        y += 52;
      });
      ctx.globalAlpha = 1;
    }

    // Urdu translation
    if (dua.urdu_translation) {
      y += 30;
      ctx.font = '36px "Noto Nastaliq Urdu", serif';
      ctx.fillStyle = template.text;
      ctx.globalAlpha = 0.85;
      ctx.direction = 'rtl';
      const urduLines = wrapText(ctx, dua.urdu_translation, W - 180, 36);
      urduLines.forEach((line) => {
        ctx.fillText(line, W / 2, y);
        y += 60;
      });
      ctx.globalAlpha = 1;
    }

    // Reference
    if (dua.reference) {
      ctx.font = '28px Inter, sans-serif';
      ctx.fillStyle = template.accent;
      ctx.direction = 'ltr';
      ctx.fillText(`📖 ${dua.reference}`, W / 2, Math.min(y + 60, H - 200));
    }

    // Bottom branding
    ctx.font = 'bold 30px "Playfair Display", serif';
    ctx.fillStyle = template.accent;
    ctx.globalAlpha = 0.7;
    ctx.direction = 'ltr';
    ctx.fillText('🌙 Noor Duas', W / 2, H - 100);
    ctx.globalAlpha = 1;

    // Bottom divider
    ctx.strokeStyle = template.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(200, H - 130);
    ctx.lineTo(W - 200, H - 130);
    ctx.stroke();
    ctx.globalAlpha = 1;

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const maxLines = Math.floor(600 / (fontSize * 1.5));

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        if (lines.length >= maxLines - 1) {
          lines.push(currentLine + '...');
          return lines;
        }
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const blob = await drawImage();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `noor-duas-${dua.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Downloaded!', description: 'Image saved. Share it on your status!' });
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    setGenerating(true);
    try {
      const blob = await drawImage();
      if (!blob) return;
      const file = new File([blob], 'noor-duas.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Noor Duas',
          text: dua.reference || 'Beautiful Dua from Noor Duas',
          files: [file],
        });
      } else {
        // Fallback: download
        handleDownload();
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        toast({ title: 'Share failed', description: 'Try downloading instead.', variant: 'destructive' });
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-xl bg-card p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <h3 className="mb-3 text-center font-display text-lg font-semibold text-foreground">
          Share as Image
        </h3>

        {/* Template Previews */}
        <div className="mb-4 flex justify-center gap-2">
          {TEMPLATES.map((tmpl, i) => (
            <button
              key={tmpl.id}
              onClick={() => setSelectedTemplate(i)}
              className={`h-12 w-12 rounded-lg border-2 transition-all ${
                selectedTemplate === i ? 'border-primary scale-110 shadow-lg' : 'border-border'
              }`}
              style={{ background: tmpl.bg }}
              aria-label={`Template ${tmpl.id}`}
            />
          ))}
        </div>

        {/* Preview Card */}
        <div
          className="mx-auto mb-4 aspect-[9/16] w-full max-w-[240px] rounded-lg overflow-hidden shadow-lg"
          style={{ background: template.bg }}
        >
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <span className="text-3xl mb-2" style={{ color: template.accent }}>☪</span>
            <p
              className="font-arabic text-sm leading-relaxed mb-2 line-clamp-4"
              style={{ color: template.text }}
              dir="rtl"
            >
              {dua.arabic_text}
            </p>
            {dua.english_translation && (
              <p
                className="text-[10px] italic leading-snug mb-1 line-clamp-3"
                style={{ color: template.text, opacity: 0.85 }}
              >
                {dua.english_translation}
              </p>
            )}
            {dua.reference && (
              <span className="text-[9px] mt-1" style={{ color: template.accent }}>
                📖 {dua.reference}
              </span>
            )}
            <span className="text-[9px] mt-auto" style={{ color: template.accent, opacity: 0.7 }}>
              🌙 Noor Duas
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex-1" variant="outline" disabled={generating}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button onClick={handleShare} className="flex-1" disabled={generating}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
