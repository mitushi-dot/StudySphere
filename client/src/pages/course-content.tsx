import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function CourseContent() {
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "content"],
  });

  const viewMutation = useMutation({
    mutationFn: (contentId: string) => apiRequest("PUT", `/api/content/${contentId}/view`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "content"] });
    },
  });

  const handleViewContent = (contentId: string) => {
    viewMutation.mutate(contentId);
  };

  if (courseLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="lg:col-span-3 h-96 bg-gray-200 rounded"></div>
            </div>
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

  const getContentBg = (type: string) => {
    switch (type) {
      case "video":
        return "bg-gray-100";
      case "document":
        return "bg-red-50";
      case "assignment":
        return "bg-success-green/10";
      case "presentation":
        return "bg-purple-50";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/student/dashboard">
            <Button variant="outline" className="text-academic-blue hover:text-blue-800">
              <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
            </Button>
          </Link>
          <div className="border-l border-gray-300 pl-4">
            <h2 className="text-3xl font-bold text-neutral-dark">{course?.title}</h2>
            <p className="text-neutral-medium">
              {course?.teacherName} • {content?.length || 0} files
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-neutral-dark mb-4">Course Materials</h3>
                <div className="space-y-2">
                  <div className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 flex items-center space-x-2">
                    <i className="fas fa-play-circle text-academic-blue"></i>
                    <span className="text-sm">Lectures</span>
                    <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {content?.filter((c: any) => c.type === "video").length || 0}
                    </span>
                  </div>
                  <div className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                    <i className="fas fa-file-pdf text-red-500"></i>
                    <span className="text-sm">Documents</span>
                    <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {content?.filter((c: any) => c.type === "document").length || 0}
                    </span>
                  </div>
                  <div className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                    <i className="fas fa-tasks text-success-green"></i>
                    <span className="text-sm">Assignments</span>
                    <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {content?.filter((c: any) => c.type === "assignment").length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-neutral-dark mb-2">All Materials</h3>
                  <p className="text-neutral-medium">Access course content and resources</p>
                </div>

                {content && content.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.map((item: any) => (
                      <div 
                        key={item.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className={`${getContentBg(item.type)} rounded-lg mb-3 h-32 flex items-center justify-center`}>
                          <i className={`${getContentIcon(item.type)} text-4xl`}></i>
                        </div>
                        <h4 className="font-semibold text-neutral-dark mb-2">{item.title}</h4>
                        <p className="text-sm text-neutral-medium mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-medium">
                            {item.fileSize} • {item.views} views
                          </span>
                          <Button
                            onClick={() => handleViewContent(item.id)}
                            className="text-academic-blue hover:text-blue-800 text-sm font-medium bg-transparent hover:bg-transparent p-0"
                          >
                            <i className={`fas ${item.type === "video" ? "fa-play" : "fa-download"} mr-1`}></i>
                            <span>{item.type === "video" ? "Watch" : "Download"}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-folder-open text-4xl text-neutral-medium mb-4"></i>
                    <h4 className="text-lg font-medium text-neutral-dark mb-2">No content available</h4>
                    <p className="text-neutral-medium">
                      The instructor hasn't uploaded any materials yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
