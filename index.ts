type  Tags = Map<string, number[]>
type Tag = [string, number]

export class HTMLRx {
    HTML: string;
    selected: [string, number] | undefined;
    attributeTags: Tags;
    openTags: Tags;
    closingTags: Tags;

    constructor(html: string) {
        this.HTML = html
        this.openTags = HTMLRx.getOpenTags(html)
        this.closingTags = HTMLRx.getClosingTags(html)
        this.attributeTags = HTMLRx.getAttributeTags(html)
    }

    toString() {
        return this.HTML
    }

    static getOpenTags(html: string) {
        const tags = new Map()
        const regex = /<(\w+)\b/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const tag = match[1] as string;
            const index = match.index;
            if (tags.has(tag)) tags.set(tag, [...(tags.get(tag) as number[]), index])
            else tags.set(tag, [index])
        }
        return tags
    }

    static getClosingTags(html: string) {
        const tags = new Map()
        const regex = /<\/(?!area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(\w+)\s*>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const tag = match[1] as string;
            const index = match.index + tag.length + 3;
            if (tags.has(tag)) tags.set(tag, [...(tags.get(tag) as number[]), (index)])
            else tags.set(tag, [index])
        }
        return tags
    }

    static getAttributeTags(html: string) {
        const tags = new Map()
        const regex = /\<\w+(?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[\^'">\s]+)))*\s*\/?\>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const tag = match[0];
            const index = match.index;
            if (tags.has(tag)) tags.set(tag, [...(tags.get(tag) as number[]), (index)])
            else tags.set(tag, [index])
        }
        return tags
    }


    //   Utility functions

      
    select(tag?: string, attrs?: Record<string, string | undefined>): Array<[string, number]> {
        const attrsList = attrs ? Object.entries(attrs) : undefined;
        const matchingTags: Array<[string, number]> = [];
      
        for (const [tagStr, startIndexes] of this.attributeTags.entries()) {
          const [tagMatch, attrMatch] = tagStr.split(/(?<=\<\w+)\s+/);
          if (tag && tagMatch !== `<${tag}`) continue;
      
          const attrMap = Object.fromEntries(
            [...(attrMatch || '').matchAll(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g)]
            .map((m) => [m[1], m[2]])
          );
      
          if (!attrsList || attrsList.every(([name, value]) => {
            if (value === null || value === undefined || value === '') {
              return Object.values(attrMap).includes(name);
            }
            return attrMap[name] === value;
          })) {
            for (const startIndex of startIndexes) {
              matchingTags.push([tagStr, startIndex]);
            }
          }
        }
      
        return matchingTags;
      }
      
    
      
      
      
    
      

      replaceNth(search: string, replace: string, n: number = 1): string {
        let count = 0;
        let found = false;
        const HTML = this.HTML.replace(new RegExp(search, 'g'), (match) => {
          count++;
          if (count === n && !found) return replace
          return match
        })
        return HTML
    }
    

      element(
        tag: string,
        attributes?: Record<string, string | undefined | null>,
        amount: number | boolean = false
      ): string[] | string | null | undefined {
        const openIndexes = this.openTags.get(tag)
        const closingIndexes = this.closingTags.get(tag)

        if (openIndexes?.length === 1 && closingIndexes?.length === 1) {
            return this.HTML.slice(openIndexes[0], closingIndexes[0])
        }
      }

      modifyTag(
        openTag: string,
        attrs: Record<string, string | ((oldValue: string | undefined) => string | undefined) | undefined> = {},
        tag: string
      ): string {
        const tagParts = openTag.match(/^<(\w+)(\s+[^>]+)?>/);
        if (!tagParts) return openTag;
      
        const oldAttrs = Object.fromEntries((tagParts[2] || '').trim().split(/\s+/).map(attr => {
          const [name, value] = attr.split('=');
          return [name, value?.replace(/"/g, '')];
        }));
      
        const newAttrs = { ...oldAttrs };
        for (const [name, value] of Object.entries(attrs)) {
          if (typeof value === 'function') {
            const oldValue = oldAttrs[name];
            newAttrs[name] = value(oldValue);
          } else {
            newAttrs[name] = value;
          }
        }
      
        const attrStr = Object.entries(newAttrs)
          .filter(([_, value]) => value !== undefined)
          .map(([name, value]) => `${name}="${value}"`)
          .join(' ');
      
        return `<${tag} ${attrStr}>`;
      }
      
      
}