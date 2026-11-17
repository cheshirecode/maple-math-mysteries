import { el } from '../../voice.ts'

// One shared key for the base-ten pictures: a dot is one, a bar is ten, a
// square is one hundred. Widgets that draw blocks call this so the notation
// is never on screen without an explanation.

export interface LegendOptions {
  ones?: boolean
  tens?: boolean
  hundreds?: boolean
}

function item(chipCls: string, label: string): HTMLElement {
  const item = el('span', 'legend-item')
  item.append(el('span', `legend-chip ${chipCls}`), el('span', 'legend-text', label))
  return item
}

export function baseTenLegend(opts: LegendOptions): HTMLElement {
  const legend = el('div', 'pattern-legend')
  if (opts.ones) legend.append(item('legend-dot', 'a dot is one'))
  if (opts.tens) legend.append(item('legend-rod', 'a bar is ten'))
  if (opts.hundreds) legend.append(item('legend-flat', 'a square is one hundred'))
  return legend
}
