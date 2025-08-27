export function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/^\s*[-*•]\s*/gm, '') // Remove bullets: *, -, •
    .replace(/^\s*\d+\.\s*/gm, '')   // Remove numbered lists: 1., 2., etc
    .replace(/\n{3,}/g, '\n\n')      // Remove excessive newlines
    .trim()
}
