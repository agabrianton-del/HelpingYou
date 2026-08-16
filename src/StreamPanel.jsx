import { useEffect, useState } from 'react';

export default function StreamPanel() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const source = new EventSource('/api/stream/events');

    source.addEventListener('connected', () => {
      setStatus('connected');
    });

    source.addEventListener('tick', (event) => {
      const data = JSON.parse(event.data);
      setEvents((prev) => [data, ...prev].slice(0, 20));
    });

    source.onerror = () => {
      setStatus('reconnecting');
    };

    return () => {
      source.close();
      setStatus('closed');
    };
  }, []);

  return (
    <section>
      <h2>Stream status: {status}</h2>
      <ul>
        {events.map((item) => (
          <li key={`${item.timestamp}-${item.count}`}>
            #{item.count} at {item.timestamp}
          </li>
        ))}
      </ul>
    </section>
  );
}
