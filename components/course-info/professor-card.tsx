import React, { memo, useState, useEffect, useMemo } from 'react';
import { type professors } from "@prisma/client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

/**
 * Props for the ProfessorCard component.
 *
 * @interface ProfessorCardProps
 * @property {string} instructor - The name of the instructor.
 * @property {boolean} isOpen - Whether the accordion item for this professor is open.
 * @property {(instructor: string | null) => void} onToggle - Callback function to open/close the accordion item. Passes the instructor name or null.
 * @property {(el: HTMLDivElement | null) => void} professorRef - Callback function to set a ref for the root div element, used for scrolling.
 * @property {string} professorId - The unique ID to assign to the root div element, used for scrolling.
 */
interface ProfessorCardProps {
  instructor: string;
  isOpen: boolean;
  onToggle: (instructor: string | null) => void;
  professorRef: (el: HTMLDivElement | null) => void;
  professorId: string;
}

/**
 * Custom Tooltip component for the rating distribution BarChart.
 * Displays the rating label, count, and percentage.
 *
 * @param {any} props - Props passed by Recharts Tooltip component.
 * @param {boolean} props.active - Whether the tooltip is active.
 * @param {Array<object>} props.payload - Data payload for the hovered bar.
 * @param {string} props.label - The label of the hovered bar (e.g., 'Awesome 5').
 * @param {number} props.totalRatings - Total number of ratings for calculating percentage.
 * @returns {JSX.Element | null} The rendered tooltip or null if not active.
 */
const CustomTooltip = ({ active, payload, label, totalRatings }: any) => {
  if (active && payload && payload.length) {
    const percentage = totalRatings > 0 ? ((payload[0].value / totalRatings) * 100).toFixed(1) : 0;
    return (
      <div className="bg-background p-2 border rounded shadow-lg">
        <p className="font-semibold">{`${label}`}</p>
        <p className="text-sm text-muted-foreground">{`Count: ${payload[0].value}`}</p>
        <p className="text-sm text-muted-foreground">{`Percentage: ${percentage}%`}</p>
      </div>
    );
  }
  return null;
};

/**
 * A memoized card component displaying detailed information about a specific professor.
 * Fetches data from an API based on the instructor's name. Shows average rating,
 * difficulty, 'would take again' percentage, a rating distribution chart, and a
 * link to RateMyProfessors. The card is implemented as a collapsible Accordion item.
 *
 * @component
 * @param {ProfessorCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered ProfessorCard component.
 */
