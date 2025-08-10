'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { 
  FileText, 
  Save, 
  Download, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';
import { useEditor } from '@/lib/contexts/editor-context';
import { compileDocument } from '@/lib/services/typst-service';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
  const { currentDocument, saveDocument } = useEditor();
  const { toast } = useToast();
  const [isCompiling, setIsCompiling] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCompile = async () => {
    if (!currentDocument) {
      toast({
        title: 'No document to compile',
        description: 'Please create or select a document first.',
        variant: 'destructive',
      });
      return;
    }

    setIsCompiling(true);
    try {
      await compileDocument(currentDocument.id);
      toast({
        title: 'Compilation successful',
        description: 'Your document has been compiled.',
      });
    } catch (error) {
      toast({
        title: 'Compilation failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSave = async () => {
    if (!currentDocument) {
      toast({
        title: 'No document to save',
        description: 'Please create or select a document first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveDocument();
      toast({
        title: 'Document saved',
        description: 'Your document has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="h-14 border-b px-4 flex items-center justify-between bg-background">
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Typst Web Editor</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] sm:w-[300px]">
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">Typst Web Editor</span>
              </div>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={handleSave}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={handleCompile}
                disabled={isCompiling}
              >
                <Download className="mr-2 h-4 w-4" />
                Compile
              </Button>
              <Button variant="outline" className="justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <div className="mt-auto">
                <ModeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="hidden md:flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSave}
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCompile}
          disabled={isCompiling}
        >
          <Download className="mr-2 h-4 w-4" />
          Compile
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}