import { Loader2 } from 'lucide-react'

export default function LoadingCourses() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-3xl md:text-5xl font-semibold mb-4">Loading Courses</h2>
      <Loader2 className="h-20 w-40 md:h-40 md:w-40 text-primary animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading courses</span>
    </div>
  )
}

