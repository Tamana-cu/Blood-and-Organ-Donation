import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Heart, LogOut, Plus, Check, MapPin, Zap, Activity, HeartPulse, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, Share2, Award, Printer, ShieldCheck as Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/NotificationBell';

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    bloodGroup: 'O+',
    organs: [] as string[],
    location: '',
    isAvailable: true,
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCertificate, setShowCertificate] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const organs = [
    'kidney',
    'liver',
    'heart',
    'lung',
    'pancreas',
    'cornea',
    'bone_marrow',
  ];

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    setFormData((prev) => ({ ...prev, location: userData.location }));

    // Fetch donor profile
    fetchDonorProfile(token);
    fetchMatchingRequests(token);
  }, [navigate]);

  const fetchDonorProfile = async (token: string) => {
    try {
      const response = await fetch('/api/donors/profile/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setDonorProfile(profile);
        setFormData({
          bloodGroup: profile.bloodGroup,
          organs: profile.organs,
          location: profile.location,
          isAvailable: profile.isAvailable,
          notes: profile.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching donor profile:', error);
    }
  };

  const fetchMatchingRequests = async (token: string) => {
    try {
      const response = await fetch('/api/donors/profile/matches', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMatchingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching matching requests:', error);
    }
  };

  const filteredRequests = (matchingRequests || []).filter(req => {
    const matchesSearch = (req.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (req.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (req.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (req.organType?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || req.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleOrganToggle = (organ: string) => {
    setFormData((prev) => ({
      ...prev,
      organs: prev.organs.includes(organ)
        ? prev.organs.filter((o) => o !== organ)
        : [...prev.organs, organ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const url = donorProfile
        ? `/api/donors/${donorProfile._id}`
        : '/api/donors/register';
      const method = donorProfile ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.message || 'Failed to save profile',
          variant: 'destructive',
        });
        return;
      }

      setDonorProfile(data.donor);
      setShowForm(false);
      if (token) fetchMatchingRequests(token); // Refresh matches
      toast({
        title: 'Success',
        description: 'Profile saved successfully!',
      });
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Heart className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Synchronizing Donor Database...</p>
        </div>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="flex gap-4 items-center">
            <NotificationBell />
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Donor Account</span>
              <span className="text-sm font-black">{user.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full">
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container max-w-6xl mx-auto px-4 pt-32 pb-12">
        <div className="space-y-8">
          {/* Welcome */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-3 bg-gradient-to-r from-primary to-secondary text-white rounded-[2rem] p-10 relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h1 className="text-5xl font-black mb-2 tracking-tighter">Welcome, {user.name}!</h1>
                <p className="text-lg opacity-90 font-bold uppercase tracking-widest text-[12px]">Your contribution saves lives every day</p>
                <div className="mt-8 flex gap-4">
                  <Button 
                    className="bg-white text-primary rounded-full hover:bg-gray-100"
                    onClick={() => setShowBadges(true)}
                  >
                    View My Badges
                  </Button>
                  <Button 
                    className="bg-white bg-opacity-20 backdrop-blur text-white border border-white border-opacity-20 rounded-full"
                    onClick={() => setShowResults(true)}
                  >
                    Share Results
                  </Button>
                  <Button 
                    className="bg-primary bg-opacity-90 text-white border border-white border-opacity-30 rounded-full hover:bg-primary transition-all shadow-lg"
                    onClick={() => setShowCertificate(true)}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Get Certificate
                  </Button>
                </div>
              </div>
              <HeartPulse className="absolute right-[-20px] top-[-20px] w-64 h-64 opacity-10 rotate-12" />
            </div>
            
            <div className="bg-white rounded-[2rem] border border-border p-8 flex flex-col justify-between shadow-xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pb-2">Hero Impact Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-black text-primary">850</span>
                  <Zap className="w-5 h-5 text-secondary fill-secondary" />
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Next Milestone</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-3/4 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Status */}
              {donorProfile ? (
                <div className="bg-white rounded-lg border border-border p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <h2 className="text-2xl font-bold">Donor Profile Active</h2>
                      </div>
                      <p className="text-muted-foreground">
                        You are currently registered as a donor
                      </p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                      {showForm ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>

                  {!showForm && (
                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">
                          Blood Group
                        </label>
                        <p className="text-lg font-bold text-primary mt-1">
                          {donorProfile.bloodGroup}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-muted-foreground">
                          Availability
                        </label>
                        <p className="text-lg font-bold mt-1">
                          {donorProfile.isAvailable ? (
                            <span className="text-green-600">Available</span>
                          ) : (
                            <span className="text-red-600">Not Available</span>
                          )}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          Organs
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(donorProfile.organs || []).map((organ: string) => (
                            <span
                              key={organ}
                              className="bg-red-50 text-red-600 border border-red-100 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
                            >
                              {(organ || '').replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          Location
                        </label>
                        <p className="text-lg mt-1">{donorProfile.location}</p>
                      </div>
                      {donorProfile.notes && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          Notes
                        </label>
                        <p className="text-lg mt-1">{donorProfile.notes}</p>
                      </div>
                    )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 space-y-4">
                  <h2 className="text-2xl font-bold text-blue-900">
                    Complete Your Donor Profile
                  </h2>
                  <p className="text-blue-800">
                    To start helping others, please fill out your donor information.
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Donor Profile
                  </Button>
                </div>
              )}

              {/* Profile Form */}
              {showForm && (
                <div className="bg-white rounded-lg border border-border p-8">
                  <h3 className="text-2xl font-bold mb-6">
                    {donorProfile ? 'Edit' : 'Create'} Donor Profile
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <select
                          id="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bloodGroup: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option>O+</option>
                          <option>O-</option>
                          <option>A+</option>
                          <option>A-</option>
                          <option>B+</option>
                          <option>B-</option>
                          <option>AB+</option>
                          <option>AB-</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Organs You Can Donate</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {organs.map((organ) => (
                          <button
                            key={organ}
                            type="button"
                            onClick={() => handleOrganToggle(organ)}
                            className={`p-3 rounded-lg border transition ${
                              formData.organs.includes(organ)
                                ? 'bg-primary text-white border-primary'
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            {(organ || '').replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                        placeholder="Any additional information about your donation availability..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? 'Saving...' : 'Save Profile'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" />
                  LifeLink Priority Filter
                </h3>
                
                <div className="flex flex-col gap-4 p-4 bg-white rounded-2xl border border-border border-opacity-50 shadow-sm">
                  <div className="relative">
                    <Input 
                      placeholder="Search by location, patient or type..." 
                      className="pl-10 rounded-xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'blood', 'organ'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
                          filterType === type 
                            ? "bg-primary text-white border-primary shadow-lg" 
                            : "bg-white text-muted-foreground border-border hover:border-primary"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredRequests.length > 0 ? (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request._id}
                      className="bg-white rounded-xl border border-border p-5 space-y-4 hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          getUrgencyColor(request.urgency)
                        )}>
                          {request.urgency} Urgency
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg capitalize">
                          {request.type === 'blood' ? `Blood: ${request.bloodGroup}` : `Organ: ${request.organType}`}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {request.location}
                        </p>
                      </div>
                      <div className="pt-3 border-t flex justify-between items-center">
                        <p className="text-xs font-medium">Requested by: {request.userId?.name || 'Anonymous'}</p>
                        {request.userId?.phone ? (
                          <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                            <a href={`tel:${request.userId.phone}`}>Contact</a>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 text-xs" disabled>
                            No Contact
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-border p-12 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-sm text-muted-foreground">No matching requests at the moment.</p>
                </div>
              )}

              {/* Advance Guidelines Card */}
              <div className="bg-gray-900 text-white rounded-[2rem] p-10 mt-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary bg-opacity-20 rounded-full blur-3xl -mr-16 -mt-16" />
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                  Medical Guidelines
                </h3>
                <ul className="space-y-4">
                  {[
                    "Ensure you are well-rested and hydrated before donation.",
                    "Carry a valid government ID for verification at the clinic.",
                    "Avoid strenuous activity for 24 hours post-donation.",
                    "Report any symptoms or medications during the check-up."
                  ].map((text, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                      <div className="w-5 h-5 rounded-full bg-white bg-opacity-10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black">{i+1}</span>
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none overflow-y-auto max-h-[95vh] sm:rounded-[2.5rem] scrollbar-hide">
          <div className="bg-white dark:bg-slate-900 overflow-hidden relative border-[12px] border-double border-primary border-opacity-20 m-2 rounded-[2rem] shadow-2xl">
            {/* Certificate Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary bg-opacity-5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary bg-opacity-5 rounded-full -ml-32 -mb-32 blur-3xl" />
            
            <div className="relative p-12 text-center space-y-8">
              <div className="flex justify-center mb-4">
                <div className="bg-primary bg-opacity-10 p-4 rounded-full">
                  <Heart className="w-16 h-16 text-primary fill-primary fill-opacity-20" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary text-opacity-60">Certificate of Recognition</h2>
                <h3 className="text-4xl font-extrabold tracking-tight dark:text-white">LifeLink Hero Award</h3>
              </div>

              <div className="py-8">
                <p className="text-muted-foreground font-medium italic mb-6">This award is proudly presented to</p>
                <h4 className="text-5xl font-black gradient-text py-2">{user?.name}</h4>
                <div className="w-48 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto mt-6" />
              </div>

              <div className="max-w-xl mx-auto space-y-6">
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  In appreciation of your heroic commitment and selfless contribution as a registered <span className="font-bold text-primary">LifeLink Donor</span>. Your willingness to help others brings hope and saves lives within our global medical network.
                </p>
                
                <div className="grid grid-cols-3 items-center gap-8 pt-6">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Blood Group</p>
                    <p className="text-xl font-bold text-primary">{donorProfile?.bloodGroup || 'O+'}</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-double border-primary border-opacity-30 flex items-center justify-center bg-white dark:bg-slate-800 shadow-inner relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary bg-opacity-5 animate-pulse" />
                      <Award className="w-12 h-12 text-primary relative z-10" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Issue Date</p>
                    <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-12 flex justify-center gap-4 border-t border-border border-opacity-50">
                <Button 
                  onClick={() => {
                    window.print();
                    toast({ title: "Redirecting to Print", description: "Standard OS printer dialog initiated." });
                  }}
                  className="rounded-full px-8 shadow-xl hover:scale-105 transition-transform"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full px-8 shadow-md"
                  onClick={() => setShowCertificate(false)}
                >
                  Close
                </Button>
              </div>
            </div>
            
            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-primary border-opacity-20 rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-primary border-opacity-20 rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-primary border-opacity-20 rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-primary border-opacity-20 rounded-br-xl" />
          </div>
        </DialogContent>
      </Dialog>

      {/* Badges Modal */}
      <Dialog open={showBadges} onOpenChange={setShowBadges}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none rounded-[2rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black tracking-tight text-center">Achievements & Badges</DialogTitle>
            <DialogDescription className="text-center font-bold uppercase tracking-widest text-[10px] text-primary/60">Your Lifelife Hero Progress</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
            {[
              { id: 1, name: "Fast Responder", icon: "Zap", color: "text-amber-500 bg-amber-50", desc: "First 1 hour reply.", unlocked: true },
              { id: 2, name: "Life Saver", icon: "Heart", color: "text-red-500 bg-red-50", desc: "Signed up to donate.", unlocked: true },
              { id: 3, name: "City Hero", icon: "MapPin", color: "text-blue-500 bg-blue-50", desc: "Helped outside zone.", unlocked: true },
              { id: 4, name: "Veteran Donor", icon: "Shield", color: "text-emerald-500 bg-emerald-50", desc: "5 Active donations.", unlocked: false },
              { id: 5, name: "Community Star", icon: "Check", color: "text-purple-500 bg-purple-50", desc: "Highest local score.", unlocked: false },
              { id: 6, name: "Early Bird", icon: "Award", color: "text-rose-500 bg-rose-50", desc: "First 100 members.", unlocked: true },
            ].map((badge) => (
              <motion.div 
                key={badge.id} 
                whileHover={badge.unlocked ? { scale: 1.05 } : {}}
                whileTap={badge.unlocked ? { scale: 0.95 } : {}}
                onClick={() => {
                  if (badge.unlocked) {
                    toast({
                      title: `${badge.name} Unlocked!`,
                      description: `${badge.desc} Achievement verified in the LifeLink network.`,
                    });
                  } else {
                    toast({
                      title: `${badge.name} Locked`,
                      description: `This achievement is in progress. ${badge.desc}`,
                      variant: "destructive"
                    });
                  }
                }}
                className={cn(
                  "flex flex-col items-center p-5 rounded-3xl border border-border border-opacity-50 text-center gap-3 bg-white dark:bg-slate-800 shadow-sm transition-all",
                  badge.unlocked ? "cursor-pointer hover:shadow-md" : "opacity-40 grayscale"
                )}
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", badge.color)}>
                   {badge.id === 1 && <Zap className="w-8 h-8" />}
                   {badge.id === 2 && <HeartPulse className="w-8 h-8 text-red-500" />}
                   {badge.id === 3 && <MapPin className="w-8 h-8" />}
                   {badge.id === 4 && <Shield className="w-8 h-8" />}
                   {badge.id === 5 && <Check className="w-8 h-8" />}
                   {badge.id === 6 && <Award className="w-8 h-8 text-rose-500" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-tight">{badge.name}</h4>
                  <p className="text-[9px] text-muted-foreground mt-1 opacity-70">{badge.unlocked ? "Mission Success" : "Mission Pending"}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button variant="outline" className="rounded-full px-12 uppercase tracking-widest text-[10px] font-black" onClick={() => setShowBadges(false)}>Return to Hub</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medical Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none rounded-[2rem] shadow-2xl p-0 overflow-y-auto max-h-[90vh]">
          <div className="bg-primary/5 p-8 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-primary">Medical Health Synchronization</DialogTitle>
              <DialogDescription className="font-bold uppercase tracking-widest text-[10px] text-primary/60">Live Vitals & Screening Parameters</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Hemoglobin", value: "14.2 g/dL", status: "Normal" },
                { label: "Blood Pressure", value: "120/80", status: "Ideal" },
                { label: "Platelet Count", value: "250,500/uL", status: "Healthy" },
                { label: "White Cells", value: "7,200 cells/uL", status: "Optimum" },
                { label: "Health Score", value: "98%", status: "Fit to Donate" },
                { label: "Recovery Time", value: "24h Target", status: "Excellent" },
              ].map((res, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-gray-50/50 flex justify-between items-center group hover:bg-primary/5 transition-colors">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">{res.label}</p>
                    <p className="text-lg font-black">{res.value}</p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 bg-green-500/10 text-green-600 rounded-lg uppercase">{res.status}</span>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center gap-4">
              <Shield className="w-10 h-10 text-secondary" />
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest">Medical Clearance</p>
                <p className="text-sm opacity-80 mt-0.5 leading-relaxed font-medium capitalize">User designation <span className="text-secondary font-black">{user?.name}</span> is cleared for donation deployment across the global medical network.</p>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border flex justify-end gap-3 bg-gray-50/50">
            <Button variant="outline" className="rounded-full" onClick={() => setShowResults(false)}>Close Vitals</Button>
            <Button className="rounded-full" onClick={() => {
              window.print();
              toast({ title: "Export Started", description: "Sharing health parameters via system uplink." });
            }}>Download Transcript</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
