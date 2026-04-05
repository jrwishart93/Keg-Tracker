"use client";

export function PrintStickerButton({ disabled = false }: { disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => window.print()}
      className="min-h-12 rounded-xl bg-[#131E29] px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      Print Sticker
    </button>
  );
}
