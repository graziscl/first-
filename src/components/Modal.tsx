import type { ReactNode } from "react";
import { IconFechar } from "./icons";

interface ModalProps {
  titulo: string;
  aberto: boolean;
  onFechar: () => void;
  children: ReactNode;
}

export default function Modal({ titulo, aberto, onFechar, children }: ModalProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink-800/40 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-800">{titulo}</h2>
          <button
            onClick={onFechar}
            className="rounded-full p-1.5 text-ink-400 hover:bg-lilac-50 hover:text-ink-700"
            aria-label="Fechar"
          >
            <IconFechar className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
