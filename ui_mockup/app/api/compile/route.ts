import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

let watchProcess: any = null;

export async function POST(request: NextRequest) {
  try {
    const { documentId, content } = await request.json();
    
    const inputFile = path.join(process.cwd(), 'temp', `${documentId}.typ`);
    const outputFile = path.join(process.cwd(), 'temp', `${documentId}.pdf`);

    await fs.mkdir(path.join(process.cwd(), 'temp'), { recursive: true });
    
    await fs.writeFile(inputFile, content);

    if (watchProcess) {
      watchProcess.kill();
    }

    watchProcess = spawn('typst', ['watch', inputFile, outputFile], {
      stdio: 'pipe',
    });

    watchProcess.stdout.on('data', (data: Buffer) => {
      console.log(`Typst output: ${data}`);
    });

    watchProcess.stderr.on('data', (data: Buffer) => {
      console.error(`Typst error: ${data}`);
    });

    watchProcess.on('close', (code: number) => {
      console.log(`Typst watcher exited with code ${code}`);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to compile document' },
      { status: 500 }
    );
  }
}
