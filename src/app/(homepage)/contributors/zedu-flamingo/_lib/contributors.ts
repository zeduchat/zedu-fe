import { readFile } from "node:fs/promises";
import path from "node:path";

export interface FlamingoContributor {
  id: string;
  fullName: string;
  zeduUsername: string;
}

const CSV_PATH = path.join(
  process.cwd(),
  "src/app/(homepage)/contributors/zedu-flamingo/_lib/contributors.csv"
);

// Maps normalised header text to a field, so column order in the sheet
// doesn't matter and small wording differences are tolerated. Any other
// columns in the sheet are ignored.
const HEADER_ALIASES: Record<string, keyof Omit<FlamingoContributor, "id">> = {
  fullname: "fullName",
  name: "fullName",
  zeduusername: "zeduUsername",
  username: "zeduUsername",
};

// Minimal RFC 4180 parser: handles quoted fields, escaped quotes ("")
// and commas or line breaks inside quotes, as Excel writes them.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

export async function getFlamingoContributors(): Promise<
  FlamingoContributor[]
> {
  // Let a missing or unreadable CSV fail the build instead of rendering an
  // empty board.
  const text = await readFile(CSV_PATH, "utf8");

  // Excel's "CSV UTF-8" export prepends a byte-order mark.
  const [headerRow, ...dataRows] = parseCsv(text.replace(/^﻿/, ""));
  if (!headerRow) return [];

  const columns = headerRow.map(
    (header) => HEADER_ALIASES[header.toLowerCase().replace(/[^a-z]/g, "")]
  );

  return dataRows
    .map((cells, index) => {
      const record: FlamingoContributor = {
        id: `flamingo-${index}`,
        fullName: "",
        zeduUsername: "",
      };
      columns.forEach((key, col) => {
        if (key) record[key] = (cells[col] ?? "").trim();
      });
      record.zeduUsername = record.zeduUsername.replace(/^@/, "");
      return record;
    })
    .filter((record) => record.fullName);
}
