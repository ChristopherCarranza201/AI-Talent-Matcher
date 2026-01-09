import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  Shield,
  TrendingUp,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">AI Talent Matcher</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Powered by Advanced AI
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              Find Your Perfect{" "}
              <span className="gradient-text">Talent Match</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Revolutionary AI-powered recruitment platform that automatically matches 
              candidates with opportunities using intelligent skill detection and semantic analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/register?role=recruiter">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity px-8">
                  <Briefcase className="w-5 h-5" />
                  I'm Hiring
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/register?role=candidate">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  <Users className="w-5 h-5" />
                  I'm Looking for Work
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {[
              { value: "95%", label: "Match Accuracy" },
              { value: "10k+", label: "Active Jobs" },
              { value: "50k+", label: "Candidates" },
              { value: "2.5x", label: "Faster Hiring" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl glass-card animate-fade-in-up"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <p className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose AI Talent Matcher?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with intuitive design to transform
              how companies find talent and candidates discover opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Matching",
                description: "Advanced algorithms analyze skills, experience, and cultural fit to deliver highly accurate candidate-job matches.",
              },
              {
                icon: Zap,
                title: "Instant Skill Detection",
                description: "Automatically extract and categorize skills from CVs using natural language processing technology.",
              },
              {
                icon: Target,
                title: "Smart Recommendations",
                description: "Get personalized job and candidate recommendations based on historical data and preferences.",
              },
              {
                icon: Shield,
                title: "Bias-Free Screening",
                description: "Our AI focuses on skills and qualifications, promoting diversity and fair hiring practices.",
              },
              {
                icon: TrendingUp,
                title: "Analytics Dashboard",
                description: "Comprehensive insights into your recruitment funnel, candidate pipeline, and hiring metrics.",
              },
              {
                icon: Sparkles,
                title: "AI Chat Assistant",
                description: "Query your candidate database using natural language with our intelligent chatbot interface.",
              },
            ].map((feature, i) => (
              <Card key={i} className="hover-lift border-0 shadow-card">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Simple steps to find your perfect match</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* For Recruiters */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                For Recruiters
              </h3>
              <div className="space-y-6">
                {[
                  "Create a vacancy with job requirements",
                  "AI automatically finds matching candidates",
                  "Review ranked profiles with match scores",
                  "Connect with top talent instantly",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{i + 1}</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-foreground">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Candidates */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                For Candidates
              </h3>
              <div className="space-y-6">
                {[
                  "Upload your CV or build your profile",
                  "AI detects and highlights your skills",
                  "Browse jobs matched to your expertise",
                  "Apply with one click and track progress",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-secondary">{i + 1}</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-foreground">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of companies and candidates who have found their perfect match.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">AI Talent Matcher</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AI Talent Matcher. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}