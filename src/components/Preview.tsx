import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { NameCard, CARDS_PER_PAGE } from '../types';

interface PreviewProps {
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
    grid-template-columns: repeat(2, 91mm);
    grid-template-rows: repeat(4, 55mm);
    gap: 0;
    justify-content: center;
    align-content: center;
    page-break-after: always;
  }

  .page:last-child {
    page-break-after: auto;
  }

  .card {
    width: 91mm;
    height: 55mm;
    border: none;
    border-left: 1px dashed #ccc;
    border-top: 1px dashed #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5mm;
  }

  .card:nth-child(2n) {
    border-right: 1px dashed #ccc;
  }

  .card:nth-child(n+7) {
    border-bottom: 1px dashed #ccc;
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
    font-size: 14pt;
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

const generatePageHtml = (cards: NameCard[], startIndex: number, pageNumber: number) => {
  const pageCards = cards.slice(startIndex, startIndex + CARDS_PER_PAGE);
  let html = `<div class="page" data-page="${pageNumber}">`;

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

const generatePreviewHtml = (allCards: NameCard[], currentPage: number) => {
  const styles = generateStyles();
  let pagesHtml = '';

  if (allCards.length === 0) {
    pagesHtml = '<div class="page" data-page="1">' + Array(8).fill(generateEmptyCardHtml()).join('') + '</div>';
  } else {
    const totalPages = Math.ceil(allCards.length / CARDS_PER_PAGE);
    for (let i = 0; i < totalPages; i++) {
      pagesHtml += generatePageHtml(allCards, i * CARDS_PER_PAGE, i + 1);
    }
  }

  const pageVisibilityStyle = `
    @media screen {
      .page { display: none; }
      .page[data-page="${currentPage}"] { display: grid; }
    }
  `;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${styles}</style>
      <style>${pageVisibilityStyle}</style>
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
    pagesHtml = '<div class="page" data-page="1">' + Array(8).fill(generateEmptyCardHtml()).join('') + '</div>';
  } else {
    const totalPages = Math.ceil(allCards.length / CARDS_PER_PAGE);
    for (let i = 0; i < totalPages; i++) {
      pagesHtml += generatePageHtml(allCards, i * CARDS_PER_PAGE, i + 1);
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
  ({ allCards, currentPage }, ref) => {
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
        const html = generatePreviewHtml(allCards, currentPage);
        iframe.contentDocument?.open();
        iframe.contentDocument?.write(html);
        iframe.contentDocument?.close();
      }
    }, [allCards, currentPage]);

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
