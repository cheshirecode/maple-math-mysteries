// Hand-rolled hash router (~50 lines, council-4 item 1). One handler contract:
// every subscriber receives (route, query). Hash-only by design: vite base './'
// breaks history-API deep paths on GitHub Pages, and the SW only ever caches '/'.

export interface Route {
  grade: string
  band?: string
  caseId?: string
}

export type RouteHandler = (route: Route, query: URLSearchParams) => void

const handlers: RouteHandler[] = []

// '#/grade-three/combine/c16-bridge' -> { grade: 'grade-three', band: 'combine', caseId: 'c16-bridge' }
// Malformed input degrades per shape: junk segments drop, empty hash yields a
// route with an empty grade for the caller to resolve.
export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const route: Route = { grade: '' }
  if (parts[0]) route.grade = parts[0]
  if (parts[1]) route.band = parts[1]
  if (parts[2]) route.caseId = parts[2]
  return route
}

export function formatRoute(route: Route): string {
  let out = `#/${route.grade}`
  if (route.band) out += `/${route.band}`
  if (route.band && route.caseId) out += `/${route.caseId}`
  return out
}

// Same-hash assignment fires no hashchange event and pushes no history entry.
export function navigate(route: Route): void {
  const target = formatRoute(route)
  if (location.hash !== target) location.hash = target
}

export function onRoute(handler: RouteHandler): void {
  handlers.push(handler)
}

function dispatch(): void {
  const route = parseHash(location.hash)
  const query = new URLSearchParams(location.search)
  for (const handler of handlers) handler(route, query)
}

export function startRouter(): void {
  window.addEventListener('hashchange', dispatch)
  dispatch()
}
