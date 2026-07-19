import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Trash2 } from 'react-feather';
import png from '../assets/png-icon.webp';
import jpg from '../assets/jpg-icon.webp';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_TYPES: ReadonlyArray<{ mime: string; ext: string }> = [
  { mime: 'image/png', ext: 'png' },
  { mime: 'image/jpeg', ext: 'jpg' },
];

const ACCEPTED_MIME_SET = new Set(ACCEPTED_TYPES.map((t) => t.mime));

const ICONS: Record<string, string> = {
  png,
  jpg,
  jpeg: jpg,
};

const resolveIcon = (file: File): string => {
  const type = file.type || '';
  if (type.includes('png')) return png;
  if (type.includes('jpg') || type.includes('jpeg')) return jpg;
  const ext = type.split('/')[1];
  return (ext && ICONS[ext]) || '';
};

export interface FileValidationResult {
  accepted: File[];
  rejected: Array<{ file: File; reason: string }>;
}

export const validateFiles = (incoming: File[]): FileValidationResult => {
  const accepted: File[] = [];
  const rejected: Array<{ file: File; reason: string }> = [];
  for (const file of incoming) {
    if (!ACCEPTED_MIME_SET.has(file.type)) {
      rejected.push({ file, reason: 'Tipo de archivo no permitido' });
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      rejected.push({ file, reason: 'Máx. 5 MB' });
      continue;
    }
    accepted.push(file);
  }
  return { accepted, rejected };
};

interface DynamicUploadAreaProps {
  onUpload?: (files: File[]) => void;
  onValidationError?: (rejected: Array<{ file: File; reason: string }>) => void;
}

export interface DynamicUploadAreaHandle {
  reset: () => void;
}

const DynamicUploadArea = forwardRef<DynamicUploadAreaHandle, DynamicUploadAreaProps>(
  ({ onUpload, onValidationError }, ref) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setFiles([]);
        setRejectionMessage(null);
        onUpload?.([]);
      },
    }));

    const addFiles = useCallback(
      (incoming: File[]) => {
        if (!incoming.length) return;
        const { accepted, rejected } = validateFiles(incoming);
        if (rejected.length > 0) {
          setRejectionMessage(rejected[0].reason);
          onValidationError?.(rejected);
        } else {
          setRejectionMessage(null);
        }
        if (!accepted.length) return;
        setFiles((prev) => {
          const next = [...prev, ...accepted];
          onUpload?.(next);
          return next;
        });
      },
      [onUpload, onValidationError],
    );

    const removeFile = useCallback(
      (index: number) => {
        setFiles((prev) => {
          const next = prev.filter((_, i) => i !== index);
          onUpload?.(next);
          return next;
        });
      },
      [onUpload],
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(true);
    };

    const handleDragLeave = () => setDragActive(false);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      addFiles(Array.from(e.dataTransfer?.files ?? []));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(e.target.files ?? []));
      e.target.value = '';
    };

    const triggerFileInput = () => inputRef.current?.click();

    return (
      <div className="w-full mt-4">
        <div
          className={`border-2 ${
            dragActive ? 'border-sgreen bg-green-50' : 'border-dashed border-gray-300'
          } p-6 rounded-lg text-center cursor-pointer transition relative flex flex-col items-center justify-center`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerFileInput();
            }
          }}
          aria-label="Subir imágenes (PNG o JPG, máx. 5 MB)"
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <UploadCloud size={36} className="text-sgreen mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-400">
              <span className="text-sgreen font-medium">Haz clic para subir</span> o arrastra y suelta
              tus imágenes aquí.
            </p>
            <p className="text-xs text-gray-400">PNG o JPG (máx. 5 MB)</p>
          </motion.div>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/png,image/jpeg"
          aria-hidden="true"
          tabIndex={-1}
        />

        {rejectionMessage && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {rejectionMessage}
          </p>
        )}

        <ul className="mt-4 space-y-2">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.li
                key={`${file.name}-${file.size}-${index}`}
                className="flex justify-between items-center bg-gray-50 p-2 border border-gray-300 rounded"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center">
                  <img
                    src={resolveIcon(file)}
                    alt=""
                    className="w-6 h-6 mr-2"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="ml-auto text-red-500 hover:text-red-700 flex items-center"
                  aria-label={`Eliminar ${file.name}`}
                >
                  <Trash2 size={20} className="text-red-500" aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    );
  },
);

DynamicUploadArea.displayName = 'DynamicUploadArea';

export default DynamicUploadArea;