export const ProfessorCard = memo(function ProfessorCard({ instructor, isOpen, onToggle, professorRef, professorId }: ProfessorCardProps) {
  // State for storing fetched professor data
  const [professorData, setProfessorData] = useState<professors | null>(null);
  // State for loading indicator while fetching data
  const [loadingProf, setLoadingProf] = useState(false);
  // State for storing any fetch errors
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect to fetch professor data from the API when the `instructor` prop changes.
   * Handles 'TBA' case, loading state, and error handling.
   */
  useEffect(() => {
    /** Fetches professor details from the backend API. */
    const fetchProfessorDataFromApi = async () => {
      // Avoid fetching if instructor is not provided or is 'TBA'
      if (!instructor || instructor === 'TBA') {
        setProfessorData(null);
        setError("Instructor name not available.");
        setLoadingProf(false);
        return;
      }
      // Reset state and start loading
      setLoadingProf(true);
      setError(null);
      setProfessorData(null); // Clear previous data
      try {
        // Fetch data from the API endpoint
        const response = await fetch(`/api/professors/${encodeURIComponent(instructor)}`);

        if (!response.ok) {
          // Try to parse error message from response body
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || `Error fetching data: ${response.statusText} (${response.status})`);
        } else {
          // Set professor data on successful fetch
          const data = await response.json();
          setProfessorData(data);
        }
      } catch (err) {
        console.error("Failed to fetch professor data:", err);
        setError("Failed to load professor data. Check network connection.");
        setProfessorData(null);
      } finally {
        // Stop loading indicator regardless of outcome
        setLoadingProf(false);
      }
    };

    // Trigger the fetch operation
    fetchProfessorDataFromApi();
  }, [instructor]); // Dependency array ensures effect runs when instructor name changes

  /**
   * Memoized calculation of data formatted for the rating distribution BarChart.
   * @returns {Array<{name: string, count: number, color: string}>} Data array for the chart.
   */
  const ratingData = useMemo(() => {
    if (!professorData) return [];
    // Map raw counts to objects with name, count, and color
    return [
      { name: 'Awesome 5', count: professorData.rating_5_count ?? 0, color: '#4CAF50' }, // Green
      { name: 'Great 4', count: professorData.rating_4_count ?? 0, color: '#8BC34A' }, // Light Green
      { name: 'Good 3', count: professorData.rating_3_count ?? 0, color: '#FFEB3B' }, // Yellow
      { name: 'OK 2', count: professorData.rating_2_count ?? 0, color: '#FF9800' }, // Orange
      { name: 'Awful 1', count: professorData.rating_1_count ?? 0, color: '#F44336' }, // Red
    ];
  }, [professorData]);

  /**
   * Memoized calculation of the total number of ratings.
   * @returns {number} Total ratings count.
   */
  const totalRatings = useMemo(() => {
    return ratingData.reduce((sum, item) => sum + item.count, 0);
  }, [ratingData]);

  /**
   * Memoized calculation of the weighted average rating based on individual counts.
   * Returns null if no data or ratings are available.
   * @returns {number | null} Calculated average rating or null.
   */
  const calculatedAvgRating = useMemo(() => {
    if (!professorData || totalRatings === 0) return null;

    // Calculate weighted sum: (rating_5 * 5) + (rating_4 * 4) + ...
    const weightedSum = (
      (professorData.rating_5_count || 0) * 5 +
      (professorData.rating_4_count || 0) * 4 +
      (professorData.rating_3_count || 0) * 3 +
      (professorData.rating_2_count || 0) * 2 +
      (professorData.rating_1_count || 0) * 1
    );

    // Calculate average
    return weightedSum / totalRatings;
  }, [professorData, totalRatings]);

  // Determine the value prop for the Accordion based on the isOpen state
  const accordionValue = isOpen ? "professor-info" : undefined;

  return (
    // Root div with ref and ID for potential scrolling
    <div ref={professorRef} id={professorId}>
      <Accordion
        type="single"
        collapsible
        className="w-full mb-2"
        value={accordionValue} // Controlled accordion based on isOpen prop
        onValueChange={(value) => {
          // Call onToggle callback when the accordion state changes
          onToggle(value ? instructor : null);
        }}
      >
        <AccordionItem value="professor-info" className="border rounded-lg overflow-hidden">
          {/* Accordion Trigger displays instructor name and loading spinner */}
          <AccordionTrigger className="bg-background px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
            <div className="flex justify-between items-center w-full">
              <p className="font-semibold">{instructor}</p>
              {/* Show loader only when fetching data */}
              {loadingProf && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
            </div>
          </AccordionTrigger>
          {/* Accordion Content displays professor details or error message */}
          <AccordionContent className="bg-background p-4">
            {/* Display error message if fetch failed */}
            {error && <p className="text-sm text-destructive text-center py-4">{error}</p>}
            {/* Display professor data if successfully fetched */}
            {professorData && !error && (
              <div className="space-y-4">
                {/* Grid layout for key stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                    <p className="text-lg font-bold text-primary">
                      {calculatedAvgRating !== null ? calculatedAvgRating.toFixed(1) : 'N/A'}
                      <span className="text-xs font-normal"> / 5.0</span>
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className="text-lg font-bold text-primary">
                      {professorData.difficulty_avg?.toFixed(1) ?? 'N/A'}
                      <span className="text-xs font-normal"> / 5.0</span>
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg col-span-2 md:col-span-1">
                    <p className="text-xs text-muted-foreground">Would Take Again</p>
                    <p className="text-lg font-bold text-primary">
                      {professorData.would_take_again_percent?.toFixed(0) ?? 'N/A'}%
                    </p>
                  </div>
                </div>

                {/* Rating Distribution Chart */}
                {totalRatings > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-2 text-center">Rating Distribution ({totalRatings} ratings)</h4>
                    <div className="h-64"> {/* Fixed height container for the chart */}
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis type="number" hide /> {/* Hide X-axis labels */}
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} /> {/* Category labels */}
                          <Tooltip content={<CustomTooltip totalRatings={totalRatings} />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} /> {/* Custom tooltip */}
                          <Bar dataKey="count" barSize={20} radius={[4, 4, 4, 4]}> {/* Rating counts */}
                            {/* Apply colors to bars */}
                            {ratingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  // Message if no rating data is available
                  <p className="text-sm text-muted-foreground text-center">No rating distribution data available.</p>
                )}

                {/* Link to RateMyProfessors */}
                {professorData.rmp_link && (
                  <Button variant="link" asChild className="p-0 h-auto mt-2"> {/* Added margin-top */}
                    <a href={professorData.rmp_link} target="_blank" rel="noopener noreferrer">
                      View on RateMyProfessors
                    </a>
                  </Button>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});

export default ProfessorCard;