'use client';

import * as React from 'react';
import { FileUp, X, Loader2, FileIcon, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MultiFileUploaderProps {
  files: File[];
  existingUrls?: string[];
  onFilesChange: (files: File[]) => void;
  onExistingRemove?: (url: string) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
  label?: string;
}

export function MultiFileUploader({
  files,
  existingUrls = [],
  onFilesChange,
  onExistingRemove,
  maxFiles = 10,
  accept = 'image/*,application/pdf',
  className,
  label = 'Upload Documents'
}: MultiFileUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = React.useState<string[]>([]);

  // Update previews when files change
  React.useEffect(() => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Cleanup
    return () => {
      newPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

  const onAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (files.length + existingUrls.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    onFilesChange([...files, ...selectedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && <label className="text-xs font-bold uppercase tracking-tight opacity-70">{label}</label>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {/* Existing Uploaded Files */}
        {existingUrls.map((url, idx) => (
          <div key={`existing-${idx}`} className="group relative aspect-square rounded-lg border bg-muted/5 overflow-hidden flex flex-col items-center justify-center p-2 border-primary/20 hover:border-primary/40 transition-all">
            {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
              <img src={url} alt="Uploaded" className="object-cover w-full h-full rounded" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <FileIcon className="h-8 w-8 text-primary/40" />
                <span className="text-[8px] uppercase font-bold opacity-40 truncate px-1 w-full text-center">Uploaded Doc</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onExistingRemove?.(url)}
              className="absolute top-1 right-1 p-1 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute inset-0 bg-primary/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}

        {/* New Queued Files */}
        {files.map((file, idx) => (
          <div key={`new-${idx}`} className="group relative aspect-square rounded-lg border bg-primary/5 border-primary/30 overflow-hidden flex flex-col items-center justify-center p-2 transition-all">
            {file.type.startsWith('image/') ? (
              <img src={previews[idx]} alt="Queued" className="object-cover w-full h-full rounded" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <FileIcon className="h-8 w-8 text-primary/60" />
                <span className="text-[8px] uppercase font-bold text-primary/60 truncate px-1 w-full text-center">{file.name}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => removeNewFile(idx)}
              className="absolute top-1 right-1 p-1 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="absolute top-0 left-0 bg-primary text-primary-foreground text-[7px] px-1 font-bold uppercase">Pending</div>
          </div>
        ))}

        {/* Add Button */}
        {files.length + existingUrls.length < maxFiles && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/40 border-muted-foreground/20"
          >
            <FileUp className="h-6 w-6 text-muted-foreground/60" />
            <span className="text-[10px] font-bold uppercase opacity-40">Add File</span>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={onAddFiles}
        accept={accept}
      />

      <p className="text-[10px] text-muted-foreground italic">
        * Files will be saved when you submit the form. Max {maxFiles} files allowed.
      </p>
    </div>
  );
}
