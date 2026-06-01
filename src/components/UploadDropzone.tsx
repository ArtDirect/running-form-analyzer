import { useCallback, useRef, useState } from "react";
import { Upload, Film } from "lucide-react";
import { cn } from "../lib/utils";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

const ACCEPT = "video/mp4,video/quicktime,video/*";
const MAX_BYTES = 200 * 1024 * 1024; // 200 MB cap, tune to backend

export function UploadDropzone({ onFile, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (file: File | undefined) => {
      setError(null);
      if (!file) return;
      if (!file.type.startsWith("video/")) {
        setError("That doesn't look like a video file.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`File is too large (${(file.size / 1e6).toFixed(0)} MB). Limit is 200 MB.`);
        return;
      }
      onFile(file);
    },
    [onFile],
  );

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          handle(e.dataTransfer.files[0]);
        }}
        className={cn(
          "card flex flex-col items-center justify-center gap-3 py-12 cursor-pointer text-center transition",
          dragging && "border-accent bg-surface-2",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="size-12 rounded-full bg-surface-2 grid place-items-center">
          {dragging ? <Film className="text-accent" /> : <Upload className="text-muted-fg" />}
        </div>
        <div>
          <div className="font-medium text-fg">
            {dragging ? "Drop the clip" : "Drop your iPhone clip or tap to pick"}
          </div>
          <div className="text-sm text-muted-fg mt-1">
            MP4 or MOV, up to 200 MB. Side-on view works best.
          </div>
        </div>
        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
