import React, { memo, useState, useEffect, useMemo } from 'react';
import { type professors } from "@prisma/client";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

/**
 * Props for the ProfessorCard component.
 * @property instructor - The name of the instructor.
 * @property isOpen - Boolean indicating if the accordion item is currently open.
 * @property onToggle - Callback function to toggle the accordion's open state.
 * @property professorRef - Callback ref function to attach a ref to the component's root div for scrolling.
 * @property professorId - Unique string ID for the component's root div, used for scrolling.
 */
interface ProfessorCardProps {
  instructor: string;
  isOpen: boolean;
  onToggle: (instructor: string | null) => void;
  professorRef: (el: HTMLDivElement | null) => void; // Prop to set the ref
  professorId: string; // Prop for the ID
}

/**
 * Custom Tooltip component for the professor rating distribution BarChart.
 * Displays the rating label (e.g., 'Awesome 5'), the count, and the percentage of total ratings.
 * 
 * @param active - Boolean indicating if the tooltip is active.
 * @param payload - Array containing the data payload for the hovered bar.
 * @param label - The label of the hovered bar (rating category name).
 * @param totalRatings - The total number of ratings for percentage calculation.
 * @returns JSX element for the tooltip or null if not active.
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
 * A memoized component that displays detailed information about a professor in a collapsible card.
 * 
 * Fetches professor data (including RMP details if available) from the backend API.
 * Displays key metrics like average rating, difficulty, and 'would take again' percentage.
 * Visualizes the rating distribution using a horizontal bar chart.
 * Controlled externally via `isOpen` and `onToggle` props for accordion behavior.
 * Provides a ref and ID for potential scrolling integration.
 * 
 * @param instructor - The name of the professor.
 * @param isOpen - Controls whether the accordion is open.
 * @param onToggle - Callback to change the accordion state.
 * @param professorRef - Callback ref for the component's root element.
 * @param professorId - ID for the component's root element.
 * @returns JSX element representing the professor card.
 */
export const ProfessorCard = memo(function ProfessorCard({ instructor, isOpen, onToggle, professorRef, professorId }: ProfessorCardProps) {
  const [professorData, setProfessorData] = useState<professors | null>(null);
  const [loadingProf, setLoadingProf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessorDataFromApi = async () => {
      if (!instructor || instructor === 'TBA') {
        setProfessorData(null);
        setError("Instructor name not available.");
        setLoadingProf(false);
        return;
      }
      setLoadingProf(true);
      setError(null);
      try {
        const response = await fetch(`/api/professors/${encodeURIComponent(instructor)}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setError(errorData.error || `Error: ${response.statusText} (${response.status})`);
          setProfessorData(null);
        } else {
          const data = await response.json();
          setProfessorData(data);
        }
      } catch (err) {
        console.error("Failed to fetch professor data:", err);
        setError("Failed to load professor data. Check network connection.");
        setProfessorData(null);
      } finally {
        setLoadingProf(false);
      }
    };

    fetchProfessorDataFromApi();
  }, [instructor]);

  const ratingData = useMemo(() => {
    if (!professorData) return [];
    return [
      { name: 'Awesome 5', count: professorData.rating_5_count ?? 0, color: '#4CAF50' }, // Green
      { name: 'Great 4', count: professorData.rating_4_count ?? 0, color: '#8BC34A' }, // Light Green
      { name: 'Good 3', count: professorData.rating_3_count ?? 0, color: '#FFEB3B' }, // Yellow
      { name: 'OK 2', count: professorData.rating_2_count ?? 0, color: '#FF9800' }, // Orange
      { name: 'Awful 1', count: professorData.rating_1_count ?? 0, color: '#F44336' }, // Red
    ];
  }, [professorData]);

  const totalRatings = useMemo(() => {
    return ratingData.reduce((sum, item) => sum + item.count, 0);
  }, [ratingData]);

  // Calculate the average rating manually
  const calculatedAvgRating = useMemo(() => {
    if (!professorData || totalRatings === 0) return null;

    const weightedSum = (
      (professorData.rating_5_count || 0) * 5 +
      (professorData.rating_4_count || 0) * 4 +
      (professorData.rating_3_count || 0) * 3 +
      (professorData.rating_2_count || 0) * 2 +
      (professorData.rating_1_count || 0) * 1
    );

    return weightedSum / totalRatings;
  }, [professorData, totalRatings]);

  const accordionValue = isOpen ? "professor-info" : undefined;

  return (
    <div ref={professorRef} id={professorId}>
      <Accordion
        type="single"
        collapsible
        className="w-full mb-2"
        value={accordionValue}
        onValueChange={(value) => {
          onToggle(value ? instructor : null);
        }}
      >
        <AccordionItem value="professor-info" className="border rounded-lg overflow-hidden">
          <AccordionTrigger className="bg-background px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
            <div className="flex justify-between items-center w-full">
              <p className="font-semibold">{instructor}</p>
              {loadingProf && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-background p-4">
            {error && <p className="text-sm text-destructive text-center py-4">{error}</p>}
            {professorData && (
              <div className="space-y-4">
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

                {totalRatings > 0 ? (
                  <div>
                    <h4 className="font-semibold mb-2 text-center">Rating Distribution ({totalRatings} ratings)</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                          <Tooltip content={<CustomTooltip totalRatings={totalRatings} />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
                          <Bar dataKey="count" barSize={20} radius={[4, 4, 4, 4]}>
                            {ratingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No rating distribution data available.</p>
                )}

                {professorData.rmp_link && (
                  <Button variant="link" asChild className="p-0 h-auto">
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