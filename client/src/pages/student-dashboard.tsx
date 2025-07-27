import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function StudentDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/student/enrollments"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/student/stats"],
  });

  const enrollMutation = useMutation({
    mutationFn: (courseId: string) => apiRequest("POST", `/api/courses/${courseId}/enroll`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/student/stats"] });
      toast({
        title: "Enrolled successfully",
        description: "You have been enrolled in the course!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Enrollment failed",
        description: error.message || "Unable to enroll in course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEnroll = (courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    enrollMutation.mutate(courseId);
  };

  // Check if user is enrolled in a specific course
  const isEnrolled = (courseId: string) => {
    return enrollments?.some((enrollment: any) => enrollment.id === courseId) || false;
  };

  if (coursesLoading || enrollmentsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-dark mb-2">Student Dashboard</h2>
          <p className="text-neutral-medium">Explore learning materials and track your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-medium">Courses Enrolled</p>
                  <p className="text-2xl font-bold text-neutral-dark">{stats?.coursesEnrolled || 0}</p>
                </div>
                <i className="fas fa-book text-academic-blue text-2xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-medium">Hours Studied</p>
                  <p className="text-2xl font-bold text-neutral-dark">{stats?.hoursStudied || 0}</p>
                </div>
                <i className="fas fa-clock text-success-green text-2xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-medium">Completed</p>
                  <p className="text-2xl font-bold text-neutral-dark">{stats?.completed || 0}</p>
                </div>
                <i className="fas fa-trophy text-yellow-500 text-2xl"></i>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Courses */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-dark">Available Courses</h3>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  className="w-64"
                />
                <i className="fas fa-search text-neutral-medium"></i>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map((course: any) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-academic-blue/10 p-2 rounded-lg">
                      <i className={`${course.icon} text-academic-blue`}></i>
                    </div>
                    <span className="text-xs bg-success-green/10 text-success-green px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <h4 className="font-semibold text-neutral-dark mb-2">{course.title}</h4>
                  <p className="text-sm text-neutral-medium mb-3">{course.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-neutral-medium">{course.teacherName}</span>
                    <div className="flex items-center space-x-1">
                      <i className="fas fa-file text-xs text-neutral-medium"></i>
                      <span className="text-xs text-neutral-medium">files</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {isEnrolled(course.id) ? (
                      <Link href={`/course/${course.id}`} className="flex-1">
                        <Button className="w-full bg-success-green hover:bg-green-700 text-white text-sm">
                          <i className="fas fa-eye mr-1"></i>
                          View Course
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Button
                          onClick={(e) => handleEnroll(course.id, e)}
                          disabled={enrollMutation.isPending}
                          className="flex-1 bg-academic-blue hover:bg-blue-800 text-white text-sm"
                        >
                          <i className="fas fa-plus mr-1"></i>
                          {enrollMutation.isPending ? "Enrolling..." : "Enroll"}
                        </Button>
                        <Link href={`/course/${course.id}`}>
                          <Button variant="outline" className="text-academic-blue hover:text-blue-800 text-sm">
                            <i className="fas fa-eye"></i>
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-neutral-dark mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <i className="fas fa-play-circle text-academic-blue"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-dark">Watched "Linear Equations" video</p>
                  <p className="text-xs text-neutral-medium">Mathematics 101 • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <i className="fas fa-file-download text-success-green"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-dark">Downloaded "Lab Manual.pdf"</p>
                  <p className="text-xs text-neutral-medium">Physics 201 • 5 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
