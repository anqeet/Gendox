'use client';

import { useEffect, useState } from 'react';
import { useEditor } from '@/lib/contexts/editor-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { compileDocument } from '@/lib/services/typst-service';
import { useToast } from '@/hooks/use-toast';

// Use dynamic import for PDF.js to avoid SSR issues
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/editor/pdf-viewer'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function PdfPreview() {
  const { currentDocument } = useEditor();
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastCompiled, setLastCompiled] = useState<Date | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const { toast } = useToast();
  const [autoCompile, setAutoCompile] = useState(true);

  // Auto-compile on document change if auto-compile is enabled
  useEffect(() => {
    if (currentDocument && autoCompile) {
      const timeoutId = setTimeout(() => {
        handleCompile();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentDocument?.content, autoCompile]);

  const handleCompile = async () => {
    if (!currentDocument) return;

    setIsCompiling(true);
    try {
      await compileDocument(currentDocument.id);
      const compiledPdfUrl = `/api/documents/${currentDocument.id}/pdf?t=${new Date().getTime()}`;
      setPdfUrl(compiledPdfUrl);
      setLastCompiled(new Date());
    } catch (error) {
      toast({
        title: 'Compilation failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      console.error('Compilation error:', error);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2 bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">PDF Preview</span>
          {isCompiling && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {lastCompiled && !isCompiling && (
            <span className="text-xs text-muted-foreground">
              Last compiled: {lastCompiled.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-20">
              <Slider
                value={[scale * 100]}
                min={50}
                max={200}
                step={10}
                onValueChange={(values) => setScale(values[0] / 100)}
              />
            </div>
            <Button size="icon" variant="ghost" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <Button size="icon" variant="ghost" onClick={handleCompile} disabled={isCompiling || !currentDocument}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden bg-muted/20">
        {!currentDocument ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>No document selected</p>
          </div>
        ) : !pdfUrl ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <p className="mb-4">No PDF preview available</p>
            <Button onClick={handleCompile} disabled={isCompiling}>
              {isCompiling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Compiling...
                </>
              ) : (
                'Compile Document'
              )}
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex justify-center p-4">
              <div className="bg-white shadow-lg">
                <PDFViewer url={pdfUrl} scale={scale} />
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
