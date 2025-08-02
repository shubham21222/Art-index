'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Trash2,
  Eye,
  User,
  Shield,
  Building2,
  Megaphone,
  Gavel,
  Calendar,
  Mail,
  Phone,
  CalendarDays,
} from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    sponsors: 0,
    galleries: 0,
    museums: 0,
    auctions: 0,
    fairs: 0,
    regularUsers: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [searchQuery, roleFilter, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        role: roleFilter,
        ...(searchQuery && { search: searchQuery }),
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/all?${params}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await res.json();
      console.log('Users API response:', data); // Debug log
      if (data.status && data.items) {
        const userList = data.items.items || data.items;
        console.log('User list:', userList); // Debug log
        setUsers(userList);
        setPagination(prev => ({
          ...prev,
          currentPage: data.items.pagination?.currentPage || 1,
          totalPages: data.items.pagination?.totalPages || 1,
          totalItems: data.items.pagination?.totalItems || 0,
        }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/stats`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Stats API response:', data); // Debug log
        if (data.status && data.items) {
          setStats(data.items.breakdown || {});
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: 'bg-red-100 text-red-800',
      SPONSOR: 'bg-orange-100 text-orange-800',
      GALLERY: 'bg-blue-100 text-blue-800',
      GALLERIES: 'bg-blue-100 text-blue-800',
      MUSEUMS: 'bg-indigo-100 text-indigo-800',
      AUCTIONS: 'bg-purple-100 text-purple-800',
      FAIRS: 'bg-pink-100 text-pink-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={variants[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'SPONSOR':
        return <Megaphone className="w-4 h-4" />;
      case 'GALLERY':
      case 'GALLERIES':
        return <Building2 className="w-4 h-4" />;
      case 'MUSEUMS':
        return <Building2 className="w-4 h-4" />;
      case 'AUCTIONS':
        return <Gavel className="w-4 h-4" />;
      case 'FAIRS':
        return <Calendar className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage all users across the platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sponsors</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.sponsors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Galleries</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.galleries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Search and filter users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="sponsor">Sponsors</SelectItem>
                <SelectItem value="gallery">Galleries</SelectItem>
                <SelectItem value="museums">Museums</SelectItem>
                <SelectItem value="auctions">Auctions</SelectItem>
                <SelectItem value="fairs">Fairs</SelectItem>
                <SelectItem value="user">Regular Users</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || roleFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No users have been created yet.'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <div className="font-medium">{user.name || 'Unnamed User'}</div>
                            <div className="text-sm text-gray-500">ID: {user._id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.mobile && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{user.mobile}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <CalendarDays className="w-3 h-3" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                    {pagination.totalItems} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{selectedUser.name || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{selectedUser.mobile || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm">{formatDate(selectedUser.updatedAt)}</p>
                </div>
              </div>

              {selectedUser.partnershipType && (
                <div>
                  <Label className="text-sm font-medium">Partnership Type</Label>
                  <p className="text-sm capitalize">{selectedUser.partnershipType}</p>
                </div>
              )}

              {selectedUser.isPartner && (
                <div>
                  <Label className="text-sm font-medium">Partner Status</Label>
                  <Badge className="bg-green-100 text-green-800">Partner</Badge>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
