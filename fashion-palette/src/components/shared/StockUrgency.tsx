interface StockUrgencyProps {
  stock: number;
  threshold?: number;
}

export default function StockUrgency({
  stock,
  threshold = 5,
}: StockUrgencyProps) {
  if (stock > threshold) return null;

  if (stock <= 0) {
    return (
      <div className="flex items-center gap-2.5 text-[12px] text-sale font-semibold uppercase tracking-[0.1em]">
        <span className="w-2 h-2 bg-sale rounded-full" />
        Out of Stock
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 text-[12px] text-sale font-semibold uppercase tracking-[0.1em] animate-pulse-soft">
      <span className="w-2 h-2 bg-sale rounded-full" />
      Only {stock} left in stock
    </div>
  );
}
