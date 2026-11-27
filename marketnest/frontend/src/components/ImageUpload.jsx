import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";

function FileThumb({ file, onRemove }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return (
    <div className="image-preview">
      {url && <img src={url} alt={file.name} />}
      <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`}>
        <X size={13} />
      </button>
    </div>
  );
}

export default function ImageUpload({ files = [], onChange, max = 8, label = "Add photos", hint = "Select up to 8 images" }) {
  function addFiles(event) {
    const incoming = Array.from(event.target.files || []);
    onChange([...files, ...incoming].slice(0, max));
    event.target.value = "";
  }

  return (
    <div>
      <label className="upload-zone">
        <span className="upload-icon"><ImagePlus size={22} /></span>
        <strong>{label}</strong>
        <span>{hint}</span>
        <input type="file" accept="image/*" multiple onChange={addFiles} />
      </label>
      {files.length > 0 && (
        <div className="image-previews">
          {files.map((file, index) => (
            <FileThumb
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => onChange(files.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
