import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Heart, Activity, MapPin, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'recipient',
    location: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.password || !formData.location || !formData.phone) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          location: formData.location,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.message || 'Registration failed',
          variant: 'destructive',
        });
        return;
      }

      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast({
        title: 'Success',
        description: 'Account created successfully!',
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
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 pb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary bg-opacity-10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary bg-opacity-10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 dark:opacity-5" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <nav className="fixed top-0 w-full z-50 glass border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform duration-300" />
              <Activity className="w-4 h-4 text-secondary absolute -right-1 -bottom-1" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter gradient-text">LifeLink</span>
          </Link>
          <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Sign In</Link>
        </div>
      </nav>

      <div className="flex items-center justify-center pt-32 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-2xl"
        >
          <div className="glass-dark dark:glass bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3.5rem] border border-white border-opacity-20 shadow-2xl p-10 md:p-14 space-y-10 relative overflow-hidden group">
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary bg-opacity-10 rounded-full blur-[80px] group-hover:bg-secondary bg-opacity-20 transition-colors" />
            
            <div className="space-y-3 text-center relative z-10">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-border"
              >
                <ShieldCheck className="w-10 h-10 text-secondary" />
              </motion.div>
              <h1 className="text-5xl font-black tracking-tighter dark:text-white">Join the Mission</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary bg-opacity-10 border border-secondary border-opacity-20 text-secondary text-[10px] font-black uppercase tracking-[0.2em]">
                New Operative Enrollment
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2 group/input">
                  <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Assignment Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full h-14 px-6 bg-white bg-opacity-50 dark:bg-slate-950 dark:bg-opacity-50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all font-bold text-lg shadow-inner appearance-none cursor-pointer hover:bg-white hover:bg-opacity-80 dark:hover:bg-slate-900 dark:hover:bg-opacity-80"
                  >
                    <option value="donor">Hero (Donor)</option>
                    <option value="recipient">Seeker (Recipient)</option>
                  </select>
                </div>

                <div className="space-y-2 group/input">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Full Designation</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-14 rounded-2xl bg-white bg-opacity-50 dark:bg-slate-950 dark:bg-opacity-50 border-border focus:border-primary border-opacity-50 text-lg pl-6 shadow-inner"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2 group/input">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Digital Identity (Email)</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="hq@lifelink.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-14 rounded-2xl bg-white bg-opacity-50 dark:bg-slate-950 dark:bg-opacity-50 border-border focus:border-primary border-opacity-50 text-lg pl-6 shadow-inner"
                  />
                </div>

                <div className="space-y-2 group/input">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Comm-Link (Phone)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+1-800-LIFELINK"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="h-14 rounded-2xl bg-white bg-opacity-50 dark:bg-slate-950 dark:bg-opacity-50 border-border focus:border-primary border-opacity-50 text-lg pl-6 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2 group/input">
                <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Primary Deployment (City)</Label>
                <div className="relative">
                  <Input
                    id="location"
                    type="text"
                    name="location"
                    placeholder="Global Operation Center City"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="h-14 pl-12 rounded-2xl bg-white bg-opacity-50 dark:bg-slate-950 dark:bg-opacity-50 border-border focus:border-primary border-opacity-50 text-lg shadow-inner"
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2 group/input">
                  <Label htmlFor="password" title='password' className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Access Key (Password)</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-14 rounded-2xl bg-white bg-opacity-50 dark:bg-slate-950 dark:bg-opacity-50 border-border focus:border-primary border-opacity-50 text-lg pl-6 shadow-inner"
                  />
                </div>

                <div className="space-y-2 group/input">
                  <Label htmlFor="confirmPassword" title='confirm password' className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 text-muted-foreground group-focus-within/input:text-primary transition-colors">Key Verification</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-14 rounded-2xl bg-white bg-opacity-50 dark:bg-slate-950 dark:bg-opacity-50 border-border focus:border-primary border-opacity-50 text-lg pl-6 shadow-inner"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className={cn(
                  "w-full h-16 rounded-[2rem] shadow-2xl transition-all duration-300 transform font-black uppercase tracking-[0.3em] text-lg",
                  formData.role === 'donor' ? "bg-primary shadow-primary shadow-opacity-20 hover:bg-primary hover:bg-opacity-90" : "bg-secondary shadow-secondary shadow-opacity-20 hover:bg-secondary hover:bg-opacity-90 text-white"
                )}
                disabled={loading}
              >
                {loading ? 'Initializing Interface...' : `Initialize ${formData.role === 'donor' ? 'HERO' : 'SEEKER'} Profile`}
              </Button>
            </form>

            <div className="pt-8 text-center relative z-10 border-t border-border border-opacity-20">
              <p className="text-xs text-muted-foreground font-black uppercase tracking-tighter">
                Already part of the network?{' '}
                <Link to="/login" className="text-primary font-black hover:underline underline-offset-4 decoration-2 transition-all">
                  Synchronize Identity
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
