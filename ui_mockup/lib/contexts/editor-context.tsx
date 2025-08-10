'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchDocument, saveDocumentContent } from '@/lib/services/document-service';

interface Document {
  id: string;
  name: string;
  content: string;
  lastModified: Date;
}

interface EditorContextType {
  currentDocument: Document | null;
  openDocument: (id: string) => Promise<void>;
  updateDocumentContent: (content: string) => void;
  saveDocument: () => Promise<void>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isContentModified, setIsContentModified] = useState(false);

  // Auto-save document every 30 seconds if modified
  useEffect(() => {
    if (!currentDocument || !isContentModified) return;

    const autoSaveInterval = setInterval(() => {
      saveDocument();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [currentDocument, isContentModified]);

  const openDocument = async (id: string) => {
    try {
      const document = await fetchDocument(id);
      setCurrentDocument(document);
      setIsContentModified(false);
    } catch (error) {
      console.error('Error opening document:', error);
      throw error;
    }
  };

  const updateDocumentContent = (content: string) => {
    if (!currentDocument) return;

    setCurrentDocument({
      ...currentDocument,
      content,
      lastModified: new Date(),
    });
    setIsContentModified(true);
  };

  const saveDocument = async () => {
    if (!currentDocument) return;

    try {
      await saveDocumentContent(
        currentDocument.id,
        currentDocument.content
      );
      setIsContentModified(false);
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  };

  return (
    <EditorContext.Provider
      value={{
        currentDocument,
        openDocument,
        updateDocumentContent,
        saveDocument,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}