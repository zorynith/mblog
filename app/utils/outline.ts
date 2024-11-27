interface OutlineItem {
  id: string;
  text: string;
  level: number;
  pos: number;
  size: number;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  subsections: { id: string; title: string }[];
}

export function generateTableOfContents(outline: OutlineItem[]): TableOfContentsItem[] {
  if (!outline || !Array.isArray(outline) || outline.length === 0) {
    // console.warn('Invalid or empty outline:', outline);
    return [];
  }

  try {
    // 找出最小层级（作为主层级）
    const minLevel = Math.min(...outline.map(item => item.level));
    
    // 找出第二小的层级（作为子层级）
    const levels = [...new Set(outline.map(item => item.level))].sort((a, b) => a - b);
    const subLevel = levels.length > 1 ? levels[1] : minLevel + 1;

    const tableOfContents: TableOfContentsItem[] = [];
    let currentMainSection: TableOfContentsItem | null = null;

    outline.forEach((item) => {
      if (item.level === minLevel) {
        currentMainSection = {
          id: item.id,
          title: item.text,
          subsections: [],
        };
        tableOfContents.push(currentMainSection);
      } else if (item.level === subLevel && currentMainSection) {
        currentMainSection.subsections.push({
          id: item.id,
          title: item.text,
        });
      } else if (item.level === subLevel && !currentMainSection) {
        currentMainSection = {
          id: 'default-section',
          title: '目录',
          subsections: [{
            id: item.id,
            title: item.text,
          }],
        };
        tableOfContents.push(currentMainSection);
      }
    });

    return tableOfContents;
  } catch (error) {
    console.error('Error generating table of contents:', error);
    return [];
  }
}
