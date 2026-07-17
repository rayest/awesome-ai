'use client'

import { useRef, useState } from 'react'

export function PodcastPlayer({ title, audioUrl }: { title: string; audioUrl: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const toggle = async () => {
    if (!audioUrl || !audioRef.current) return
    if (audioRef.current.paused) { await audioRef.current.play(); setPlaying(true) } else { audioRef.current.pause(); setPlaying(false) }
  }
  const changeSpeed = (value: number) => { setSpeed(value); if (audioRef.current) audioRef.current.playbackRate = value }
  return <div className="podcast-player"><button type="button" className="play-button" onClick={toggle} disabled={!audioUrl} aria-label={playing ? '暂停' : '播放'}>{playing ? <span className="pause-icon" /> : <span className="play-icon" />}</button><div className="player-copy"><strong>{title}</strong><span>{audioUrl ? '点击播放本期节目' : '音频将在管理端上传后开放'}</span></div><label>倍速<select value={speed} onChange={(event) => changeSpeed(Number(event.target.value))} disabled={!audioUrl}>{[0.75, 1, 1.25, 1.5, 2].map((value) => <option value={value} key={value}>{value}×</option>)}</select></label>{audioUrl ? <audio ref={audioRef} src={audioUrl} preload="metadata" onEnded={() => setPlaying(false)} /> : null}</div>
}
