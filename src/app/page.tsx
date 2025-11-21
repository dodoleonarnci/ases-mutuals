"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Zap, Coffee, ArrowRight, Sparkles, Heart, LogOut, User, FileText, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// --- CSS Styles for Custom Animations ---
const styles = `
  html {
    scroll-behavior: smooth;
  }
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  @keyframes spin-reverse {
    from { transform: rotate(360deg); }
    to { transform: rotate(0deg); }
  }
  .animate-spin-reverse {
    animation: spin-reverse 20s linear infinite;
  }
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-scroll {
    animation: scroll 20s linear infinite;
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.3); }
    50% { transform: scale(1); }
    75% { transform: scale(1.3); }
  }
  .animate-heartbeat {
    animation: heartbeat 1.5s ease-in-out infinite;
  }
`;

// --- Components ---

// Recreated Logo based on the uploaded image
const Logo = ({ className = "", href = "/" }: { className?: string, href?: string }) => (
  <Link href={href} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-10 h-10 flex-shrink-0">
        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#6366f1] mix-blend-multiply opacity-90"></div>
        <div className="absolute right-0 bottom-0 w-7 h-7 rounded-full bg-[#ec4899] mix-blend-multiply opacity-90"></div>
      </div>
      <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">Mutuals</span>
    </div>
  </Link>
);

// Custom Hook for Intersection Observer (Scroll Animations)
const useOnScreen = (ref: React.RefObject<any>, rootMargin = "0px") => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIntersecting(true);
      },
      { rootMargin, threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, [ref, rootMargin]);
  return isIntersecting;
};

// Animated Background Canvas (Connecting Nodes)
const ConnectionCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes: any[] = [];
    const nodeCount = window.innerWidth < 768 ? 15 : 40; // Reduced nodes for mobile
    const connectionDistance = window.innerWidth < 768 ? 100 : 150;

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 4 + 2,
        color: Math.random() > 0.5 ? '#6366f1' : '#ec4899' // Blue or Pink
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(100, 116, 139, ${1 - distance / connectionDistance})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10 opacity-90 pointer-events-none bg-white" />;
};

