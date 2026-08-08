export type PickerTableHeaderCell = {
  className?: string;
  content: string;
};

type Props = {
  cells: readonly PickerTableHeaderCell[];
  className: string;
  isDecorative?: boolean;
};

/** Shared structural header for selectable master-data tables. */
export default function PickerTableHeader({
  cells,
  className,
  isDecorative = false,
}: Props) {
  return (
    <div aria-hidden={isDecorative || undefined} className={className}>
      {cells.map((cell) => (
        <span className={cell.className} key={cell.content}>
          {cell.content}
        </span>
      ))}
    </div>
  );
}
