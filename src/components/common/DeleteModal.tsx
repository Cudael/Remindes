"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteModalProps {
  show: boolean;
  title?: string;
  message?: string;
  itemName?: string;
  itemDescription?: string;
  itemIcon?: string;
  permanent?: boolean;
  loading?: boolean;
  loadingText?: string;
  requireConfirmation?: boolean;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({
  show,
  title = "Delete Item",
  message,
  itemName,
  itemDescription,
  itemIcon,
  permanent = false,
  loading = false,
  loadingText = "Deleting…",
  requireConfirmation = false,
  closeOnBackdrop = true,
  showCloseButton = true,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (!show) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // Auto-focus confirmation input when opened
  useEffect(() => {
    if (!show || !requireConfirmation) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [show, requireConfirmation]);

  // ESC key handler
  useEffect(() => {
    if (!show) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [show, loading, onCancel]);

  const canConfirm = !requireConfirmation || confirmText === "DELETE";

  if (!show || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeOnBackdrop && !loading ? onCancel : undefined}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-rose-500/20 bg-rose-950/80 backdrop-blur-xl shadow-2xl shadow-rose-900/40">
        {showCloseButton && !loading && (
          <button
            className="absolute right-4 top-4 text-rose-300/60 hover:text-rose-200 transition-colors"
            onClick={onCancel}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500/20 border border-rose-500/30">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <h2
              id="delete-modal-title"
              className="text-xl font-semibold text-rose-50 tracking-tight"
            >
              {title}
            </h2>
          </div>

          {(itemName || itemDescription || itemIcon) && (
            <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 flex items-center gap-3">
              {itemIcon && <span className="text-2xl">{itemIcon}</span>}
              <div className="min-w-0">
                {itemName && (
                  <p className="font-medium text-rose-100 truncate">{itemName}</p>
                )}
                {itemDescription && (
                  <p className="text-sm text-rose-300/70 truncate">{itemDescription}</p>
                )}
              </div>
            </div>
          )}

          {message && (
            <p className="text-sm text-rose-200/80 leading-relaxed">{message}</p>
          )}

          {permanent && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-sm text-rose-300">
              ⚠️ This action is <strong>permanent</strong> and cannot be undone.
            </div>
          )}

          {requireConfirmation && (
            <div className="space-y-2">
              <p className="text-xs text-rose-300/70 uppercase tracking-widest font-bold">
                Type <span className="text-rose-300">DELETE</span> to confirm
              </p>
              <input
                ref={inputRef}
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                aria-label="Type DELETE to confirm"
                disabled={loading}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-rose-100 placeholder:text-rose-300/30 focus:border-rose-400/50 focus:outline-none focus:ring-1 focus:ring-rose-400/30 disabled:opacity-50"
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              disabled={loading}
              onClick={onCancel}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-rose-200 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={!canConfirm || loading}
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingText}
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
