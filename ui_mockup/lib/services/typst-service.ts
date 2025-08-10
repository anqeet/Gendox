'use client';

let compileTimeout: NodeJS.Timeout | null = null;

export async function startTypstWatcher(documentId: string): Promise<void> {
  try {
    const response = await fetch(`/api/compile/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start typst watcher');
    }
  } catch (error) {
    console.error('Error starting typst watcher:', error);
    throw error;
  }
}

export async function stopTypstWatcher() {
  try {
    await fetch('/api/compile/stop', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error stopping typst watcher:', error);
  }
}

export async function compileDocument(documentId: string): Promise<boolean> {
  try {
    // Debounce compile requests
    if (compileTimeout) {
      clearTimeout(compileTimeout);
    }

    return new Promise((resolve) => {
      compileTimeout = setTimeout(async () => {
        const content = localStorage.getItem(`typst_file_content_${documentId}`) || '';
        
        const response = await fetch('/api/compile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId, content }),
        });

        if (!response.ok) {
          throw new Error('Failed to compile document');
        }

        resolve(true);
      }, 500);
    });
  } catch (error) {
    console.error('Error compiling document:', error);
    throw error;
  }
}