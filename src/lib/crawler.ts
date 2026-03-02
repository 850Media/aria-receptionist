// Simple server-side web crawler to extract business content
export async function crawlWebsite(url: string, maxPages = 5): Promise<string> {
  const visited = new Set<string>()
  const texts: string[] = []
  const base = new URL(url)

  async function fetchPage(pageUrl: string): Promise<void> {
    if (visited.size >= maxPages || visited.has(pageUrl)) return
    visited.add(pageUrl)

    try {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': 'ARIA-AI-Receptionist/1.0' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) return
      const html = await res.text()

      // Extract visible text (strip tags)
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000)

      if (text.length > 100) texts.push(`[${pageUrl}]\n${text}`)

      // Find internal links for crawling
      if (visited.size < maxPages) {
        const links = [...html.matchAll(/href=["']([^"']+)["']/g)]
          .map(m => m[1])
          .filter(href => {
            if (href.startsWith('http')) {
              try { return new URL(href).hostname === base.hostname } catch { return false }
            }
            return href.startsWith('/') && !href.includes('#') && !href.match(/\.(pdf|jpg|png|gif|css|js)$/i)
          })
          .map(href => href.startsWith('http') ? href : `${base.origin}${href}`)
          .slice(0, 3)

        for (const link of links) {
          await fetchPage(link)
        }
      }
    } catch { /* skip failed pages */ }
  }

  await fetchPage(url)
  return texts.join('\n\n').slice(0, 12000)
}
