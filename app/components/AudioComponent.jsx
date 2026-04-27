import React, { useRef, useState } from "react";
import "../styles/style.css";
import { IoIosPause } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import { MdReplay } from "react-icons/md";

const AudioPlayer = ({ audio }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioNotice, setAudioNotice] = useState("");

  const handlePlayPause = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setAudioNotice("");
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setAudioNotice("");
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
        setAudioNotice("Không thể phát audio. Vui lòng kiểm tra mạng và thử lại.");
      }
    }
  };

  const handleReplay = async () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    try {
      await audioRef.current.play();
      setAudioNotice("");
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setAudioNotice("Không thể phát lại audio. Vui lòng kiểm tra mạng.");
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setAudioNotice("");
  };

  return (
    <div className="fixed bottom-5 right-4 z-50">
      {audio ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-100/95 p-3 shadow-lg backdrop-blur">
          <audio
            ref={audioRef}
            onEnded={handleEnded}
            onWaiting={() =>
              setAudioNotice("Mạng đang yếu, audio đang tải thêm...")
            }
            onStalled={() =>
              setAudioNotice("Kết nối không ổn định. Thử chờ một chút hoặc phát lại.")
            }
            onCanPlay={() => setAudioNotice("")}
            onPlaying={() => setAudioNotice("")}
            onError={() =>
              setAudioNotice("Không tải được audio. Vui lòng thử lại sau.")
            }
          >
            <source src={audio} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
          <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
            AUDIO
          </p>
          {audioNotice ? (
            <p className="mb-2 max-w-64 text-xs text-amber-700">{audioNotice}</p>
          ) : null}
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
