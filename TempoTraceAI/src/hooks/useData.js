import { useState, useEffect } from 'react';

export const useData = () => {
  const [streamingData, setStreamingData] = useState([]);
  const [concertData, setConcertData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load streaming data
        const streamingResponse = await fetch('/consolidated_streaming_history.json');
        if (!streamingResponse.ok) {
          throw new Error('Failed to load streaming data');
        }
        const streamingJson = await streamingResponse.json();
        setStreamingData(streamingJson);
        
        // Load concert data
        const concertResponse = await fetch('/concerts.json');
        if (!concertResponse.ok) {
          throw new Error('Failed to load concert data');
        }
        const concertJson = await concertResponse.json();
        setConcertData(concertJson);
        
      } catch (err) {
        setError(err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { streamingData, concertData, loading, error };
};
