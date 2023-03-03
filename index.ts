type  TagMap = Map<string, number[]>
type Tag = [string, number]
type Tags = Tag[]

export class HTMLRx {
    HTML: string;
    selected: Tag | undefined;
    attributeTags: TagMap;
    openTags: TagMap;
    closingTags: TagMap;

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

      
    /**
   * Returns an array of tuples, each containing a string representation of a matching HTML tag
   * and the index of its opening angle bracket in the source HTML string.
   * 
   * @param tag - The tag name to match.
   * @param attrs - An object containing attribute names and values to match.
   * @returns An array of matching tags.
   */
    select(tag?: string, attrs?: Record<string, string | undefined>, n: number | boolean = false): Tags {
      // Convert the attrs object to an array of [name, value] tuples or undefined.
      const attrsList = attrs ? Object.entries(attrs) : undefined;
    
      // An array to store matching tags.
      const results: Tags = [];
    
      // Iterate over each matching tag.
      for (const [tagStr, startIndexes] of this.attributeTags.entries()) {
        // Split the tag string into its tag name and attribute string.
        const [tagMatch, attrMatch] = tagStr.split(/(?<=\<\w+)\s+/);
    
        // If the tag name doesn't match the requested tag, skip to the next tag.
        if (!tagMatch?.startsWith(`<${tag}`)) {
          continue;
        }
    
        // Convert the tag's attribute string to an object.
        const tagAttrMap = Object.fromEntries(
          // Match all attribute name-value pairs using a regular expression.
          Array.from(attrMatch?.matchAll(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g) || [])
            .map((m) => [m[1], m[2]])
        );
    
        let startIndex: number | undefined = undefined;
    
        // Check that all attributes in the attrsList match the attributes in the tag.
        if (!attrsList || attrsList.every(([name, value]) => {
          // If the attribute name is empty, check that the attribute value matches any attribute.
          if (name === '') {
            return Object.values(tagAttrMap).includes(value);
          // If the attribute value is empty, check that the attribute name matches.
          } else if (value === null || value === undefined || value === '') {
            return Object.values(tagAttrMap).includes(name);
          // Otherwise, check that the attribute name and value match.
          } else {
            return tagAttrMap[name] === value;
          }
        })) {
          // If all attributes match, set the start index of the matching tag.
          startIndex = startIndexes[0];
        }
    
        // If a matching tag was found, add it to the results array.
        if (startIndex !== undefined) {
          results.push([tagStr, startIndex]);
        }
      }
    
      // Return the matching tag(s) based on the value of the n parameter.
      if (n === true) return results;
      if (n === false || n < 2) return [results[0]!];
      return results.slice(0, n);
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