// Reusable Animated Section
const FadeInSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null);
  const onScreen = useOnScreen(ref, "-50px");

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        onScreen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b-2 border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Logo href="/" />
        <div className="flex items-center gap-2 md:gap-4">
          <Link 
            href="/signin"
            className="text-slate-600 font-bold hover:text-indigo-600 transition-colors text-sm md:text-base"
          >
            Sign in
          </Link>
          <Link 
            href="/signup"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 md:px-6 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[3px_3px_0px_0px_#6366f1] text-sm md:text-base"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ signupCount }: { signupCount: number | null }) => {
  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ConnectionCanvas />
      
      {/* Decorative Blobs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
      <div className="absolute top-40 right-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-indigo-700 font-bold text-sm uppercase tracking-wide transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>Stanford Undergrads</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-6">
          Make friends, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
            not connections.
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-10 max-w-3xl mx-auto font-medium leading-relaxed px-4">
          Every week, we'll seat you at a dinner table with <span className="text-indigo-600 font-black decoration-indigo-300 decoration-4 underline-offset-4 underline">new</span> people, but everyone shares a <span className="text-pink-600 font-black decoration-pink-300 decoration-4 underline-offset-4 underline">mutual friend</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
          <Link 
            href="/signup"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg font-bold py-4 px-6 sm:px-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 group"
          >
            <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {signupCount !== null
              ? `Join network of ${signupCount * 3 + 267} students`
              : "Join our network"}
          </Link>
          <button 
            onClick={() => {
              const element = document.getElementById('how-it-works');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 text-base sm:text-lg font-bold py-4 px-6 sm:px-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#e2e8f0] flex items-center justify-center gap-2"
          >
            How it works <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

const StepCard = ({ icon: Icon, title, desc, color, number }: {icon: any, title: string, desc: string, color: string, number: string}) => (
  <div className="relative group h-full">
    {/* Background Layer - Fixed "Popped" State (No Hover Needed) */}
    <div className={`absolute inset-0 bg-${color}-400 rounded-3xl transform translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 border-2 border-slate-900`}></div>
    
    {/* Content Layer */}
    <div className="relative bg-white border-2 border-slate-900 p-6 md:p-8 rounded-3xl h-full flex flex-col items-start transition-transform group-hover:-translate-y-1">
      <div className={`w-14 h-14 bg-${color}-100 rounded-xl flex items-center justify-center mb-6 border-2 border-${color}-200 shadow-sm`}>
        <Icon className={`w-7 h-7 text-${color}-600`} />
      </div>
      <span className="absolute top-6 right-8 text-6xl font-black text-slate-100 -z-10 select-none">{number}</span>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  return (
    <section className="pb-16 sm:pb-24 pt-12 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          <FadeInSection delay={100}>
            <StepCard 
              number="01"
              color="indigo"
              icon={Zap}
              title="Join the Pool"
              desc="Sign up with your Stanford email. Tell us a few people you know to kickstart your graph."
            />
          </FadeInSection>
          <FadeInSection delay={200}>
            <StepCard 
              number="02"
              color="pink"
              icon={Users}
              title="We Find Links"
              desc="Our algorithm groups students who share at least one mutual friend at the table."
            />
          </FadeInSection>
          <FadeInSection delay={300}>
            <StepCard 
              number="03"
              color="purple"
              icon={Coffee}
              title="Meet Your Besties"
              desc="Get a text with your location. Show up, chow down, and watch your network multiply."
            />
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

const VibeCheck = () => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <FadeInSection className="text-center mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-6">The Mutuals Algorithm™</h2>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeInSection>
            <div className="relative p-8">
               {/* Abstract Representation of the 'Table' */}
              <div className="aspect-square max-w-md mx-auto rounded-full bg-slate-800 border-4 border-slate-700 relative flex items-center justify-center shadow-2xl">
                 <div className="absolute inset-0 animate-spin-slow">
                    {/* Top: Sarah */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 flex flex-col items-center justify-center">
                        <div className="animate-spin-reverse flex flex-col items-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-400 rounded-full border-4 border-slate-900 flex items-center justify-center text-2xl md:text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer">👱‍♀️</div>
                            <div className="mt-2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-slate-700">Sarah</div>
                        </div>
                    </div>
                    
                    {/* Bottom: Josh */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-24 flex flex-col items-center justify-center">
                        <div className="animate-spin-reverse flex flex-col items-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-400 rounded-full border-4 border-slate-900 flex items-center justify-center text-2xl md:text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer">🧑🏽‍🦱</div>
                            <div className="mt-2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-slate-700">Josh</div>
                        </div>
                    </div>

                    {/* Left: Mutual */}
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 flex flex-col items-center justify-center">
                        <div className="animate-spin-reverse flex flex-col items-center">
                            <div className="relative">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full border-4 border-slate-900 flex items-center justify-center text-2xl md:text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer z-10">👩🏻</div>
                                <div className="absolute -top-4 -right-2 text-2xl z-20 drop-shadow-md transform rotate-12">👑</div>
                            </div>
                            <div className="mt-2 bg-yellow-400 text-slate-900 text-xs font-black px-2 py-1 rounded-full border-2 border-slate-900 uppercase tracking-wider">Mutual</div>
                        </div>
                    </div>

                    {/* Right: Sam */}
                    <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-24 flex flex-col items-center justify-center">
                        <div className="animate-spin-reverse flex flex-col items-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-400 rounded-full border-4 border-slate-900 flex items-center justify-center text-2xl md:text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer">🧔</div>
                            <div className="mt-2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-slate-700">Sam</div>
                        </div>
                    </div>
                 </div>
                 
                 {/* Center Plate */}
                 <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center relative z-10">
                    <div className="text-center">
                        <div className="text-3xl md:text-4xl mb-1">🍽️</div>
                    </div>
                 </div>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={200}>
            <ul className="space-y-8">
              <li className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-2xl font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transform group-hover:-rotate-6 transition-transform flex-shrink-0">1</div>
                <p className="text-2xl md:text-4xl font-black text-white leading-tight">
                  A friend always <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">joins you at the table.</span>
                </p>
              </li>
              <li className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center text-2xl font-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transform group-hover:rotate-6 transition-transform flex-shrink-0">2</div>
                <p className="text-2xl md:text-4xl font-black text-white leading-tight">
                  Everyone gets a good match, unlike <span className="text-pink-400 decoration-pink-400/30 underline underline-offset-4 decoration-4">da****op.</span>
                </p>
              </li>
            </ul>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

const CTA = ({ signupCount }: { signupCount: number | null }) => (
  <section className="py-16 md:py-24 bg-[#6366f1] relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
      <FadeInSection>
        <div className="mb-6 animate-float">
            <span className="text-6xl">💌</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight drop-shadow-lg">
          Your seat is waiting.
        </h2>
        <p className="text-indigo-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
          {signupCount !== null
            ? `Join network of ${signupCount * 3 + 267} students discovering their campus community, one dinner at a time.`
            : "Join Stanford students discovering their campus community, one dinner at a time."}
        </p>
        <Link 
          href="/signup"
          className="w-full sm:w-auto bg-white text-indigo-600 hover:text-indigo-700 text-lg sm:text-xl font-bold py-5 sm:py-6 px-8 sm:px-12 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 mx-auto group border-b-4 border-slate-200"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform text-pink-500" />
          <span>Sign Up for This Week</span>
        </Link>
      </FadeInSection>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white border-t-2 border-slate-100 py-12">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
      <Logo className="scale-75 origin-left" />
      
      <div className="flex items-center gap-2 text-slate-600 text-lg font-extrabold">
        <span>Made with</span>
        <Heart className="w-6 h-6 text-pink-500 fill-current animate-heartbeat" />
        <span>at Stanford</span>
      </div>
    </div>
  </footer>
);

// Authenticated Landing Page Components
const AuthenticatedNavbar = ({ studentEmail, onLogout, loggingOut }: { studentEmail: string, onLogout: () => void, loggingOut: boolean }) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b-2 border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Logo href="/" />
          <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2 text-slate-600 font-medium">
            <User className="w-4 h-4" />
            <span className="text-sm truncate max-w-[150px]">{studentEmail}</span>
          </div>
          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 md:px-6 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[3px_3px_0px_0px_#6366f1] flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 text-sm md:text-base"
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

const AuthenticatedHero = ({ student }: { student: { id: string; email: string } }) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`/api/students/${student.id}`);
        if (response.ok) {
          const data = await response.json();
          setStudentData(data.student);
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [student.id]);

  const firstName = studentData?.first_name || student.email.split('@')[0];
  const surveyCompleted = studentData?.survey_completed || false;

  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ConnectionCanvas />
      
      {/* Decorative Blobs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
      <div className="absolute top-40 right-10 w-32 h-32 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-indigo-700 font-bold text-sm uppercase tracking-wide transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>Welcome back!</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-6">
          Hey <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">{firstName}</span>,
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-8 sm:mb-10 max-w-3xl mx-auto font-medium leading-relaxed px-4">
          Ready to make some <span className="text-indigo-600 font-black decoration-indigo-300 decoration-4 underline-offset-4 underline">mutual connections</span>?
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-20">
            {!surveyCompleted ? (
              <>
                <Link 
                  href="/survey"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg font-bold py-4 px-6 sm:px-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 group"
                >
                  <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Complete Your Survey
                </Link>
                <Link 
                  href="/whats-next"
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 text-base sm:text-lg font-bold py-4 px-6 sm:px-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#e2e8f0] flex items-center justify-center gap-2"
                >
                  Learn More <ArrowRight className="w-5 h-5" />
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/whats-next"
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg font-bold py-4 px-6 sm:px-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 group"
                >
                  <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  What&apos;s Next?
                </Link>
                <Link 
                  href="/survey"
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 text-base sm:text-lg font-bold py-4 px-6 sm:px-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#e2e8f0] flex items-center justify-center gap-2"
                >
                  Update Survey <ArrowRight className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

const StatusCard = ({ icon: Icon, title, desc, status, color }: { icon: any, title: string, desc: string, status: 'completed' | 'pending', color: 'indigo' | 'pink' | 'purple' }) => {
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-400',
      bgLight: 'bg-indigo-100',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
    },
    pink: {
      bg: 'bg-pink-400',
      bgLight: 'bg-pink-100',
      border: 'border-pink-200',
      text: 'text-pink-600',
    },
    purple: {
      bg: 'bg-purple-400',
      bgLight: 'bg-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="relative group h-full">
      <div className={`absolute inset-0 ${colors.bg} rounded-3xl transform translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4 border-2 border-slate-900`}></div>
      <div className="relative bg-white border-2 border-slate-900 p-6 md:p-8 rounded-3xl h-full flex flex-col items-start transition-transform group-hover:-translate-y-1">
        <div className={`w-14 h-14 ${colors.bgLight} rounded-xl flex items-center justify-center mb-6 border-2 ${colors.border} shadow-sm`}>
          <Icon className={`w-7 h-7 ${colors.text}`} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          {status === 'completed' ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-amber-500" />
          )}
        </div>
        <p className="text-slate-600 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

const StatusSection = ({ student }: { student: { id: string; email: string } }) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`/api/students/${student.id}`);
        if (response.ok) {
          const data = await response.json();
          setStudentData(data.student);
        }
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [student.id]);

  if (loading) {
    return (
      <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  const surveyCompleted = studentData?.survey_completed || false;

  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <FadeInSection className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 mb-4">Your Status</h2>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <FadeInSection delay={100}>
            <StatusCard 
              color="indigo"
              icon={FileText}
              title="Survey"
              desc={surveyCompleted ? "You've completed your profile survey. You can update it anytime." : "Complete your profile survey to help us match you with the right people."}
              status={surveyCompleted ? 'completed' : 'pending'}
            />
          </FadeInSection>
          <FadeInSection delay={200}>
            <StatusCard 
              color="pink"
              icon={Calendar}
              title="Matches"
              desc="We'll start matching after the break. Get ready to meet your mutual connections!"
              status="pending"
            />
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

const AuthenticatedApp = ({ student }: { student: { id: string; email: string } }) => {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        // Clear any cached auth state
        window.location.href = "/";
      } else {
        // Even if API call fails, try to redirect
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Failed to logout:", error);
      // Still redirect even on error
      window.location.href = "/";
    }
  };

  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-pink-200 selection:text-pink-900">
      <style>{styles}</style>
      <AuthenticatedNavbar studentEmail={student.email} onLogout={handleLogout} loggingOut={loggingOut} />
      <main>
        <AuthenticatedHero student={student} />
        <StatusSection student={student} />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  const [signupCount, setSignupCount] = useState<number | null>(null);
  const [authState, setAuthState] = useState<{ authenticated: boolean; student?: { id: string; email: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthState = async () => {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setAuthState(data);
        }
      } catch (error) {
        console.error("Failed to fetch auth state:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthState();
  }, []);

  useEffect(() => {
    const fetchSignupCount = async () => {
      try {
        const response = await fetch("/api/signups/count", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          setSignupCount(data.count ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch signup count:", error);
      }
    };
    fetchSignupCount();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Show authenticated landing page if user is signed in
  if (authState?.authenticated && authState.student) {
    return <AuthenticatedApp student={authState.student} />;
  }

  // Show public landing page if user is not signed in
  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-pink-200 selection:text-pink-900">
      <style>{styles}</style>
      <Navbar />
      <main>
        <Hero signupCount={signupCount} />
        <VibeCheck />
        <HowItWorks />
        <CTA signupCount={signupCount} />
      </main>
      <Footer />
    </div>
  );
};

export default App;