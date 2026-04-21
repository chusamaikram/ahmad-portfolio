const S = "bg-gray-200 dark:bg-gray-700/60 rounded animate-pulse";

function Cell({ w = "w-full" }: { w?: string }) {
  return <div className={`h-3.5 ${w} ${S}`} />;
}

export default function TableSkeleton({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-800/60">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              {j === 0 ? (
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex-shrink-0 ${S}`} />
                  <div className="flex-1 space-y-1.5">
                    <Cell w="w-32" />
                    <Cell w="w-48" />
                  </div>
                </div>
              ) : (
                <Cell w={j === cols - 1 ? "w-16 ml-auto" : "w-24"} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
