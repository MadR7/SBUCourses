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

/**
 * @interface SyllabiCardProps
 * Props for the SyllabiCard component.
 */
interface SyllabiCardProps {
  /**
   * The course number (e.g., "CSE310") for which to fetch and display syllabi.
   * Can be null or undefined if no course is currently selected in the parent component.
   */
  courseNumber: string | null | undefined;
}

/**
 * @interface SyllabusData
 * Represents the structure of a single syllabus entry as fetched from the API
 * or stored in the `syllabi` state.
 */
interface SyllabusData {
  /** A unique identifier for the syllabus entry (likely from the database). */
  row_num: bigint;
  /** The semester the course was offered (e.g., "Fall 2023"). */
  semester: string | null;
  /** The name of the professor who taught the course. */
  professor: string | null;
  /** The URL link to the syllabus PDF. */
  syllabus_link: string | null;
}

/**
 * @component SyllabiCard
 * A card component that displays past syllabi for a specific course and allows users to upload new ones.
 * It fetches data from the `/api/syllabi/[courseNumber]` endpoint.
 *
 * @param {SyllabiCardProps} props - The component props.
 * @param {string | null | undefined} props.courseNumber - The course number to display syllabi for.
 * @returns {React.ReactElement} The rendered SyllabiCard component.
 */
export const SyllabiCard: React.FC<SyllabiCardProps> = ({ courseNumber }) => {
  /** State to store the list of fetched syllabi. */
  const [syllabi, setSyllabi] = useState<SyllabusData[]>([]);
  /** State to indicate if syllabi data is currently being fetched from the API. */
  const [loading, setLoading] = useState(false);
  /** State to store any error messages during data fetching. */
  const [error, setError] = useState<string | null>(null);

  // --- Upload Form State --- 
  /** State to control the visibility of the syllabus upload form. */
  const [showUploadForm, setShowUploadForm] = useState(false);
  /** State for the semester input field in the upload form. */
  const [semesterInput, setSemesterInput] = useState('');
  /** State for the professor name input field in the upload form. */
  const [professorInput, setProfessorInput] = useState('');
  /** State to store the selected syllabus file for upload. */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  /** State to indicate if a syllabus file is currently being uploaded. */
  const [isUploading, setIsUploading] = useState(false);
  /** State to store any error messages during the upload process. */
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Fetches syllabi data for the given `courseNumber` from the `/api/syllabi/[courseNumber]` endpoint.
   * Uses useCallback to memoize the function and prevent unnecessary re-renders.
   * Handles loading states, errors (including 404 Not Found when no syllabi exist), 
   * and updates the `syllabi`, `loading`, and `error` states accordingly.
   */
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

  /**
   * Hook that triggers `fetchSyllabi` whenever the `courseNumber` prop changes.
   * This ensures that the syllabi list is updated when a new course is selected.
   */
  useEffect(() => {
    // Reset state when courseNumber changes before fetching new data
    setSyllabi([]);
    setError(null);
    setLoading(false);
    setShowUploadForm(false); // Hide upload form if it was open
    resetForm(); // Reset upload form fields as well

    // Only fetch if a valid course number is provided
    if (courseNumber) {
      fetchSyllabi();
    }
  }, [courseNumber, fetchSyllabi]); // Include fetchSyllabi in dependency array due to useCallback

  /**
   * Event handler for the file input element (`type="file"`).
   * Updates the `selectedFile` state with the first file selected by the user.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  /**
   * Resets the upload form fields (semester, professor, file) and associated state 
   * (selectedFile, uploadError, isUploading) to their initial values.
   * Also hides the upload form by setting `showUploadForm` to false.
   */
  const resetForm = useCallback(() => {
    setSemesterInput('');
    setProfessorInput('');
    setSelectedFile(null);
    setUploadError(null);
    setShowUploadForm(false);
    setIsUploading(false);
    // Clear the file input visually if needed (can be tricky)
    const fileInput = document.getElementById('syllabus-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }, []);

  /**
   * Sends a POST request to the `/api/upload-syllabus` endpoint with the form data.
   * Handles loading states (`isUploading`), success (refreshes syllabi list, resets form),
   * and errors (`uploadError`) during the upload process.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   */
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

  return (
    <div className="p-1"> {/* Main container */} 
      {/* Loading State */} 
      {loading && (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading syllabi...</span>
        </div>
      )}

      {/* Button to toggle upload form visibility */} 
      {!loading && !error && !showUploadForm && (
        <Button variant="outline" size="sm" onClick={() => setShowUploadForm(true)} className="w-full mt-2 mb-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Upload New Syllabus
        </Button>
      )}

      {/* Upload Form (conditionally rendered) */} 
      {showUploadForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/30 mb-4">
          {/* Form Header */} 
          <h3 className="font-semibold text-lg mb-3">Upload Syllabus</h3>
          {/* Semester Input */} 
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
          {/* Professor Input */} 
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
          {/* File Input */} 
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

          {/* Upload Error Display */} 
          {uploadError && (
            <div className="flex items-center text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Form Action Buttons (Cancel/Submit) */} 
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
      {/* Message when no syllabi are found and upload form isn't shown */} 
      {syllabi.length === 0 && !showUploadForm && (
        <div className="text-center py-4 text-muted-foreground">
          No past syllabi found for this course.
        </div>
      )}

      {/* Renders the list of fetched syllabi */} 
      {syllabi.length > 0 && (
        <div className="space-y-2 pt-4 border-t">
          {syllabi.map((syllabus) => (
            // Individual syllabus item 
            <div key={syllabus.row_num.toString()} className="bg-background p-3 rounded-lg border">
              <div className="flex justify-between items-center">
                <div>
                  {/* Semester */} 
                  <p className="font-medium">
                    {syllabus.semester || 'Unknown Semester'}
                  </p>
                  {/* Professor */} 
                  <p className="text-sm text-muted-foreground">
                    Prof: {syllabus.professor || 'Unknown'}
                  </p>
                </div>
                {/* Link to view syllabus */} 
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