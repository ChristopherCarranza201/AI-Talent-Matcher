// Authentication hook with React Query

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signupCandidate, signupRecruiter, login, getCurrentUser } from '@/services/api';
import { setToken, removeToken, getToken } from '@/lib/auth';
import type {
  CandidateSignupRequest,
  RecruiterSignupRequest,
  LoginRequest,
  Profile,
} from '@/types/api';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<Profile | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!getToken()) return null;
      try {
        return await getCurrentUser();
      } catch {
        removeToken();
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: async (response) => {
      setToken(response.access_token);
      const userData = await getCurrentUser();
      queryClient.setQueryData(['currentUser'], userData);
      navigate(userData.role === 'recruiter' ? '/recruiter' : '/candidate');
    },
  });

  // Candidate signup mutation
  const signupCandidateMutation = useMutation({
    mutationFn: (data: CandidateSignupRequest) => signupCandidate(data),
    onSuccess: async (response) => {
      setToken(response.access_token);
      const userData = await getCurrentUser();
      queryClient.setQueryData(['currentUser'], userData);
      navigate('/candidate');
    },
  });

  // Recruiter signup mutation
  const signupRecruiterMutation = useMutation({
    mutationFn: (data: RecruiterSignupRequest) => signupRecruiter(data),
    onSuccess: async (response) => {
      setToken(response.access_token);
      const userData = await getCurrentUser();
      queryClient.setQueryData(['currentUser'], userData);
      navigate('/recruiter');
    },
  });

  // Sign out
  const signOut = () => {
    removeToken();
    queryClient.clear();
    navigate('/login');
  };

  return {
    user: user || null,
    loading: isLoading,
    error,
    isAuthenticated: !!user && !!getToken(),
    signIn: loginMutation.mutate,
    signUpCandidate: signupCandidateMutation.mutate,
    signUpRecruiter: signupRecruiterMutation.mutate,
    signOut,
    isSigningIn: loginMutation.isPending,
    isSigningUp: signupCandidateMutation.isPending || signupRecruiterMutation.isPending,
    signInError: loginMutation.error,
    signUpError: signupCandidateMutation.error || signupRecruiterMutation.error,
  };
};

