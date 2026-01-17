import { useState, useCallback, useRef, useEffect } from 'react';
import { NameCard, CARDS_PER_PAGE } from './types';
import Preview from './components/Preview';

const defaultCards: NameCard[] = [
  { name: "Felix", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Felix", social: "@felix" },
  { name: "Aneka", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Aneka", social: "@aneka" },
  { name: "Bob", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Bob", social: "@bob" },
  { name: "Jack", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Jack", social: "@jack" },
  { name: "Molly", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Molly", social: "@molly" },
  { name: "Simba", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Simba", social: "@simba" },
  { name: "Bear", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Bear", social: "@bear" },
  { name: "Kitty", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Kitty", social: "@kitty" },
  { name: "Jasmine", icon: "https://api.dicebear.com/7.x/thumbs/svg?seed=Jasmine", social: "@jasmine" },
];

const defaultJson = JSON.stringify(defaultCards, null, 2);

function App() {
  const [jsonInput, setJsonInput] = useState(defaultJson);
  const [cards, setCards] = useState<NameCard[]>(defaultCards);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const totalPages = Math.max(1, Math.ceil(cards.length / CARDS_PER_PAGE));

  const parseJson = useCallback((input: string) => {
    if (!input.trim()) {
      setCards([]);
      setError('');
      setCurrentPage(1);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array');
      }

      const validCards: NameCard[] = parsed.map((item, index) => {
        if (typeof item.name !== 'string' || !item.name.trim()) {
          throw new Error(`Element ${index + 1} is missing "name"`);
        }
        if (typeof item.icon !== 'string') {
          throw new Error(`Element ${index + 1} is missing "icon"`);
        }
        const card: NameCard = {
          name: item.name,
          icon: item.icon,
        };
        if (typeof item.social === 'string' && item.social.trim()) {
          card.social = item.social;
        }
        return card;
      });

      setCards(validCards);
      setError('');
      setCurrentPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse JSON');
      setCards([]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    parseJson(value);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleShare = async () => {
    const encoded = encodeURIComponent(jsonInput);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    await navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      try {
        const json = decodeURIComponent(data);
        setJsonInput(json);
        parseJson(json);
      } catch (e) {
        // ignore invalid data
      }
    }
  }, [parseJson]);

  return (
    <div className="container">
      <div className="input-panel">
        <h1>simple-namecards</h1>
        <label htmlFor="json-input">JSON Input</label>
        <textarea
          id="json-input"
          value={jsonInput}
          onChange={handleInputChange}
          placeholder="Enter JSON array..."
        />
        {error && <div className="error-message">{error}</div>}
        <div className="button-group">
          <button
            type="button"
            onClick={handlePrint}
            disabled={cards.length === 0}
          >
            Print
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleShare}
            disabled={cards.length === 0}
          >
            Share
          </button>
        </div>
      </div>
      <div className="preview-panel">
        <div className="pagination">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            &lt;
          </button>
          <span>
            {cards.length > 0 ? `${currentPage}/${totalPages}` : '0/0'}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            &gt;
          </button>
        </div>
        <Preview
          ref={iframeRef}
          allCards={cards}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}

export default App;
