/**
 * Avatar initials: first letter of each of the last two words, ignoring anything in parentheses
 * and tokens without letters ("-", "&"). "Nguyễn Văn Anh" → "VA", "Quản trị viên (đủ mọi quyền)" → "TV".
 */
export function initialsOf(name: string | null | undefined): string {
  const words = (name ?? "")
    .replace(/\([^()]*\)/g, " ")
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w));
  const letters = words.slice(-2).map((w) => w.match(/\p{L}/u)?.[0] ?? "");
  return letters.join("").toLocaleUpperCase("vi") || "?";
}
