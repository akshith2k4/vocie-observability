'use client';

import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  return (
    <div className="compact-audio-player w-full mt-2 text-xs">
      <H5AudioPlayer
        src={src}
        layout="horizontal"
        showJumpControls={false}
        customAdditionalControls={[]}
        customVolumeControls={[]}
        className="rounded-lg border border-slate-200 bg-white text-slate-700"
      />
    </div>
  );
}