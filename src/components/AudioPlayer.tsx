import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  url: string;
}

export const AudioPlayer = ({ url }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

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
  }, []);

  const toggle = () => {
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
    <div className="mt-3 flex items-center gap-3 rounded-lg bg-primary/5 px-4 py-2">
      <audio ref={audioRef} src={url} preload="metadata" />
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggle}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Slider
        value={[progress]}
        onValueChange={seek}
        max={100}
        step={0.1}
        className="flex-1"
      />
      <span className="min-w-[4rem] text-xs text-muted-foreground tabular-nums">
        {fmt(currentTime)} / {fmt(duration || 0)}
      </span>
    </div>
  );
};
