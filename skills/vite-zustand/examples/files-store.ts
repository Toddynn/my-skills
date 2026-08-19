import { create } from "zustand";

interface StoredFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface FilesStore {
  files: StoredFile[];
  addMultipleFiles: (files: File[]) => void;
  removeFileById: (id: string) => void;
  clearAll: () => void;
}

export const useFiles = create<FilesStore>((set, get) => ({
  files: [],
  addMultipleFiles: (incoming) => {
    const next = incoming.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    set({ files: [...get().files, ...next] });
  },
  removeFileById: (id) => {
    const current = get().files;
    const target = current.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    set({ files: current.filter((item) => item.id !== id) });
  },
  clearAll: () => {
    for (const item of get().files) URL.revokeObjectURL(item.previewUrl);
    set({ files: [] });
  },
}));
