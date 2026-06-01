import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { UploadDropzone } from "../components/UploadDropzone";
import { api } from "../lib/api";

export default function Analyze() {
  const navigate = useNavigate();
  const [uploadingName, setUploadingName] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: (file: File) => api.upload(file),
    onSuccess: (analysis) => {
      toast.success("Upload complete — processing…");
      navigate(`/results/${analysis.id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Upload failed");
      setUploadingName(null);
    },
  });

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">New analysis</h1>
        <p className="text-muted-fg mt-1">
          Side-on view, full body in frame, steady camera. 5–15 seconds is plenty.
        </p>
      </div>

      {upload.isPending ? (
        <div className="card flex items-center gap-3">
          <Loader2 className="animate-spin text-accent" />
          <div>
            <div className="font-medium">Uploading {uploadingName}</div>
            <div className="text-sm text-muted-fg">
              Hang on — large clips can take a moment.
            </div>
          </div>
        </div>
      ) : (
        <UploadDropzone
          onFile={(file) => {
            setUploadingName(file.name);
            upload.mutate(file);
          }}
        />
      )}

      <div className="text-xs text-muted-fg space-y-1">
        <p><span className="text-fg">Tip.</span> Run on a flat surface with good light.</p>
        <p><span className="text-fg">Tip.</span> Phone at hip height, 5–8 meters away.</p>
        <p><span className="text-fg">Tip.</span> Record 60 fps if possible for cleaner cadence.</p>
      </div>
    </div>
  );
}
