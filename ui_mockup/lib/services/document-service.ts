'use client';

export interface DocumentMetadata {
  id: string;
  name: string;
  lastModified: Date;
}

// Fetch a document by ID
export async function fetchDocument(id: string) {
  try {
    const response = await fetch(`/api/documents/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }
    const data = await response.json();
    
    // Get file details from local storage
    const fileSystem = JSON.parse(localStorage.getItem('typst_file_system') || '[]');
    const fileDetails = fileSystem.find((file: any) => file.id === id);
    
    if (!fileDetails) {
      throw new Error('Document not found');
    }
    
    return {
      id,
      name: fileDetails.name,
      content: data.content,
      lastModified: new Date(fileDetails.updatedAt),
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}

// Save document content
export async function saveDocumentContent(id: string, content: string) {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to save document');
    }
    
    // Update lastModified in local storage
    const fileSystem = JSON.parse(localStorage.getItem('typst_file_system') || '[]');
    const fileIndex = fileSystem.findIndex((file: any) => file.id === id);
    
    if (fileIndex >= 0) {
      fileSystem[fileIndex].updatedAt = new Date();
      localStorage.setItem('typst_file_system', JSON.stringify(fileSystem));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

// Cleanup when document is closed
export async function closeDocument(id: string) {
  try {
    await fetch(`/api/documents/${id}/close`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error closing document:', error);
  }
}
