import { useState, useEffect } from 'react';

/**
 * Fetches a random motivational quote.
 * @returns {{ quote: string, author: string, loading: boolean }}
 */
export function useRandomQuote() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.realinspire.live/v1/quotes/random?limit=1')
      .then(res => res.json())
      .then(arr => {
        if (Array.isArray(arr) && arr.length > 0) {
          setQuote(arr[0].content);
          setAuthor(arr[0].author);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { quote, author, loading };
}
