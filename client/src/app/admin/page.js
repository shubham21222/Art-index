'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [emailResponse, setEmailResponse] = useState('');
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Check admin role
    if (user?.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
      return;
    }

    fetchInquiries();
  }, [isAuthenticated, user, router]);

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/admin/inquiries');
      const data = await response.json();
      if (data.success) {
        setInquiries(data.inquiries);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error('Failed to fetch inquiries');
    }
  };

  const handleSendResponse = async (inquiryId) => {
    if (!emailResponse.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      const response = await fetch('/api/admin/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inquiryId,
          response: emailResponse,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Response sent successfully');
        setEmailResponse('');
        setSelectedInquiry(null);
        fetchInquiries(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send response');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
        >
          Back to Site
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inquiries List */}
        <Card>
          <CardHeader>
            <CardTitle>Price Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedInquiry?._id === inquiry._id
                      ? 'border-black bg-gray-50'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{inquiry.name}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{inquiry.email}</p>
                  <p className="text-sm text-gray-800">{inquiry.message}</p>
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-medium">
                      Artwork: {inquiry.artwork.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {inquiry.status}
                    </p>
                  </div>
                </div>
              ))}
              {inquiries.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No inquiries yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send Response</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInquiry ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Responding to
                  </label>
                  <Input
                    value={selectedInquiry.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Response
                  </label>
                  <Textarea
                    value={emailResponse}
                    onChange={(e) => setEmailResponse(e.target.value)}
                    placeholder="Enter your response..."
                    rows={6}
                    className="resize-none"
                  />
                </div>
                <Button
                  onClick={() => handleSendResponse(selectedInquiry._id)}
                  className="w-full"
                >
                  Send Response
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Select an inquiry to respond
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 