'use client';

import { useEffect, useState } from 'react';
import { useEditor } from '@/lib/contexts/editor-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { vscodeDark, vscodeDarkInit } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { useTheme } from 'next-themes';

export default function CodeEditor() {
  const { currentDocument, updateDocumentContent } = useEditor();
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const [editorTheme, setEditorTheme] = useState<any>(vscodeDark);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (resolvedTheme === 'dark') {
      setEditorTheme(vscodeDark);
    } else {
      setEditorTheme(vscodeDarkInit({
        settings: {
          background: '#ffffff',
          foreground: '#000000',
          caret: '#000000',
          selection: '#bbdfff',
          selectionMatch: '#bbdfff',
          lineHighlight: '#f0f0f0',
          gutterBackground: '#f5f5f5',
          gutterForeground: '#999999',
        }
      }));
    }
  }, [resolvedTheme]);

  const handleChange = (value: string) => {
    if (currentDocument) {
      updateDocumentContent(value);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2 bg-muted/30 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">
            {currentDocument ? currentDocument.name : 'No document selected'}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {currentDocument ? (
          <CodeMirror
            value={currentDocument.content}
            height="100%"
            extensions={[
              markdown(),
              EditorView.lineWrapping
            ]}
            theme={editorTheme}
            onChange={handleChange}
            className="h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Select or create a document to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}