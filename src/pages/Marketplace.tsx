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
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Filter, DollarSign, MapPin, ShoppingCart, Package, Users, BookOpen, Laptop, Shirt, Dumbbell, PenTool, Car, MoreHorizontal } from 'lucide-react';
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
  seller_profile: {
    full_name: string;
    institution: string;
  } | null;
}

interface NewItemData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  location: string;
  contact_info: string;
}

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState<NewItemData>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    contact_info: ''
  });

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['marketplace-items', searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_items')
        .select(`
          *,
          seller_profile:profiles!seller_id (
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
    { name: 'Textbooks', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
    { name: 'Electronics', icon: Laptop, color: 'bg-purple-100 text-purple-800' },
    { name: 'Furniture', icon: Package, color: 'bg-green-100 text-green-800' },
    { name: 'Clothing', icon: Shirt, color: 'bg-pink-100 text-pink-800' },
    { name: 'Sports Equipment', icon: Dumbbell, color: 'bg-orange-100 text-orange-800' },
    { name: 'School Supplies', icon: PenTool, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Dorm Items', icon: Package, color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Transportation', icon: Car, color: 'bg-red-100 text-red-800' },
    { name: 'Other', icon: MoreHorizontal, color: 'bg-gray-100 text-gray-800' }
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to list an item.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .insert({
          title: newItem.title,
          description: newItem.description,
          price: parseFloat(newItem.price),
          category: newItem.category,
          condition: newItem.condition,
          location: newItem.location,
          contact_info: newItem.contact_info,
          seller_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your item has been listed successfully.",
      });

      setShowAddItemDialog(false);
      setNewItem({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: '',
        location: '',
        contact_info: ''
      });
      refetch();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to list item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBuyItem = async (itemId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase items.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ 
          status: 'sold',
          buyer_id: user.id
        })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Purchase Successful!",
        description: "You have successfully purchased this item. The seller will be notified.",
      });

      refetch();
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Error",
        description: "Failed to purchase item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : Package;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : 'bg-gray-100 text-gray-800';
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Marketplace</h1>
          <p className="text-xl text-gray-600 mb-8">Buy, sell, and trade with fellow students</p>
          
          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedCategory === category.name 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">{category.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-4">
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
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <DialogTitle>List New Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <Input
                    placeholder="Item title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    required
                  />
                  <Textarea
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Price ($)"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    required
                  />
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newItem.condition} onValueChange={(value) => setNewItem({...newItem, condition: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Location"
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Contact info (email/phone)"
                    value={newItem.contact_info}
                    onChange={(e) => setNewItem({...newItem, contact_info: e.target.value})}
                    required
                  />
                  <Button type="submit" className="w-full">List Item</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading marketplace items...</div>
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <Badge variant="secondary" className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                        <DollarSign className="h-4 w-4" />
                        {formatPrice(item.price)}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{item.condition}</Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                      <div>Seller: {item.seller_profile?.full_name || 'Unknown'}</div>
                      {item.seller_profile?.institution && (
                        <div>School: {item.seller_profile.institution}</div>
                      )}
                      <div>Posted: {formatDate(item.created_at)}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleBuyItem(item.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
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
