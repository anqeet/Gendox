'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader2, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileTree } from '@/lib/contexts/file-tree-context';
import { uploadFile } from '@/lib/services/file-service';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  onUploadComplete?: () => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const { refreshFileTree } = useFileTree();
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
  }>>([]);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));
    
    setUploadingFiles(prev => [...prev, ...newFiles]);
    
    for (let i = 0; i < newFiles.length; i++) {
      const fileItem = newFiles[i];
      
      try {
        setUploadingFiles(prev => prev.map(item => 
          item.file === fileItem.file 
            ? { ...item, status: 'uploading', progress: 10 } 
            : item
        ));
        
        // Mock progress updates
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(item => 
            item.file === fileItem.file && item.progress < 90
              ? { ...item, progress: item.progress + 10 } 
              : item
          ));
        }, 300);
        
        await uploadFile(fileItem.file);
        
        clearInterval(progressInterval);
        
        setUploadingFiles(prev => prev.map(item => 
          item.file === fileItem.file 
            ? { ...item, status: 'success', progress: 100 } 
            : item
        ));
      } catch (error) {
        setUploadingFiles(prev => prev.map(item => 
          item.file === fileItem.file 
            ? { ...item, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' } 
            : item
        ));
      }
    }
    
    // Refresh file tree after all uploads
    await refreshFileTree();
    if (onUploadComplete) {
      onUploadComplete();
    }
  }, [refreshFileTree, onUploadComplete]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'text/plain': ['.txt', '.typ'],
    }
  });
  
  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          or click to browse
        </p>
        <Button type="button" variant="secondary" size="sm">
          Select Files
        </Button>
      </div>
      
      {uploadingFiles.length > 0 && (
        <div className="space-y-3 mt-4">
          <h3 className="text-sm font-medium">Uploads</h3>
          {uploadingFiles.map((item, index) => (
            <div key={index} className="bg-card rounded-md p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  {item.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {item.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  <span className="truncate max-w-[180px]">{item.file.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {(item.file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <Progress value={item.progress} className="h-1 w-full" />
              {item.status === 'error' && (
                <p className="text-xs text-red-500">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}