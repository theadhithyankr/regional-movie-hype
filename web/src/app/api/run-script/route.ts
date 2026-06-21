import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  try {
    const { script } = await request.json();

    // Whitelist allowed scripts
    const allowedScripts = ['analyzer.py', 'yt_collector.py', 'collector.py', 'master_pipeline.py'];
    if (!allowedScripts.includes(script)) {
      return NextResponse.json({ error: 'Invalid script name' }, { status: 400 });
    }

    // Determine the root directory path (one level up from web/)
    const rootDir = path.resolve(process.cwd(), '../');

    // For collector.py and master_pipeline.py (which runs a long time), we just spawn it and return immediately.
    // For others, we wait for completion.
    if (script === 'collector.py' || script === 'master_pipeline.py') {
      const scriptPath = path.join(process.cwd(), '..', script);
      const rootDir = path.join(process.cwd(), '..');

      exec(`python "${scriptPath}"`, { cwd: rootDir }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing ${script}:`, error);
          console.error(`Stderr:`, stderr);
          return;
        }
        console.log(`${script} output:`, stdout);
      });

      return NextResponse.json({ success: true, message: `${script} started successfully in the background` });
    }

    // Execute the script and wait for it
    const { stdout, stderr } = await execPromise(`python ${script}`, { cwd: rootDir });

    return NextResponse.json({ 
      message: 'Script executed successfully', 
      output: stdout,
      errors: stderr 
    });

  } catch (error: any) {
    console.error(`Script Execution Error:`, error);
    return NextResponse.json({ error: error.message || 'Script failed' }, { status: 500 });
  }
}
