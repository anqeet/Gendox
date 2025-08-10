'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fetchFileTree, createNewFile, createNewFolder, deleteFileOrFolder } from '@/lib/services/file-service';

interface FileTreeItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
}

interface FileTreeContextType {
  fileTree: FileTreeItem[];
  isLoading: boolean;
  createFile: (name: string, parentId?: string) => Promise<string>;
  createFolder: (name: string, parentId?: string) => Promise<string>;
  deleteItem: (id: string) => Promise<void>;
  refreshFileTree: () => Promise<void>;
}

const FileTreeContext = createContext<FileTreeContextType | undefined>(undefined);

export function FileTreeProvider({ children }: { children: React.ReactNode }) {
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFileTree = async () => {
    try {
      setIsLoading(true);
      const tree = await fetchFileTree();
      setFileTree(tree);
    } catch (error) {
      console.error('Error fetching file tree:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFileTree();
  }, []);

  const createFile = async (name: string, parentId?: string): Promise<string> => {
    try {
      const newFileId = await createNewFile(name, parentId);
      await refreshFileTree();
      return newFileId;
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  };

  const createFolder = async (name: string, parentId?: string): Promise<string> => {
    try {
      const newFolderId = await createNewFolder(name, parentId);
      await refreshFileTree();
      return newFolderId;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string): Promise<void> => {
    try {
      await deleteFileOrFolder(id);
      await refreshFileTree();
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  return (
    <FileTreeContext.Provider
      value={{
        fileTree,
        isLoading,
        createFile,
        createFolder,
        deleteItem,
        refreshFileTree,
      }}
    >
      {children}
    </FileTreeContext.Provider>
  );
}

export function useFileTree() {
  const context = useContext(FileTreeContext);
  if (context === undefined) {
    throw new Error('useFileTree must be used within a FileTreeProvider');
  }
  return context;
}