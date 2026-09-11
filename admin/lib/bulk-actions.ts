const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function csvCell(value: unknown): string {
  if (value == null) return "";

  const text =
    typeof value === "object" ? JSON.stringify(value) : String(value);
  const safe = FORMULA_PREFIX.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

/** UTF-8 BOM, Excel'in Türkçe karakterleri doğru açmasını sağlar. */
export function downloadCsv<T extends object>(
  filename: string,
  columns: { key: string; label: string }[],
  rows: T[],
): void {
  const lines = [
    columns.map((column) => csvCell(column.label)).join(","),
    ...rows.map((row) =>
      columns
        .map((column) =>
          csvCell((row as Record<string, unknown>)[column.key]),
        )
        .join(","),
    ),
  ];
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export type BulkResource =
  | "talepler"
  | "iptal-talepleri"
  | "teklif-gecmisi"
  | "iletisim"
  | "policeler";

export async function deleteBulk(
  resource: BulkResource,
  ids: string[],
): Promise<void> {
  const response = await fetch("/api/toplu-sil", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resource, ids }),
  });
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(body?.error || "Kayıtlar silinemedi.");
  }
}
