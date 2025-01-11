import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Course } from "@/types/Course";
import { memo } from "react";

interface CourseInfoDialogProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CourseInfoDialog = memo(function CourseInfoDialog({ course, isOpen, onClose }: CourseInfoDialogProps) {
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div>
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-background p-3 rounded-lg">
          <div className="h-4 w-16 bg-muted rounded animate-pulse mb-2" />
          <div className="h-6 w-24 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="bg-background p-3 rounded-lg">
          <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
          <div className="h-6 w-20 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>

      <div className="bg-background p-3 rounded-lg">
        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
        <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
      </div>

      <div className="bg-background p-3 rounded-lg">
        <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-card-foreground max-w-2xl mx-auto w-[95%] sm:w-[85%] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="text-lg flex justify-center font-bold">
            {course ? course.Course_Number : (
              <div className="h-7 w-36 bg-muted rounded animate-pulse" />
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 pb-6">
          {course ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{course.Title}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-background p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">SBCs</p>
                  <p className="text-lg font-semibold text-green-600">{course.SBCs.join()}</p>
                </div>
                <div className="bg-background p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Prerequisites:</p>
                  {course.Prerequisites ? 
                    <p className="text-md font-semibold text-blue-600">{course.Prerequisites}</p> : 
                    <p className="text-md font-semibold text-blue-600">None</p>
                  }
                </div>
              </div>

              <div className="bg-background p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-semibold">{course.Department}</p>
              </div>
              <div className="bg-background p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-semibold">{course.Description}</p>
              </div>
            </div>
          ) : (
            <LoadingSkeleton />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default CourseInfoDialog;