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

const encodeCards = (cards: NameCard[]): string => {
  const lines = cards.map(c => {
    const icon = c.icon.startsWith('https://')
      ? '^' + c.icon.slice(8)
      : c.icon;
    return c.social ? `${c.name}|${icon}|${c.social}` : `${c.name}|${icon}`;
  });
  return btoa(encodeURIComponent(lines.join('\n')));
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('encodeCards', () => {
    it('should compress https:// URLs with ^ prefix', () => {
      const cards: NameCard[] = [
        { name: 'Test', icon: 'https://example.com/test.png' },
      ];
      const encoded = encodeCards(cards);
      const decoded = decodeURIComponent(atob(encoded));
      expect(decoded).toContain('^example.com/test.png');
      expect(decoded).not.toContain('https://');
    });

    it('should include social when present', () => {
      const cards: NameCard[] = [
        { name: 'Alice', icon: 'icon.png', social: '@alice' },
      ];
      const encoded = encodeCards(cards);
      const decoded = decodeURIComponent(atob(encoded));
      expect(decoded).toBe('Alice|icon.png|@alice');
    });

    it('should omit social when absent', () => {
      const cards: NameCard[] = [
        { name: 'Bob', icon: 'icon.png' },
      ];
      const encoded = encodeCards(cards);
      const decoded = decodeURIComponent(atob(encoded));
      expect(decoded).toBe('Bob|icon.png');
    });
  });
}

const decodeCards = (encoded: string): NameCard[] | null => {
  try {
    const text = decodeURIComponent(atob(encoded));
    return text.split('\n').filter(Boolean).map(line => {
      const [name, iconRaw, social] = line.split('|');
      const icon = iconRaw.startsWith('^')
        ? 'https://' + iconRaw.slice(1)
        : iconRaw;
      const card: NameCard = { name, icon };
      if (social) card.social = social;
      return card;
    });
  } catch {
    return null;
  }
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe('decodeCards', () => {
    it('should decode cards with social', () => {
      const cards: NameCard[] = [
        { name: 'Alice', icon: 'https://example.com/alice.png', social: '@alice' },
      ];
      const encoded = encodeCards(cards);
      expect(decodeCards(encoded)).toEqual(cards);
    });

    it('should decode cards without social', () => {
      const cards: NameCard[] = [
        { name: 'Bob', icon: 'https://example.com/bob.png' },
      ];
      const encoded = encodeCards(cards);
      expect(decodeCards(encoded)).toEqual(cards);
    });

    it('should handle multiple cards', () => {
      const cards: NameCard[] = [
        { name: 'Alice', icon: 'https://example.com/alice.png', social: '@alice' },
        { name: 'Bob', icon: 'icon-bob' },
      ];
      const encoded = encodeCards(cards);
      expect(decodeCards(encoded)).toEqual(cards);
    });

    it('should return null for invalid encoded string', () => {
      expect(decodeCards('invalid-base64!!')).toBeNull();
    });

    it('should handle Japanese characters in name', () => {
      const cards: NameCard[] = [
        { name: '太郎', icon: 'https://example.com/taro.png', social: '@taro' },
      ];
      const encoded = encodeCards(cards);
      expect(decodeCards(encoded)).toEqual(cards);
    });
  });
}

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
    const encoded = encodeCards(cards);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    await navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      const decoded = decodeCards(data);
      if (decoded) {
        const json = JSON.stringify(decoded, null, 2);
        setJsonInput(json);
        setCards(decoded);
        setCurrentPage(1);
      }
    }
  }, []);

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
