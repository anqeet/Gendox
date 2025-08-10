import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(process.cwd(), 'temp', `${params.id}.typ`);
    const content = await fs.readFile(filePath, 'utf-8');
    
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content } = await request.json();
    const filePath = path.join(process.cwd(), 'temp', `${params.id}.typ`);
    
    await fs.mkdir(path.join(process.cwd(), 'temp'), { recursive: true });
    await fs.writeFile(filePath, content);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save document' },
      { status: 500 }
    );
  }
}