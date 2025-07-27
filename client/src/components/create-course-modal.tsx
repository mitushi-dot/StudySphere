import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const courseIcons = [
  { value: "fas fa-calculator", label: "Mathematics", color: "text-blue-500" },
  { value: "fas fa-atom", label: "Physics", color: "text-green-500" },
  { value: "fas fa-flask", label: "Chemistry", color: "text-purple-500" },
  { value: "fas fa-code", label: "Computer Science", color: "text-gray-500" },
  { value: "fas fa-book", label: "Literature", color: "text-red-500" },
  { value: "fas fa-globe", label: "Geography", color: "text-teal-500" },
  { value: "fas fa-history", label: "History", color: "text-yellow-600" },
  { value: "fas fa-language", label: "Languages", color: "text-indigo-500" },
  { value: "fas fa-music", label: "Music", color: "text-pink-500" },
  { value: "fas fa-palette", label: "Art", color: "text-orange-500" },
];

const courseColors = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-yellow-500", label: "Yellow" },
  { value: "bg-indigo-500", label: "Indigo" },
  { value: "bg-pink-500", label: "Pink" },
  { value: "bg-teal-500", label: "Teal" },
];

export default function CreateCourseModal({ isOpen, onClose }: CreateCourseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "fas fa-book",
    color: "bg-blue-500",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof formData) => {
      const response = await apiRequest("POST", "/api/courses", courseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      onClose();
      toast({
        title: "Course created successfully",
        description: "Your new course is now available to students.",
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        icon: "fas fa-book",
        color: "bg-blue-500",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message || "Unable to create course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createCourseMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create New Course
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Course Title</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter course title"
              required
            />
          </div>

          <div>
            <Label>Course Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description of the course"
              required
            />
          </div>

          <div>
            <Label>Course Icon</Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <i className={`${formData.icon} text-gray-600`}></i>
                    <span>{courseIcons.find(icon => icon.value === formData.icon)?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {courseIcons.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex items-center space-x-2">
                      <i className={`${icon.value} ${icon.color}`}></i>
                      <span>{icon.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Course Color</Label>
            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${formData.color}`}></div>
                    <span>{courseColors.find(color => color.value === formData.color)?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {courseColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded ${color.value}`}></div>
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-academic-blue hover:bg-blue-800"
              disabled={createCourseMutation.isPending}
            >
              {createCourseMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}