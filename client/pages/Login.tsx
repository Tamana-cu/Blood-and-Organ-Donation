import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Heart, Activity, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Email and password are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.message || 'Login failed',
          variant: 'destructive',
        });
        return;
      }

      // Store token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });

      // Navigate to appropriate dashboard
      if (data.user.role === 'donor') {
        navigate('/donor/dashboard');
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/recipient/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform duration-300" />
              <Activity className="w-4 h-4 text-secondary absolute -right-1 -bottom-1" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter gradient-text">LifeLink</span>
          </Link>
          <Link to="/register" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Join Now</Link>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-screen px-4 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="glass-dark dark:glass bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl p-10 space-y-8 relative overflow-hidden group hover:shadow-primary/10 transition-shadow duration-500">
            {/* Inner Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary bg-opacity-20 rounded-full blur-[60px] group-hover:bg-primary bg-opacity-30 transition-colors" />
            
            <div className="space-y-2 text-center relative z-10">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-border"
              >
                <HeartPulse className="w-10 h-10 text-primary animate-pulse" />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight dark:text-white">Welcome Back</h1>
              <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-70 italic">Restoring hope, one login at a time</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="space-y-2 group/input">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Email Intelligence</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="commander@lifelink.org"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="rounded-2xl h-14 bg-white/50 dark:bg-slate-950/50 border-border/50 focus:border-primary/50 focus:ring-primary/10 transition-all text-lg pl-6 shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2 group/input">
                  <Label htmlFor="password" title="password" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Security Key</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="rounded-2xl h-14 bg-white/50 dark:bg-slate-950/50 border-border/50 focus:border-primary/50 focus:ring-primary/10 transition-all text-lg pl-6 shadow-inner"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 text-lg font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-white" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synchronizing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Access Network
                    <Activity className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="pt-4 text-center relative z-10 border-t border-border/20">
              <p className="text-xs text-muted-foreground font-black uppercase tracking-tighter">
                New Operative?{' '}
                <Link to="/register" className="text-primary font-black hover:underline underline-offset-4 decoration-2">
                  Initialize Profile
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
