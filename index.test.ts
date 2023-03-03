import { describe, expect, it } from 'vitest';
import { HTMLRx } from './index';

describe('HTMLRx', () => {
    const H = new HTMLRx(`
        <div class="container" data-test="my-container">
            <h1 class="heading" data-test="my-heading">Heading 1</h1>
            <p class="paragraph" data-test="my-paragraph">Paragraph 1</p>
            <ul class="list" data-test="my-list">
                <li class="item" data-test="my-item-1">Item 1</li>
                <li class="item" data-test="my-item-2">Item 2</li>
                <li class="item" data-test="my-item-3">
                    Item 3
                    <ol class="nested-list" data-test="my-nested-list">
                        <li class="nested-item" data-test="my-nested-item-1">Nested item 3.1</li>
                        <li class="nested-item" data-test="my-nested-item-2">Nested item 3.2</li>
                    </ol>
                </li>
            </ul>
        </div>
    `)

    it('select()', () => {

        expect(H.select('ol')).toStrictEqual([['<ol class="nested-list" data-test="my-nested-list">', 489]])
        expect(H.select('h1',{class:'heading'})).toStrictEqual([['<h1 class="heading" data-test="my-heading">', 70]])
        expect(H.select('li',{'data-test':'my-item-2'})).toStrictEqual([['<li class="item" data-test="my-item-2">', 335]])
        expect(H.select('li',{'':'item'})).toStrictEqual([['<li class="item" data-test="my-item-1">', 268]])
        expect(H.select('li',{'':'item'}, 2)).toStrictEqual([
            ['<li class="item" data-test="my-item-1">', 268],
            ['<li class="item" data-test="my-item-2">', 335]
        ])
        expect(H.select('li',{'':'item'}, true)).toStrictEqual([
            ['<li class="item" data-test="my-item-1">', 268],
            ['<li class="item" data-test="my-item-2">', 335],
            ['<li class="item" data-test="my-item-3">', 402]
        ])
        // expect(H.select(null,{'': 'my-container'})).toStrictEqual(['<div class="container" data-test="my-container">'])
    });

    it('element()', () => {

        expect(H.element('ol')).toBe(`<ol class="nested-list" data-test="my-nested-list">
                        <li class="nested-item" data-test="my-nested-item-1">Nested item 3.1</li>
                        <li class="nested-item" data-test="my-nested-item-2">Nested item 3.2</li>
                    </ol>`)

        expect(H.element('h1',{class:'heading'})).toBe('<h1 class="heading" data-test="my-heading">Heading 1</h1>')
        // expect(T.getElement('li',{'data-test':'my-item-2'})).toBe('<li class="item" data-test="my-item-2">')
        // expect(T.getElement('li',{'':'item'})).toBe('<li class="item" data-test="my-item-1">')
        // expect(T.getElement(null,{'': 'my-container'})).toBe('<div class="container" data-test="my-container">')
    });
});