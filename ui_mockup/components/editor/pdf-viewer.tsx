'use client';

import { useEffect, useRef, useState } from 'react';
import * as PDFJS from 'pdfjs-dist';
import { Loader2 } from 'lucide-react';

PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  scale?: number;
}

export default function PDFViewer({ url, scale = 1.0 }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<PDFJS.PDFDocumentProxy | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const doc = await PDFJS.getDocument(url).promise;
        
        if (isMounted) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setPageNum(1);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading PDF:', err);
          setError('Failed to load PDF. Please try compiling again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [url]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        setLoading(true);
        const page = await pdfDoc.getPage(pageNum);
        
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (err) {
        console.error('Error rendering PDF page:', err);
        setError('Failed to render PDF page.');
      } finally {
        setLoading(false);
      }
    };
    
    renderPage();
  }, [pdfDoc, pageNum, scale]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <canvas ref={canvasRef} className="shadow-md" />
      
      {numPages > 1 && (
        <div className="flex items-center justify-center mt-4 gap-2">
          <button
            disabled={pageNum <= 1}
            onClick={() => setPageNum(p => Math.max(1, p - 1))}
            className="px-3 py-1 bg-muted rounded-md text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageNum} of {numPages}
          </span>
          <button
            disabled={pageNum >= numPages}
            onClick={() => setPageNum(p => Math.min(numPages, p + 1))}
            className="px-3 py-1 bg-muted rounded-md text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
