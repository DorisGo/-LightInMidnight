/** @typedef {import('./trace').Trace} Trace */

/**
 * What is still keeping you company: books you're in the middle of, then the
 * most recent album with a cover. At most three, so the home stays quiet.
 * @param {Trace[]} traces
 */
export function companions(traces) {
  const ongoing = traces.filter((trace) => trace.span?.status === 'ongoing')
  const weekAgo = Date.now() - 7 * 86400000
  const album = [...traces]
    .filter((trace) => trace.category === 'music' && trace.cover && trace.occurredAt.getTime() > weekAgo)
    .sort((a, b) => b.occurredAt - a.occurredAt)[0]
  return [...ongoing, ...(album ? [album] : [])].slice(0, 3)
}
