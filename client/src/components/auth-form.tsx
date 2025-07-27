import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "student",
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      apiRequest("POST", "/api/auth/login", data),
    onSuccess: async (response) => {
      const user = await response.json();
      queryClient.setQueryData(["/api/auth/me"], user);
      
      if (user.user.role === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/teacher/dashboard");
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.user.name}!`,
      });
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: { username: string; password: string; name: string; role: string }) =>
      apiRequest("POST", "/api/auth/register", data),
    onSuccess: async (response) => {
      const user = await response.json();
      queryClient.setQueryData(["/api/auth/me"], user);
      
      if (user.user.role === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/teacher/dashboard");
      }
      
      toast({
        title: "Account created",
        description: `Welcome to StudySphere, ${user.user.name}!`,
      });
    },
    onError: () => {
      toast({
        title: "Signup failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "login") {
      loginMutation.mutate({
        username: formData.username,
        password: formData.password,
      });
    } else {
      signupMutation.mutate(formData);
    }
  };

  return (
    <>
      {/* Login/Signup Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            mode === "login"
              ? "bg-white text-academic-blue shadow-sm"
              : "text-neutral-medium"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            mode === "signup"
              ? "bg-white text-academic-blue shadow-sm"
              : "text-neutral-medium"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <Label className="block text-sm font-medium text-neutral-dark mb-2">
              Full Name
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>
        )}
        
        <div>
          <Label className="block text-sm font-medium text-neutral-dark mb-2">
            Email
          </Label>
          <Input
            type="email"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div>
          <Label className="block text-sm font-medium text-neutral-dark mb-2">
            Password
          </Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={mode === "login" ? "Enter your password" : "Create a password"}
            required
          />
        </div>

        {mode === "signup" && (
          <div>
            <Label className="block text-sm font-medium text-neutral-dark mb-2">
              I am a...
            </Label>
            <RadioGroup
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="text-sm text-neutral-dark">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher" className="text-sm text-neutral-dark">Teacher</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {mode === "login" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-neutral-medium">
                Remember me
              </Label>
            </div>
            <a href="#" className="text-sm text-academic-blue hover:text-blue-800">
              Forgot password?
            </a>
          </div>
        )}

        <Button
          type="submit"
          className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${
            mode === "login"
              ? "bg-academic-blue text-white hover:bg-blue-800"
              : "bg-success-green text-white hover:bg-green-700"
          }`}
          disabled={loginMutation.isPending || signupMutation.isPending}
        >
          {(loginMutation.isPending || signupMutation.isPending) 
            ? "Please wait..." 
            : mode === "login" 
              ? "Sign In" 
              : "Create Account"
          }
        </Button>
      </form>
    </>
  );
}
