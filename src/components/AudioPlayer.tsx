import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  url?: string;
  arabicText?: string;
  urduTranslation?: string;
  englishTranslation?: string;
}

export const AudioPlayer = ({ url, arabicText, urduTranslation, englishTranslation }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);

  const audioSrc = url || ttsUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, [audioSrc]);

  const generateTTS = async () => {
    if (!arabicText) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: arabicText,
            urduTranslation: urduTranslation || undefined,
            englishTranslation: englishTranslation || undefined,
          }),
        }
      );

      if (!response.ok) {
        let msg = 'Could not generate audio recitation.';
        try {
          const err = await response.json();
          if (err?.error) msg = err.error;
        } catch { /* use default */ }
        toast({ title: 'Audio Error', description: msg, variant: 'destructive' });
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setTtsUrl(blobUrl);

      // Wait for audio element to load the new source
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.play();
          setPlaying(true);
        }
      }, 100);
    } catch (e) {
      toast({ title: 'Audio Error', description: 'Network error generating audio.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggle = async () => {
    if (!audioSrc && arabicText) {
      await generateTTS();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
    setPlaying(!playing);
  };

  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = (value[0] / 100) * audio.duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-3 flex items-center gap-2 sm:gap-3 rounded-lg bg-primary/5 px-3 sm:px-4 py-2">
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" />}
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggle} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Volume2 className="hidden sm:block h-4 w-4 shrink-0 text-muted-foreground" />
      <Slider
        value={[progress]}
        onValueChange={seek}
        max={100}
        step={0.1}
        className="flex-1"
      />
      <span className="hidden sm:inline min-w-[4rem] text-xs text-muted-foreground tabular-nums">
        {fmt(currentTime)} / {fmt(duration || 0)}
      </span>
    </div>
  );
};
