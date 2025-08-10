import { v4 as uuidv4 } from 'uuid';

export interface FileMetadata {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

let fileSystem: FileMetadata[] = [];

export async function initializeFileSystem() {
  if (typeof window === 'undefined') return; // Skip on server
  
  // Check if we already have a file system in localStorage
  const storedFs = localStorage.getItem('typst_file_system');
  
  if (storedFs) {
    fileSystem = JSON.parse(storedFs);
    return;
  }
  
  // Create a default structure
  const mainFolderId = uuidv4();
  const now = new Date();
  
  fileSystem = [
    {
      id: mainFolderId,
      name: 'My Project',
      type: 'folder',
      parentId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      name: 'main.typ',
      type: 'file',
      parentId: mainFolderId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      name: 'images',
      type: 'folder',
      parentId: mainFolderId,
      createdAt: now,
      updatedAt: now,
    }
  ];
  
  saveFileSystem();
}

// Helper to save the file system to localStorage
function saveFileSystem() {
  if (typeof window === 'undefined') return; // Skip on server
  localStorage.setItem('typst_file_system', JSON.stringify(fileSystem));
}

// Fetch the file tree structure
export async function fetchFileTree() {
  await initializeFileSystem();
  
  // Convert flat structure to tree
  const buildTree = (parentId: string | null) => {
    return fileSystem
      .filter(item => item.parentId === parentId)
      .map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        ...(item.type === 'folder' && { children: buildTree(item.id) })
      }));
  };
  
  return buildTree(null);
}

// Create a new file
export async function createNewFile(name: string, parentId: string | null = null): Promise<string> {
  const id = uuidv4();
  const now = new Date();
  
  const newFile: FileMetadata = {
    id,
    name,
    type: 'file',
    parentId,
    createdAt: now,
    updatedAt: now,
  };
  
  fileSystem.push(newFile);
  saveFileSystem();
  
  // Create empty content for the file
  if (typeof window !== 'undefined') {
    localStorage.setItem(`typst_file_content_${id}`, '');
  }
  
  return id;
}

// Create a new folder
export async function createNewFolder(name: string, parentId: string | null = null): Promise<string> {
  const id = uuidv4();
  const now = new Date();
  
  const newFolder: FileMetadata = {
    id,
    name,
    type: 'folder',
    parentId,
    createdAt: now,
    updatedAt: now,
  };
  
  fileSystem.push(newFolder);
  saveFileSystem();
  
  return id;
}

// Delete a file or folder
export async function deleteFileOrFolder(id: string): Promise<void> {
  // Get all child items recursively (for folders)
  const getAllChildIds = (parentId: string): string[] => {
    const directChildren = fileSystem.filter(item => item.parentId === parentId);
    
    return [
      ...directChildren.map(child => child.id),
      ...directChildren
        .filter(child => child.type === 'folder')
        .flatMap(folder => getAllChildIds(folder.id))
    ];
  };
  
  const idsToDelete = [id, ...getAllChildIds(id)];
  
  // Remove from the file system
  fileSystem = fileSystem.filter(item => !idsToDelete.includes(item.id));
  saveFileSystem();
  
  // Remove content from localStorage
  if (typeof window !== 'undefined') {
    idsToDelete.forEach(itemId => {
      localStorage.removeItem(`typst_file_content_${itemId}`);
    });
  }
}

export async function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Read file content
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        // Create file metadata
        const fileId = await createNewFile(file.name);
        
        if (typeof window !== 'undefined' && event.target?.result) {
          localStorage.setItem(`typst_file_content_${fileId}`, 
            typeof event.target.result === 'string' 
              ? event.target.result 
              : '[binary data]'
          );
        }
        
        resolve(fileId);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    if (file.type.startsWith('text/') || file.name.endsWith('.typ')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
}

export async function getFileDetails(id: string): Promise<FileMetadata | null> {
  const file = fileSystem.find(item => item.id === id);
  return file || null;
}
