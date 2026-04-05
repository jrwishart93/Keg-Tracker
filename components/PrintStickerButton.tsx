"use client";

export function PrintStickerButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-12 rounded-xl bg-[#131E29] px-5 font-semibold text-white"
    >
      Print Sticker
    </button>
  );
}
