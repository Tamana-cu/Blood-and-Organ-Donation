import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Heart, LogOut, Plus, MapPin, Phone, AlertCircle, Clock, Zap, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import NotificationBell from '@/components/NotificationBell';

export default function RecipientDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    type: 'blood',
    bloodGroup: 'O+',
    organType: 'kidney',
    urgency: 'medium',
    location: '',
    reason: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'recipient') {
      navigate('/');
      return;
    }

    setUser(userData);
    setFormData((prev) => ({ ...prev, location: userData.location }));
    fetchRequests(token);
  }, [navigate]);

  const fetchRequests = async (tokenArg?: string) => {
    const token = tokenArg || localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await fetch('/api/requests/user/my-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    const url = editingRequest ? `/api/requests/${editingRequest._id}` : '/api/requests';
    const method = editingRequest ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: editingRequest ? "Request Updated" : "Request Created",
          description: editingRequest ? "Your request has been successfully updated." : `We found ${data.matchedDonorCount} matching donors for you!`,
        });
        setShowForm(false);
        setEditingRequest(null);
        setFormData({
          type: 'blood',
          bloodGroup: 'O+',
          organType: 'kidney',
          urgency: 'medium',
          location: user.location,
          reason: '',
        });
        fetchRequests();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to save request',
          variant: 'destructive',
        });
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const startEditing = (request: any) => {
    setEditingRequest(request);
    setFormData({
      type: request.type,
      bloodGroup: request.bloodGroup || 'O+',
      organType: request.organType || 'kidney',
      urgency: request.urgency,
      location: request.location,
      reason: request.reason || '',
    });
    setShowForm(true);
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = (req.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (req.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (req.organType?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (req.matchedDonors && req.matchedDonors.some((d: any) => d.name?.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesType = filterType === 'all' || req.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Initializing Mission Protocol...</p>
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 w-full z-50 glass border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-6 h-6 text-primary fill-primary group-hover:scale-110 transition-transform duration-300" />
              <Activity className="w-4 h-4 text-secondary absolute -right-1 -top-1" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter gradient-text">LifeLink</span>
          </Link>
          <div className="flex gap-4 items-center">
            <NotificationBell />
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Recipient Account</span>
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
          <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-8">
            <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}!</h1>
            <p className="opacity-90">
              Find compatible donors and request the blood or organ you need
            </p>
          </div>

          <div className="bg-white rounded-lg border border-border p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div className="w-full md:w-auto">
                <h2 className="text-2xl font-bold">Your Requests</h2>
                <p className="text-muted-foreground">Manage your lifesaving requests</p>
              </div>
              
              <div className="flex flex-1 max-w-md w-full gap-2">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Search requests or donors..." 
                    className="pl-10 rounded-xl bg-gray-50 bg-opacity-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
                  {['all', 'blood', 'organ'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all",
                        filterType === t 
                          ? "bg-white text-primary shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => {
                  setEditingRequest(null);
                  setFormData({
                    type: 'blood',
                    bloodGroup: 'O+',
                    organType: 'kidney',
                    urgency: 'medium',
                    location: user.location,
                    reason: ''
                  });
                  setShowForm(true);
                }}
                className="rounded-full px-8 h-12 shadow-xl shadow-primary shadow-opacity-20 gap-2"
              >
                <Plus className="w-5 h-5" />
                New Request
              </Button>
            </div>

            {showForm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl glass dark:glass-dark rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black">{editingRequest ? 'Edit Request' : 'Create LifeLink Request'}</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setShowForm(false);
                        setEditingRequest(null);
                      }} 
                      className="rounded-full"
                    >
                      <Plus className="w-6 h-6 rotate-45" />
                    </Button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="type">Request Type</Label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="blood">Blood</option>
                          <option value="organ">Organ</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="urgency">Urgency</Label>
                        <select
                          id="urgency"
                          value={formData.urgency}
                          onChange={(e) => setFormData((prev) => ({ ...prev, urgency: e.target.value }))}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    {formData.type === 'blood' ? (
                      <div className="space-y-2">
                        <Label htmlFor="bloodGroup">Blood Group</Label>
                        <select
                          id="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData((prev) => ({ ...prev, bloodGroup: e.target.value }))}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                          <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="organType">Organ Type</Label>
                        <select
                          id="organType"
                          value={formData.organType}
                          onChange={(e) => setFormData((prev) => ({ ...prev, organType: e.target.value }))}
                          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="kidney">Kidney</option><option value="liver">Liver</option>
                          <option value="heart">Heart</option><option value="lung">Lung</option>
                          <option value="pancreas">Pancreas</option><option value="cornea">Cornea</option>
                          <option value="bone_marrow">Bone Marrow</option>
                        </select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" type="text" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Medical Reason (Optional)</Label>
                      <textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold">
                      {loading ? 'Processing...' : (editingRequest ? 'Update Request' : 'Post Request')}
                      <Activity className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </motion.div>
              </div>
            )}
          </div>

          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg border border-border p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-xl font-bold capitalize">
                          {request.type}
                          {request.type === 'blood' ? ` (${request.bloodGroup})` : ` (${(request.organType || '').replace('_', ' ')})`}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <span className={`px-2 py-1 rounded border ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency} urgency
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {request.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEditing(request)}>Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => setExpandedRequestId(expandedRequestId === request._id ? null : request._id)}>
                        {expandedRequestId === request._id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                  </div>

                  <div className="py-6 flex justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
                    {[
                      { step: 'Created', icon: Plus, active: true },
                      { step: 'Verification', icon: ShieldCheck, active: true },
                      { step: 'Matching', icon: Activity, active: (request.matchedDonors || []).length > 0 },
                      { step: 'Contacted', icon: Phone, active: request.status === 'completed' || request.status === 'matched' },
                      { step: 'Complete', icon: CheckCircle2, active: request.status === 'completed' }
                    ].map((s, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                          s.active ? "bg-primary text-white shadow-lg shadow-primary" : "bg-white border border-border text-muted-foreground"
                        )}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-tighter",
                          s.active ? "text-primary" : "text-muted-foreground"
                        )}>{s.step}</span>
                      </div>
                    ))}
                  </div>

                      {expandedRequestId === request._id && request.matchedDonors && request.matchedDonors.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4 border-t overflow-hidden"
                    >
                          <h5 className="font-semibold mb-3">Matched Donors</h5>
                          <div className="space-y-4">
                            {(request.matchedDonors || []).map((donor: any) => {
                          const isNearMe =
                            donor.location.toLowerCase() ===
                              request.location.toLowerCase() ||
                            donor.location
                              .toLowerCase()
                              .includes(request.location.toLowerCase()) ||
                            request.location
                              .toLowerCase()
                              .includes(donor.location.toLowerCase());

                          return (
                            <div
                              key={donor._id}
                              className={cn(
                                'p-4 rounded-xl border transition-all duration-300 hover:shadow-md flex justify-between items-center group',
                                isNearMe
                                  ? 'bg-primary bg-opacity-5 border-primary border-opacity-20'
                                  : 'bg-white border-border'
                              )}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-lg text-foreground">
                                    {donor.name}
                                  </p>
                                  {isNearMe && (
                                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Near You
                                    </span>
                                  )}
                                </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                      <Phone className="w-4 h-4 text-primary text-opacity-70" />
                                      {donor.phone}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="w-4 h-4 text-primary text-opacity-70" />
                                      {donor.location}
                                    </span>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="rounded-full shadow-sm"
                                  asChild
                                >
                                  <a href={`tel:${donor.phone}`}>Call Now</a>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {request.reason && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Medical Reason: </span>
                        {request.reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                No requests yet. Create one to start finding donors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
