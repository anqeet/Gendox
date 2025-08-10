'use client';

import { useState } from 'react';
import { Folder, File, Upload, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useFileTree } from '@/lib/contexts/file-tree-context';
import { useEditor } from '@/lib/contexts/editor-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FileUploader from '@/components/editor/file-uploader';

export default function Sidebar() {
  const { fileTree, createFile, createFolder, deleteItem } = useFileTree();
  const { openDocument } = useEditor();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [newItemName, setNewItemName] = useState('');

  const handleCreate = async () => {
    if (!newItemName) return;
    
    try {
      if (newItemType === 'file') {
        const fileName = !newItemName.endsWith('.typ') ? `${newItemName}.typ` : newItemName;
        const fileId = await createFile(fileName);
        await openDocument(fileId);
      } else {
        await createFolder(newItemName);
      }
      
      setNewItemName('');
      setNewItemDialogOpen(false);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleFileClick = async (id: string, type: 'file' | 'folder', name: string) => {
    if (type === 'file' && name.endsWith('.typ')) {
      try {
        await openDocument(id);
      } catch (error) {
        console.error('Error opening document:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="font-semibold">Project Files</h2>
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setNewItemType('file');
                setNewItemDialogOpen(true);
              }}>
                <File className="h-4 w-4 mr-2" />
                New File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setNewItemType('folder');
                setNewItemDialogOpen(true);
              }}>
                <Folder className="h-4 w-4 mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {fileTree.map((item) => (
            <FileTreeItem
              key={item.id}
              item={item}
              onItemClick={handleFileClick}
              onDeleteItem={deleteItem}
              level={0}
            />
          ))}
        </div>
      </ScrollArea>
      
      <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {newItemType === 'file' ? 'Create New File' : 'Create New Folder'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={newItemType === 'file' ? 'filename.typ' : 'folder name'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <FileUploader onUploadComplete={() => setUploadDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface FileTreeItemProps {
  item: {
    id: string;
    name: string;
    type: 'file' | 'folder';
    children?: Array<{
      id: string;
      name: string;
      type: 'file' | 'folder';
      children?: any[];
    }>;
  };
  onItemClick: (id: string, type: 'file' | 'folder', name: string) => void;
  onDeleteItem: (id: string) => void;
  level: number;
}

function FileTreeItem({ item, onItemClick, onDeleteItem, level }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteItem(item.id);
  };
  
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.typ')) return <File className="h-4 w-4 text-blue-500" />;
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return <File className="h-4 w-4 text-green-500" />;
    if (fileName.match(/\.(svg)$/i)) return <File className="h-4 w-4 text-orange-500" />;
    return <File className="h-4 w-4" />;
  };
  
  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 rounded-md hover:bg-muted cursor-pointer ${
          level > 0 ? 'ml-4' : ''
        }`}
        onClick={() => onItemClick(item.id, item.type, item.name)}
      >
        <div className="flex items-center flex-1 overflow-hidden" onClick={handleToggle}>
          {item.type === 'folder' ? (
            <Folder className={`h-4 w-4 mr-2 ${isOpen ? 'text-blue-500' : 'text-muted-foreground'}`} />
          ) : (
            getFileIcon(item.name)
          )}
          <span className="text-sm truncate mr-2">{item.name}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={handleDelete}>
          <Trash className="h-3 w-3" />
        </Button>
      </div>
      
      {item.type === 'folder' && isOpen && item.children && item.children.length > 0 && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.id}
              item={child}
              onItemClick={onItemClick}
              onDeleteItem={onDeleteItem}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
