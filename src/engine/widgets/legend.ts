import { el } from '../../voice.ts'

// One shared key for the base-ten pictures, drawn so the notation explains
// itself: the rod is built of ten cells, the square of a hundred-cell grid.
// Every block-using widget renders the same bordered key, so kids learn one
// notation once and never meet an unexplained symbol.

export function baseTenLegend(): HTMLElement {
  const legend = el('div', 'pattern-legend')
  legend.append(
    legendItem('legend-dot', 'one'),
    legendItem('legend-rod', 'ten'),
    legendItem('legend-flat', 'one hundred'),
  )
  return legend
}

function legendItem(chipCls: string, label: string): HTMLElement {
  const item = el('span', 'legend-item')
  item.append(el('span', `legend-chip ${chipCls}`), el('span', 'legend-text', label))
  return item
}
