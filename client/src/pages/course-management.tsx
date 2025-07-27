import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UploadModal from "@/components/upload-modal";

export default function CourseManagement() {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState("content");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "content"],
  });

  const deleteMutation = useMutation({
    mutationFn: (contentId: string) => apiRequest("DELETE", `/api/content/${contentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "content"] });
      toast({
        title: "Content deleted",
        description: "The content has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteContent = (contentId: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate(contentId);
    }
  };

  if (courseLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return "fas fa-play-circle text-academic-blue";
      case "document":
        return "fas fa-file-pdf text-red-500";
      case "assignment":
        return "fas fa-tasks text-success-green";
      case "presentation":
        return "fas fa-presentation text-purple-500";
      default:
        return "fas fa-file text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/teacher/dashboard">
              <Button variant="outline" className="text-academic-blue hover:text-blue-800">
                <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
              </Button>
            </Link>
            <div className="border-l border-gray-300 pl-4">
              <h2 className="text-3xl font-bold text-neutral-dark">{course?.title}</h2>
              <p className="text-neutral-medium">Manage course content and settings</p>
            </div>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-academic-blue text-white hover:bg-blue-800 flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add Content</span>
          </Button>
        </div>

        {/* Course Management Tabs */}
        <Card className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("content")}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === "content"
                    ? "border-academic-blue text-academic-blue"
                    : "border-transparent text-neutral-medium hover:text-neutral-dark"
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === "students"
                    ? "border-academic-blue text-academic-blue"
                    : "border-transparent text-neutral-medium hover:text-neutral-dark"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-academic-blue text-academic-blue"
                    : "border-transparent text-neutral-medium hover:text-neutral-dark"
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <CardContent className="p-6">
            {activeTab === "content" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-neutral-dark mb-2">Course Content</h3>
                  <p className="text-neutral-medium">Manage all uploaded files and materials</p>
                </div>

                {content && content.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-neutral-medium">File</th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-medium">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-medium">Size</th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-medium">Uploaded</th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-medium">Views</th>
                          <th className="text-left py-3 px-4 font-medium text-neutral-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {content.map((item: any) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <i className={getContentIcon(item.type)}></i>
                                <span className="font-medium text-neutral-dark">{item.fileName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-neutral-medium capitalize">{item.type}</td>
                            <td className="py-3 px-4 text-neutral-medium">{item.fileSize}</td>
                            <td className="py-3 px-4 text-neutral-medium">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-neutral-dark">{item.views}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <button className="text-academic-blue hover:text-blue-800 text-sm">
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteContent(item.id)}
                                  className="text-alert-red hover:text-red-800 text-sm"
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-folder-open text-4xl text-neutral-medium mb-4"></i>
                    <h4 className="text-lg font-medium text-neutral-dark mb-2">No content uploaded</h4>
                    <p className="text-neutral-medium mb-4">
                      Start by uploading your first course material.
                    </p>
                    <Button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-academic-blue text-white hover:bg-blue-800"
                    >
                      Upload Content
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "students" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-neutral-dark mb-2">Enrolled Students</h3>
                  <p className="text-neutral-medium">View and manage student enrollments</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-academic-blue/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-academic-blue"></i>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-dark">John Smith</p>
                      <p className="text-sm text-neutral-medium">Progress: 75%</p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-green/10 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-success-green"></i>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-dark">Sarah Johnson</p>
                      <p className="text-sm text-neutral-medium">Progress: 92%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-neutral-dark mb-2">Course Analytics</h3>
                  <p className="text-neutral-medium">Track engagement and performance metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-neutral-medium">Total Views</p>
                    <p className="text-2xl font-bold text-neutral-dark">
                      {content?.reduce((sum: number, item: any) => sum + parseInt(item.views), 0) || 0}
                    </p>
                    <p className="text-xs text-success-green">↑ 12% this week</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-neutral-medium">Avg. Completion</p>
                    <p className="text-2xl font-bold text-neutral-dark">78%</p>
                    <p className="text-xs text-success-green">↑ 5% this month</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-neutral-medium">Active Students</p>
                    <p className="text-2xl font-bold text-neutral-dark">2</p>
                    <p className="text-xs text-neutral-medium">enrolled</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-neutral-medium">Engagement Rate</p>
                    <p className="text-2xl font-bold text-neutral-dark">89%</p>
                    <p className="text-xs text-success-green">↑ 3% this week</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
      />
    </div>
  );
}
