import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NavigationProps {
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
  };
}

export default function Navigation({ user }: NavigationProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      navigate("/");
      toast({
        title: "Logged out successfully",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <i className="fas fa-graduation-cap text-academic-blue text-2xl"></i>
              <h1 className="text-xl font-bold text-neutral-dark">StudySphere</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-neutral-medium">Welcome, {user.name}</span>
            <button 
              onClick={handleLogout}
              className="text-sm text-academic-blue hover:text-blue-800 transition-colors"
              disabled={logoutMutation.isPending}
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
