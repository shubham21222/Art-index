'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [response, setResponse] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiry`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch inquiries'); 
      }

      const response = await res.json();
      if (response.status && response.items) {
        setInquiries(response.items || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setIsResponding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiry/${selectedInquiry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({
          name: selectedInquiry.name,
          itemName: selectedInquiry.itemName,
          email: selectedInquiry.email,
          phone: selectedInquiry.phone,
          message: selectedInquiry.message,
          response: response.trim(),
          status: 'responded'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to send response');
      }

      toast.success('Response sent successfully');
      setSelectedInquiry(null);
      setResponse('');
      fetchInquiries(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Failed to send response');
    } finally {
      setIsResponding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Inquiry Management</h1>
        <Button onClick={fetchInquiries} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry._id}>
                <TableCell>
                  {format(new Date(inquiry.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{inquiry.name}</TableCell>
                <TableCell>{inquiry.email}</TableCell>
                <TableCell>{inquiry.phone || '-'}</TableCell>
                <TableCell>{inquiry.itemName}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {inquiry.message}
                </TableCell>
                <TableCell>
                  <Badge variant={inquiry.status === 'responded' ? 'success' : 'warning'}>
                    {inquiry.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setResponse(inquiry.response || '');
                    }}
                  >
                    {inquiry.status === 'responded' ? 'View Response' : 'Respond'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No inquiries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedInquiry?.status === 'responded' ? 'View Response' : 'Respond to Inquiry'}
            </DialogTitle>
            <DialogDescription>
              Inquiry from {selectedInquiry?.name} about {selectedInquiry?.itemName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Contact Information:</h4>
              <div className="text-sm text-gray-600">
                <p>Email: {selectedInquiry?.email}</p>
                <p>Phone: {selectedInquiry?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Original Message:</h4>
              <p className="text-sm text-gray-600">{selectedInquiry?.message}</p>
            </div>

            {selectedInquiry?.status === 'responded' ? (
              <div className="space-y-2">
                <h4 className="font-medium">Response:</h4>
                <p className="text-sm text-gray-600">{selectedInquiry?.response}</p>
                <p className="text-xs text-gray-500">
                  Responded on: {format(new Date(selectedInquiry?.respondedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="font-medium">Your Response:</h4>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response..."
                  rows={4}
                />
              </div>
            )}

            {selectedInquiry?.status !== 'responded' && (
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInquiry(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRespond}
                  disabled={isResponding}
                >
                  {isResponding ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 