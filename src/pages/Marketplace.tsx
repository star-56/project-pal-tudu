
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, DollarSign, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  created_at: string;
  profiles: {
    full_name: string;
    institution: string;
  };
}

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['marketplace-items', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_items')
        .select(`
          *,
          profiles:seller_id (
            full_name,
            institution
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const categories = [
    'Textbooks',
    'Electronics',
    'Furniture',
    'Clothing',
    'Sports Equipment',
    'School Supplies',
    'Dorm Items',
    'Transportation',
    'Other'
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to access the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">College Marketplace</h1>
            <p className="text-gray-600 mt-2">Buy and sell items with fellow students</p>
          </div>
          
          <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Sell Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                Item posting functionality will be implemented in the next update.
              </p>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading marketplace items...</div>
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: MarketplaceItem) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex items-center gap-1 text-green-600 font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge variant="outline">{item.condition}</Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                    <div>Seller: {item.profiles?.full_name}</div>
                    {item.profiles?.institution && (
                      <div>School: {item.profiles.institution}</div>
                    )}
                    <div>Posted: {formatDate(item.created_at)}</div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    Contact Seller
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-4">No items found in the marketplace</div>
            <Button onClick={() => setShowAddItemDialog(true)}>
              Be the first to sell something!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
