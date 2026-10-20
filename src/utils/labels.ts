// Label names vary ("Blue Note" / "Blue Note Records", "Impulse" / "Impulse!")
export function normalizeLabel(label?: string): string | undefined {
  return (
    label
      ?.trim()
      .replace(/!$/, "")
      .replace(/\s+(records|recordings|music|entertainment)$/i, "") || undefined
  );
}
