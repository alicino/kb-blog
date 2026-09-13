export interface SearchDoc {
  type: 'article' | 'pagina' | 'categoria' | 'tag';
  title: string;
  description: string;
  content: string;
  url: string;
  category?: string;
  tags?: string[];
}

/** Remove acentuação e normaliza para minúsculas, para busca sem diferenciar maiúsculas/acentos. */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Remove marcações Markdown básicas para gerar um texto plano aproximado, usado apenas na indexação de busca. */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
