import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  try {
    const pdfPath = path.join(process.cwd(), 'temp', `${id}.pdf`);
    
    try {
      const pdfBuffer = await fs.readFile(pdfPath);
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="document-${id}.pdf"`,
        },
      });
    } catch (error) {
      // If PDF doesn't exist yet
      return NextResponse.json(
        { error: 'PDF not found, please compile the document' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Failed to serve PDF' },
      { status: 500 }
    );
  }
}