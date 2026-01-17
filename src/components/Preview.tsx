import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { NameCard, CARDS_PER_PAGE } from '../types';

interface PreviewProps {
  cards: NameCard[];
  allCards: NameCard[];
  currentPage: number;
  totalPages: number;
}

const generateStyles = () => `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  @page {
    size: A4;
    margin: 0;
  }

  .page {
    width: 210mm;
    height: 297mm;
    padding: 10mm;
    background: white;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 0;
    page-break-after: always;
  }

  .page:last-child {
    page-break-after: auto;
  }

  .card {
    width: 95mm;
    height: 69mm;
    border: 1px dashed #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10mm;
  }

  .card-icon {
    width: 30mm;
    height: 30mm;
    object-fit: cover;
    border-radius: 50%;
    margin-bottom: 5mm;
    background-color: #f0f0f0;
  }

  .card-name {
    font-size: 18pt;
    font-weight: bold;
    text-align: center;
    word-break: break-word;
  }

  .card-social {
    font-size: 11pt;
    color: #888;
    margin-top: 1mm;
    text-align: center;
    word-break: break-word;
  }

  .card-placeholder {
    color: #999;
    font-size: 10pt;
  }

  @media print {
    .page {
      margin: 0;
      padding: 10mm;
    }

    .card {
      border: 1px dashed #ccc;
    }

    .print-only {
      display: block !important;
    }

    .screen-only {
      display: none !important;
    }
  }

  @media screen {
    body {
      background: #e9ecef;
      padding: 20px;
    }

    .page {
      margin: 0 auto;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .print-only {
      display: none !important;
    }
  }
`;

const generateCardHtml = (card: NameCard) => `
  <div class="card">
    <img class="card-icon" src="${card.icon}" alt="${card.name}" onerror="this.style.display='none'" />
    <div class="card-name">${card.name}</div>
    ${card.social ? `<div class="card-social">${card.social}</div>` : ''}
  </div>
`;

const generateEmptyCardHtml = () => `
  <div class="card">
    <div class="card-placeholder"></div>
  </div>
`;

const generatePageHtml = (cards: NameCard[], startIndex: number) => {
  const pageCards = cards.slice(startIndex, startIndex + CARDS_PER_PAGE);
  let html = '<div class="page">';

  for (let i = 0; i < CARDS_PER_PAGE; i++) {
    if (i < pageCards.length) {
      html += generateCardHtml(pageCards[i]);
    } else {
      html += generateEmptyCardHtml();
    }
  }

  html += '</div>';
  return html;
};

const generatePreviewHtml = (cards: NameCard[]) => {
  const styles = generateStyles();
  let pagesHtml = '';

  if (cards.length === 0) {
    pagesHtml = '<div class="page">' + Array(8).fill(generateEmptyCardHtml()).join('') + '</div>';
  } else {
    pagesHtml = generatePageHtml(cards, 0);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${styles}</style>
    </head>
    <body class="screen-only">
      ${pagesHtml}
    </body>
    </html>
  `;
};

const generatePrintHtml = (allCards: NameCard[]) => {
  const styles = generateStyles();
  let pagesHtml = '';

  if (allCards.length === 0) {
    pagesHtml = '<div class="page">' + Array(8).fill(generateEmptyCardHtml()).join('') + '</div>';
  } else {
    const totalPages = Math.ceil(allCards.length / CARDS_PER_PAGE);
    for (let i = 0; i < totalPages; i++) {
      pagesHtml += generatePageHtml(allCards, i * CARDS_PER_PAGE);
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${styles}</style>
    </head>
    <body>
      ${pagesHtml}
    </body>
    </html>
  `;
};

const Preview = forwardRef<HTMLIFrameElement, PreviewProps>(
  ({ cards, allCards }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useImperativeHandle(ref, () => {
      const iframe = iframeRef.current!;
      return {
        ...iframe,
        get contentWindow() {
          const printHtml = generatePrintHtml(allCards);
          iframe.contentDocument?.open();
          iframe.contentDocument?.write(printHtml);
          iframe.contentDocument?.close();
          return iframe.contentWindow;
        },
      } as HTMLIFrameElement;
    });

    useEffect(() => {
      const iframe = iframeRef.current;
      if (iframe) {
        const html = generatePreviewHtml(cards);
        iframe.contentDocument?.open();
        iframe.contentDocument?.write(html);
        iframe.contentDocument?.close();
      }
    }, [cards]);

    return (
      <iframe
        ref={iframeRef}
        className="preview-iframe"
        title="Preview"
      />
    );
  }
);

Preview.displayName = 'Preview';

export default Preview;
