"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [artsyProduct, setArtsyProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offer`, {
        headers: { 'Authorization': `${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOffers(data.offers || []);
      } else {
        toast.error(data.message || "Failed to fetch offers");
      }
    } catch (error) {
      toast.error("Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offer/${id}/${action}`, {
        method: "PATCH",
        headers: { 'Authorization': `${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Offer ${action}ed successfully`);
        fetchOffers();
      } else {
        toast.error(data.message || `Failed to ${action} offer`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} offer`);
    }
  };

  // Fetch Artsy product details
  const fetchArtsyProduct = async (externalProductId, externalProductSlug) => {
    setModalLoading(true);
    setArtsyProduct(null);
    try {
      const slug = externalProductSlug || externalProductId;
      const res = await fetch(`/api/artwork`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query ArtworkDetailsQuery($slug: String!) {\n  artwork(id: $slug) {\n    title\n    image { large: url(version: \"large\") }\n    artist { name }\n    description(format: HTML)\n  }\n}`,
          variables: { slug }
        })
      });
      const data = await res.json();
      setArtsyProduct(data.data?.artwork);
    } catch (error) {
      setArtsyProduct(null);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Offer Management</h1>
        <Button onClick={fetchOffers} variant="outline">Refresh</Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User Email</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Offer Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer._id}>
                <TableCell>{new Date(offer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{offer.user?.email}</TableCell>
                <TableCell>
                  {offer.product?.title ? (
                    offer.product.title
                  ) : offer.externalProductTitle ? (
                    <button
                      className="text-blue-600 underline"
                      onClick={() => {
                        setSelectedOffer(offer);
                        fetchArtsyProduct(offer.externalProductId, offer.externalProductSlug);
                      }}
                    >
                      {offer.externalProductTitle}
                    </button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>${offer.offerAmount}</TableCell>
                <TableCell>
                  <Badge variant={
                    offer.status === 'accepted' ? 'success' : offer.status === 'rejected' ? 'destructive' : 'warning'
                  }>
                    {offer.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {offer.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAction(offer._id, 'accept')}>Accept</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(offer._id, 'reject')}>Reject</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {offers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">No offers found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Modal for Artsy Product Details */}
      <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {artsyProduct?.title || selectedOffer?.externalProductTitle || "Product Details"}
            </DialogTitle>
          </DialogHeader>
          {modalLoading ? (
            <div>Loading...</div>
          ) : artsyProduct ? (
            <div>
              {artsyProduct.image?.large && (
                <img src={artsyProduct.image.large} alt={artsyProduct.title} className="mb-4 max-h-60" />
              )}
              {/* Show price as a range if both adjusted and listing prices are available */}
              {(() => {
                // Parse numeric values from price strings
                const parsePrice = (price) => {
                  if (!price) return null;
                  const match = price.toString().replace(/[$,]/g, '').match(/\d+/g);
                  if (!match) return null;
                  return parseInt(match.join(''));
                };
                const listPrice = parsePrice(artsyProduct.listPrice);
                const adjustedPrice = parsePrice(artsyProduct.adjustedPrice);
                if (listPrice && adjustedPrice) {
                  const min = Math.min(listPrice, adjustedPrice);
                  const max = Math.max(listPrice, adjustedPrice);
                  return (
                    <div className="mb-2 font-semibold text-lg">
                      ${min.toLocaleString()} - ${max.toLocaleString()}
                    </div>
                  );
                } else if (listPrice) {
                  return (
                    <div className="mb-2 font-semibold text-lg">
                      ${listPrice.toLocaleString()}
                    </div>
                  );
                } else if (adjustedPrice) {
                  return (
                    <div className="mb-2 font-semibold text-lg">
                      ${adjustedPrice.toLocaleString()}
                    </div>
                  );
                }
                return null;
              })()}
              <div><strong>Artist:</strong> {artsyProduct.artist?.name}</div>
              <div className="mt-2" dangerouslySetInnerHTML={{ __html: artsyProduct.description }} />
            </div>
          ) : (
            <div>Could not load product details.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 