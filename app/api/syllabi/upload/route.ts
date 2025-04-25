import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client
// Ensure these environment variables are set!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create a single Supabase client instance only if keys are present
// Note: It's generally better practice to handle this within the request handler
// to ensure context is available, but this prevents crashes at module load if needed.
const supabase = (supabaseUrl && supabaseServiceKey) 
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null; // Initialize as null if keys are missing

// Define the target bucket name
const BUCKET_NAME = 'syllabi-files';

export async function POST(request: Request) {
  // Critical Check: Ensure Supabase client is configured and available
  if (!supabase) {
    console.error('CRITICAL ERROR: Supabase client not initialized due to missing environment variables.');
    return NextResponse.json({ error: 'Server configuration error: Missing Supabase credentials.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const semester = formData.get('semester') as string | null;
    const professor = formData.get('professor') as string | null;
    const courseNumber = formData.get('courseNumber') as string | null;

    // --- Validation ---
    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 });
    }
    if (!semester || !professor || !courseNumber) {
      return NextResponse.json({ error: 'Missing required fields (semester, professor, courseNumber).' }, { status: 400 });
    }
    // Add size validation if needed (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) { // 5 MB limit
        return NextResponse.json({ error: 'File size cannot exceed 5MB.' }, { status: 400 });
    }

    // --- Determine next row_num --- Find the max row_num for this specific course number 
    const maxRowNumResult = await prisma.syllabi_links.aggregate({
        _max: { row_num: true },
    });
    const nextRowNum = (maxRowNumResult._max.row_num ?? BigInt(0)) + BigInt(1);

    // --- Upload to Supabase Storage ---
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // Sanitize inputs for filename components to prevent path traversal or invalid characters
    const sanitizedCourseNumber = courseNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedSemester = semester.replace(/[^a-zA-Z0-9-_\s]/g, '_');
    const sanitizedProfessor = professor.replace(/[^a-zA-Z0-9-_\s]/g, '_');
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');

    // Create a unique file path
    const filePath = `${sanitizedCourseNumber}/${sanitizedSemester}_${sanitizedProfessor}_${Date.now()}_${sanitizedFilename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false, // Don't overwrite existing files with the same name
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
    }

    // --- Get Public URL --- 
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
        console.error('Failed to get public URL for path:', filePath);
        // Consider cleanup: delete the uploaded file if we can't get URL? (More complex)
        throw new Error('Failed to get public URL for the uploaded file.');
    }
    const publicUrl = urlData.publicUrl;

    // --- Insert into Database --- 
    await prisma.syllabi_links.create({
      data: {
        row_num: nextRowNum,
        course_number: courseNumber,
        semester: semester,
        professor: professor,
        syllabus_link: publicUrl, // Store the public URL
      },
    });

    // --- Success Response --- 
    return NextResponse.json({ message: 'Syllabus uploaded successfully', url: publicUrl }, { status: 201 });

  } catch (error: any) {
    console.error('Upload API error:', error);
    // Disconnect Prisma client on error
    await prisma.$disconnect();
    return NextResponse.json({ error: error.message || 'Failed to upload syllabus.' }, { status: 500 });
  } finally {
     // Disconnect Prisma client after request finishes (success or fail)
     // NOTE: In serverless environments, managing connections might differ.
     // Consider Prisma Accelerate or Data Proxy for connection pooling.
     await prisma.$disconnect();
  }
} 