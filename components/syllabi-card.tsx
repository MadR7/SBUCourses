import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ExternalLink, AlertCircle, PlusCircle, UploadCloud } from 'lucide-react';
import { type syllabi_links } from '@prisma/client'; // Assuming types are generated
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input component
import { Label } from '@/components/ui/label'; // Import Label component
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface SyllabiCardProps {
  courseNumber: string | null | undefined;
}

// Define a more specific type for the data fetched from the API
interface SyllabusData {
  row_num: bigint;
  semester: string | null;
  professor: string | null;
  syllabus_link: string | null;
}

export const SyllabiCard: React.FC<SyllabiCardProps> = ({ courseNumber }) => {
  const [syllabi, setSyllabi] = useState<SyllabusData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for upload form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [semesterInput, setSemesterInput] = useState('');
  const [professorInput, setProfessorInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchSyllabi = useCallback(async () => {
    if (!courseNumber) {
      setError('Course number not provided.');
      setLoading(false);
      setSyllabi([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/syllabi/${encodeURIComponent(courseNumber)}`);
      
      // Attempt to parse JSON regardless of status code initially
      // This is important because even a 404 might have a JSON body { message: "..." }
      let data;
      try {
          data = await response.json();
      } catch (jsonError) {
          // If JSON parsing fails (e.g., empty response or non-JSON), handle it
          if (!response.ok) {
              // If response wasn't OK and JSON failed, throw based on status text
              throw new Error(`Error: ${response.statusText} (${response.status})`);
          }
          // If response was OK but JSON parsing failed (shouldn't usually happen with Next.js API routes)
          console.warn("JSON parsing failed for an OK response status.");
          data = null; // Or handle as appropriate
      }

      // Handle specific 404 "Not Found" as empty data, not an error
      if (response.status === 404) {
        setSyllabi([]);
        // We don't throw an error here, let it proceed to finally
      } else if (!response.ok) {
        // Handle other non-OK statuses as errors
        throw new Error(data?.message || data?.error || `Error: ${response.statusText} (${response.status})`);
      } else {
        // If response is OK (2xx) and data is available
        const formattedData = (data || []).map((item: any) => ({ ...item, row_num: BigInt(item.row_num) }));
        setSyllabi(formattedData as SyllabusData[]);
      }

    } catch (err: any) {
      console.error('Failed to fetch syllabi:', err);
      setError(err.message || 'Failed to load syllabi data.');
      setSyllabi([]);
    } finally {
      setLoading(false);
    }
  }, [courseNumber]);

  useEffect(() => {
    fetchSyllabi();
  }, [fetchSyllabi]); // Use the memoized fetchSyllabi function

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const resetForm = () => {
    setSemesterInput('');
    setProfessorInput('');
    setSelectedFile(null);
    setUploadError(null);
    setShowUploadForm(false);
    setIsUploading(false);
    // Clear the file input visually if needed (can be tricky)
    const fileInput = document.getElementById('syllabus-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || !courseNumber || !semesterInput || !professorInput) {
      setUploadError('Please fill in all fields and select a PDF file.');
      return;
    }
    if (selectedFile.type !== 'application/pdf') {
      setUploadError('Please select a PDF file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('semester', semesterInput);
    formData.append('professor', professorInput);
    formData.append('courseNumber', courseNumber);

    try {
      const response = await fetch('/api/syllabi/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Upload failed: ${response.statusText}`);
      }

      // Success!
      resetForm();
      await fetchSyllabi(); // Refresh the list

    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading syllabi...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-destructive">
         <div className="flex items-center">
             <AlertCircle className="w-5 h-5 mr-2" />
             <span>{error}</span>
         </div>
         <Button variant="outline" size="sm" onClick={fetchSyllabi} className="mt-2">
             Retry
         </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Section Toggle Button */}
      {!showUploadForm && (
        <Button variant="outline" onClick={() => setShowUploadForm(true)} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Syllabus
        </Button>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <h3 className="font-semibold text-lg mb-3">Upload Syllabus</h3>
          <div className="grid w-full max-w-sm items-center gap-1.5">
             <Label htmlFor="semester">Semester (e.g., Fall 2024)</Label>
             <Input
                 type="text"
                 id="semester"
                 placeholder="Fall 2024"
                 value={semesterInput}
                 onChange={(e) => setSemesterInput(e.target.value)}
                 required
                 disabled={isUploading}
             />
           </div>
           <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="professor">Professor Name</Label>
              <Input
                  type="text"
                  id="professor"
                  placeholder="Jane Doe"
                  value={professorInput}
                  onChange={(e) => setProfessorInput(e.target.value)}
                  required
                  disabled={isUploading}
              />
           </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="syllabus-file-input">Syllabus PDF File</Label>
            <Input
              id="syllabus-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {selectedFile && <p className="text-sm text-muted-foreground mt-1">Selected: {selectedFile.name}</p>}
          </div>

          {uploadError && (
            <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={resetForm} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedFile || isUploading || !semesterInput || !professorInput}>
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><UploadCloud className="mr-2 h-4 w-4" /> Submit Syllabus</>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Existing Syllabi List */}
      {syllabi.length === 0 && !showUploadForm && (
        <div className="text-center py-4 text-muted-foreground">
          No past syllabi found for this course.
        </div>
      )}

      {syllabi.length > 0 && (
           <div className="space-y-2 pt-4 border-t">
             {syllabi.map((syllabus) => (
                 <div key={syllabus.row_num.toString()} className="bg-background p-3 rounded-lg border">
                 <div className="flex justify-between items-center">
                     <div>
                     <p className="font-medium">
                         {syllabus.semester || 'Unknown Semester'}
                     </p>
                     <p className="text-sm text-muted-foreground">
                         Prof: {syllabus.professor || 'Unknown'}
                     </p>
                     </div>
                     {syllabus.syllabus_link && (
                     <Button variant="outline" size="sm" asChild>
                         <a href={syllabus.syllabus_link} target="_blank" rel="noopener noreferrer">
                         View Syllabus
                         <ExternalLink className="ml-2 h-4 w-4" />
                         </a>
                     </Button>
                     )}
                 </div>
                 </div>
             ))}
           </div>
      )}
    </div>
  );
};

export default SyllabiCard; 