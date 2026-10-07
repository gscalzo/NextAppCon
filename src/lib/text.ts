/**
 * Joins the last two words with a non-breaking space so a wrapped title never ends
 * on a lone short word ("…Skill in the Agentic / Era").
 */
export function noOrphan(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length < 3 || words.at(-1)!.length > 10) return words.join(' ');
  return `${words.slice(0, -1).join(' ')} ${words.at(-1)}`;
}
