/**
 * lib/age.ts
 * Utility for computing a cat's age from estimated date of birth.
 */

/**
 * Computes a human-readable age string from a Date of birth.
 * Returns something like "2 tahun 3 bulan" or "3 bulan" or "1 tahun".
 */
export function computeAgeLabel(
  estimatedDateOfBirth: Date | string | null | undefined,
): string {
  if (!estimatedDateOfBirth) return "";

  const dob =
    typeof estimatedDateOfBirth === "string"
      ? new Date(estimatedDateOfBirth)
      : estimatedDateOfBirth;

  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} tahun`);
  }
  if (months > 0) {
    parts.push(`${months} bulan`);
  }
  if (parts.length === 0) {
    parts.push("Baru lahir");
  }

  return parts.join(" ");
}
