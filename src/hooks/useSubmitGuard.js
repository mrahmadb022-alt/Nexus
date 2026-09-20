import { useCallback, useRef, useState } from 'react'

// Prevents a handler from re-firing while a previous call from it is still "in flight" —
// guards against duplicate submissions from rapid double-clicks/double-taps (e.g. double-
// booking an appointment). The check lives in a ref, not state, because state updates are
// batched/async in React and wouldn't reliably block a second click that lands in the same
// tick; a ref updates synchronously.
//
// Handlers may be sync (today, everything here is a local state update) or return a Promise
// (once these call a real backend) — either way the guard clears when the handler settles, so
// no call site needs to change when the underlying action becomes async.
export function useSubmitGuard() {
  const inFlightRef = useRef(false)
  const [submitting, setSubmitting] = useState(false)

  const guard = useCallback(
    (handler) =>
      async (...args) => {
        if (inFlightRef.current) return
        inFlightRef.current = true
        setSubmitting(true)
        try {
          await handler(...args)
        } finally {
          inFlightRef.current = false
          setSubmitting(false)
        }
      },
    [],
  )

  return [submitting, guard]
}
