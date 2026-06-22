import { useEffect, useRef } from 'react';

export function useSse({ events, onEvent, token, enabled = true }) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !token) return;

    const url = `/api/sse/subscribe?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);

    events.forEach((eventName) => {
      eventSource.addEventListener(eventName, (e) => {
        onEventRef.current({ type: eventName, data: e.data });
      });
    });

    return () => eventSource.close();
  }, [token, enabled, JSON.stringify(events)]);
}
