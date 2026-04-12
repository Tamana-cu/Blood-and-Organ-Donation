import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Heart, LogOut, Trash2, Check, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationBell from '@/components/NotificationBell';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userStr = localStorage.getItem('user');

    if (!userStr || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      navigate('/');
      return;
    }

    setUser(userData);
    fetchDashboardData();
  }, [navigate, token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch pending users
      const pendingResponse = await fetch('/api/admin/users/pending/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingUsers(pendingData);
      }

      // Fetch all users
      const usersResponse = await fetch('/api/admin/users/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleApproveUser = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User approved successfully',
        });
        setPendingUsers(pendingUsers.filter((u) => u._id !== userId));
        fetchDashboardData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to approve user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
        setUsers(users.filter((u) => u._id !== userId));
        fetchDashboardData();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
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

  if (!user || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Establishing Admin Uplink...</p>
        </div>
      </div>
    );
  }

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
            <span className="text-xl font-extrabold tracking-tighter gradient-text">LifeLink Admin</span>
          </Link>
          <div className="flex gap-4 items-center">
            <NotificationBell />
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Control Center</span>
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
          {/* Tabs */}
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 font-semibold border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-3 font-semibold border-b-2 ${
                activeTab === 'pending'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Pending Approvals ({pendingUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-3 font-semibold border-b-2 ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Users ({users.length})
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-8">
                <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                <p className="opacity-90">Manage users, donors, and requests</p>
              </div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-border p-6 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Total Users</p>
                  <p className="text-4xl font-bold text-primary">{stats.totalUsers}</p>
                </div>
                <div className="bg-white rounded-lg border border-border p-6 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Active Donors</p>
                  <p className="text-4xl font-bold text-secondary">{stats.totalDonors}</p>
                </div>
                <div className="bg-white rounded-lg border border-border p-6 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Pending Approvals</p>
                  <p className="text-4xl font-bold text-accent">{stats.pendingApprovals}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-border p-6 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Total Requests</p>
                  <p className="text-4xl font-bold">{stats.totalRequests}</p>
                </div>
                <div className="bg-white rounded-lg border border-border p-6 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Matched Requests</p>
                  <p className="text-4xl font-bold text-green-600">{stats.matchedRequests}</p>
                </div>
                <div className="bg-white rounded-lg border border-border p-6 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Completed</p>
                  <p className="text-4xl font-bold text-blue-600">{stats.completedRequests}</p>
                </div>
              </div>

              {/* Blood Group Stats */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-border p-10 shadow-xl">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Donors by Blood Group
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {stats.bloodGroupStats.map((stat: any) => (
                      <div key={stat._id} className="text-center p-4 bg-gray-50 rounded-2xl border border-border hover:border-primary transition-colors group">
                        <p className="text-2xl font-black text-primary group-hover:scale-110 transition-transform">{stat._id}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-tighter">{stat.count} Heroes</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-border p-10 shadow-xl">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-secondary" />
                    System Growth
                  </h3>
                  <div className="h-[200px] w-full flex items-end justify-between gap-2">
                    {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                      <div key={i} className="flex-1 space-y-2 flex flex-col items-center">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          className="w-full bg-gradient-to-t from-secondary rounded-t-lg bg-opacity-20"
                        />
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">Day {i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Pending User Approvals</h2>
              {pendingUsers.length > 0 ? (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-lg border border-border p-6 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-lg">{user.name}</p>
                        <p className="text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Role: <span className="font-semibold capitalize">{user.role}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: <span className="font-semibold">{user.location}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phone: <span className="font-semibold">{user.phone}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveUser(user._id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={loading}
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              )}
            </div>
          )}

          {/* All Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">All Users</h2>
              {users.length > 0 ? (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-lg border border-border p-6 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-lg">{user.name}</p>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                          <span className="capitalize">{user.role}</span>
                          {user.isApproved ? (
                            <span className="text-green-600 font-semibold">✓ Approved</span>
                          ) : (
                            <span className="text-yellow-600 font-semibold">⏳ Pending</span>
                          )}
                          <span>{user.location}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
