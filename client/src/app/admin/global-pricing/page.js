'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    TrendingUp,
    Info
} from "lucide-react";
import { BASE_URL } from '@/config/baseUrl';    
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GlobalPricingPage() {
    const [adjustmentPercentage, setAdjustmentPercentage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const auth = useSelector((state) => state.auth);
    const router = useRouter();

    // Check authentication on component mount
    if (!auth.token) {
        router.push('/admin/login');
        return null;
    }

    const handleApplyAdjustment = async () => {
        if (!adjustmentPercentage || adjustmentPercentage === '0') {
            setMessage('Please enter a valid percentage');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${BASE_URL}/artwork-pricing/global-adjustment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.token
                },
                body: JSON.stringify({
                    adjustmentPercentage: parseFloat(adjustmentPercentage),
                    adjustmentReason: `Global ${parseFloat(adjustmentPercentage) > 0 ? 'increase' : 'decrease'} of ${Math.abs(parseFloat(adjustmentPercentage))}%`
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Global pricing adjustment applied successfully! All artwork prices have been ${parseFloat(adjustmentPercentage) > 0 ? 'increased' : 'decreased'} by ${Math.abs(parseFloat(adjustmentPercentage))}%`);
                setMessageType('success');
                setAdjustmentPercentage('');
            } else {
                setMessage(data.message || 'Failed to apply global adjustment');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('An error occurred while applying the adjustment');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPricing = async () => {
        if (!confirm('Are you sure you want to reset all pricing to original values? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${BASE_URL}/artwork-pricing/reset-all`, {
                method: 'POST',
                headers: {
                    'Authorization': auth.token
                }
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('All pricing has been reset to original values');
                setMessageType('success');
            } else {
                setMessage(data.message || 'Failed to reset pricing');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('An error occurred while resetting pricing');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Global Pricing Adjustment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                                This will apply a percentage adjustment to all artwork prices across the platform.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="percentage" className="text-sm font-medium">
                                    Adjustment Percentage
                                </Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        id="percentage"
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g., 10 for 10% increase, -5 for 5% decrease"
                                        value={adjustmentPercentage}
                                        onChange={(e) => setAdjustmentPercentage(e.target.value)}
                                        className="flex-1"
                                    />
                                    <span className="text-sm text-gray-500">%</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Positive for increase, negative for decrease
                                </p>
                            </div>

                            {adjustmentPercentage && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        This will {parseFloat(adjustmentPercentage) > 0 ? 'increase' : 'decrease'} all artwork prices by{' '}
                                        <span className="font-semibold">{Math.abs(parseFloat(adjustmentPercentage))}%</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {message && (
                            <Alert className={messageType === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                                <AlertDescription className={messageType === 'error' ? 'text-red-800' : 'text-green-800'}>
                                    {message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-3">
                            <Button 
                                onClick={handleApplyAdjustment} 
                                disabled={isLoading || !adjustmentPercentage}
                                className="flex-1"
                            >
                                {isLoading ? 'Applying...' : 'Apply Global Adjustment'}
                            </Button>
                            
                            <Button 
                                onClick={handleResetPricing} 
                                disabled={isLoading}
                                variant="outline"
                            >
                                Reset All Pricing
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 