import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UploadModal from "@/components/upload-modal";
import CreateCourseModal from "@/components/create-course-modal";

export default function TeacherDashboard() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/teacher/courses"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/teacher/stats"],
  });

  if (coursesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-neutral-dark mb-2">Teacher Dashboard</h2>
            <p className="text-neutral-medium">Manage your courses and upload learning materials</p>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-academic-blue text-white hover:bg-blue-800 flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>Upload Content</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-medium">Total Students</p>
                  <p className="text-2xl font-bold text-neutral-dark">{stats?.totalStudents || 0}</p>
                </div>
                <i className="fas fa-users text-academic-blue text-2xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-medium">Courses</p>
                  <p className="text-2xl font-bold text-neutral-dark">{stats?.totalCourses || 0}</p>
                </div>
                <i className="fas fa-book text-success-green text-2xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-medium">Uploads</p>
                  <p className="text-2xl font-bold text-neutral-dark">{stats?.totalUploads || 0}</p>
                </div>
                <i className="fas fa-upload text-purple-500 text-2xl"></i>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-medium">Engagement</p>
                  <p className="text-2xl font-bold text-neutral-dark">{stats?.engagementRate || 0}%</p>
                </div>
                <i className="fas fa-chart-line text-yellow-500 text-2xl"></i>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Courses */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-dark">My Courses</h3>
              <button 
                onClick={() => setShowCreateCourseModal(true)}
                className="text-academic-blue hover:text-blue-800 text-sm font-medium"
              >
                <i className="fas fa-plus mr-1"></i>Create New Course
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-neutral-medium">Course</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-medium">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-medium">Files</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-medium">Last Updated</th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses?.map((course: any) => (
                    <tr key={course.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-academic-blue/10 p-2 rounded-lg">
                            <i className={`${course.icon} text-academic-blue`}></i>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-dark">{course.title}</p>
                            <p className="text-sm text-neutral-medium">{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-neutral-dark">0</td>
                      <td className="py-3 px-4 text-neutral-dark">0</td>
                      <td className="py-3 px-4 text-neutral-medium text-sm">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/teacher/course/${course.id}/manage`}>
                            <button className="text-academic-blue hover:text-blue-800 text-sm">
                              Manage
                            </button>
                          </Link>
                          <button className="text-neutral-medium hover:text-neutral-dark text-sm">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-neutral-dark mb-4">Recent Uploads</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <i className="fas fa-file-pdf text-red-500"></i>
                  <div>
                    <p className="text-sm font-medium text-neutral-dark">Chapter_5_Equations.pdf</p>
                    <p className="text-xs text-neutral-medium">Mathematics 101 • 2.3 MB</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-medium">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <i className="fas fa-play-circle text-academic-blue"></i>
                  <div>
                    <p className="text-sm font-medium text-neutral-dark">Lecture_3_Motion.mp4</p>
                    <p className="text-xs text-neutral-medium">Physics 201 • 45.8 MB</p>
                  </div>
                </div>
                <span className="text-xs text-neutral-medium">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
      <CreateCourseModal 
        isOpen={showCreateCourseModal} 
        onClose={() => setShowCreateCourseModal(false)} 
      />
    </div>
  );
}
