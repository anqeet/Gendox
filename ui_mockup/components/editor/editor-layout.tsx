'use client';

import { useState, useEffect } from 'react';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Sidebar from '@/components/editor/sidebar';
import CodeEditor from '@/components/editor/code-editor';
import PdfPreview from '@/components/editor/pdf-preview';
import { FileTreeProvider } from '@/lib/contexts/file-tree-context';
import { EditorProvider } from '@/lib/contexts/editor-context';
import Header from '@/components/editor/header';

export default function EditorLayout() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <FileTreeProvider>
      <EditorProvider>
        <div className="flex flex-col h-screen w-full overflow-hidden">
          <Header />
          <div className="flex-1 overflow-hidden">
            {isMobile ? (
              <MobileLayout />
            ) : (
              <DesktopLayout />
            )}
          </div>
        </div>
      </EditorProvider>
    </FileTreeProvider>
  );
}

function DesktopLayout() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[calc(100vh-3.5rem)]"
    >
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card">
        <Sidebar />
      </ResizablePanel>
      <ResizablePanel defaultSize={40} minSize={30}>
        <CodeEditor />
      </ResizablePanel>
      <ResizablePanel defaultSize={40} minSize={30}>
        <PdfPreview />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function MobileLayout() {
  const [activeTab, setActiveTab] = useState<'files' | 'editor' | 'preview'>('editor');

  return (
    <div className="h-full flex flex-col">
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === 'files' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === 'editor' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
          onClick={() => setActiveTab('editor')}
        >
          Editor
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'files' && <Sidebar />}
        {activeTab === 'editor' && <CodeEditor />}
        {activeTab === 'preview' && <PdfPreview />}
      </div>
    </div>
  );
}