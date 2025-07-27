import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import AuthForm from "@/components/auth-form";

export default function Home() {
  const [, navigate] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  useEffect(() => {
    if (user?.user) {
      if (user.user.role === "student") {
        navigate("/student/dashboard");
      } else if (user.user.role === "teacher") {
        navigate("/teacher/dashboard");
      }
    }
  }, [user, navigate]);

  if (user?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-academic-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-academic-blue to-blue-800">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <i className="fas fa-graduation-cap text-academic-blue text-5xl mb-4"></i>
            <h1 className="text-3xl font-bold text-neutral-dark mb-2">StudySphere</h1>
            <p className="text-neutral-medium">Connect. Learn. Grow.</p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
