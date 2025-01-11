"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Course } from "@/types/Course";

interface CourseInfoDialogProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CourseInfoDialog({ course, isOpen, onClose }: CourseInfoDialogProps) {
  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{course.Course_Number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">{course.Title}</h3>
            {/* <p className="text-sm text-muted-foreground">{course.instructor}</p> */}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">SBCs</p>
              <p className="text-lg font-semibold text-green-600">{course.SBCs.join()}</p>
            </div>
            <div className="bg-background p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Prerequisites:</p>
              {course.Prerequisites ? <p className="text-md font-semibold text-blue-600">{course.Prerequisites}</p>: <p className="text-md font-semibold text-blue-600">None</p>}
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
      </DialogContent>
    </Dialog>
  );
}