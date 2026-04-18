import React, { useRef, useState } from "react";
import "../styles/style.css";
import { IoIosPause } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import { MdReplay } from "react-icons/md";

const AudioPlayer = ({ audio }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="fixed bottom-5 right-4 z-50">
      {audio ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-100/95 p-3 shadow-lg backdrop-blur">
          <audio ref={audioRef} onEnded={handleEnded}>
            <source src={audio} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
          <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
            AUDIO
          </p>
          <div className="flex items-center gap-2">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-white transition hover:bg-slate-700"
              onClick={handlePlayPause}
              title={isPlaying ? "Tạm dừng" : "Phát"}
            >
              {isPlaying ? <IoIosPause className="text-2xl" /> : <FaPlay className="ml-0.5 text-sm" />}
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              onClick={handleReplay}
              title="Phát lại từ đầu"
            >
              <MdReplay className="text-2xl" />
            </button>
          </div>
        </div>
      ) : (
        <p>No audio available</p>
      )}
    </div>
  );
};

export default AudioPlayer;
