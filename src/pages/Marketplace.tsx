"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Filter, DollarSign, MapPin, ShoppingCart, Package, Users, BookOpen, Laptop, Shirt, Dumbbell, PenTool, Car, MoreHorizontal, CreditCard, User } from 'lucide-react';
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
  images: string[];
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
  images: string[];
}

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [buyerInfo, setBuyerInfo] = useState({ name: '', email: '', phone: '' });
  const [newItem, setNewItem] = useState<NewItemData>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    contact_info: '',
    images: []
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
    { name: 'Textbooks', icon: BookOpen, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Electronics', icon: Laptop, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Furniture', icon: Package, color: 'bg-green-50 text-green-700 border-green-200' },
    { name: 'Clothing', icon: Shirt, color: 'bg-pink-50 text-pink-700 border-pink-200' },
    { name: 'Sports Equipment', icon: Dumbbell, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'School Supplies', icon: PenTool, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { name: 'Dorm Items', icon: Package, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'Transportation', icon: Car, color: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'Other', icon: MoreHorizontal, color: 'bg-gray-50 text-gray-700 border-gray-200' }
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
    
    const itemData = {
      title: newItem.title,
      description: newItem.description,
      price: parseFloat(newItem.price),
      category: newItem.category,
      condition: newItem.condition,
      location: newItem.location,
      contact_info: newItem.contact_info,
      images: newItem.images,
      seller_id: user?.id || null,
    };

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .insert(itemData);

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
        contact_info: '',
        images: []
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

  const handleBuyWithStripe = async (item: MarketplaceItem) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: Math.round(item.price * 100), // Convert to cents
          item_title: item.title,
          item_id: item.id,
          buyer_info: user ? {
            name: user.user_metadata?.full_name || 'Guest',
            email: user.email || 'guest@example.com'
          } : buyerInfo
        }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBuyItem = (item: MarketplaceItem) => {
    setSelectedItem(item);
    if (user) {
      // If user is authenticated, proceed directly with Stripe
      handleBuyWithStripe(item);
    } else {
      // If not authenticated, show buyer info dialog
      setShowBuyDialog(true);
    }
  };

  const handleGuestPurchase = () => {
    if (selectedItem && buyerInfo.name && buyerInfo.email) {
      handleBuyWithStripe(selectedItem);
      setShowBuyDialog(false);
      setBuyerInfo({ name: '', email: '', phone: '' });
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
    return category ? category.color : 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 mx-auto overflow-x-auto">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Notion-style Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
            <ShoppingCart className="h-4 w-4" />
            Student Marketplace
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Buy, sell, and trade with fellow students
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover amazing deals on textbooks, electronics, furniture, and more. 
            Connect with your campus community and make sustainable choices.
          </p>
          
          {/* Notion-style Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`notion-card p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-105 ${
                selectedCategory === 'all' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Package className="h-8 w-8 mx-auto mb-3 text-gray-600" />
              <p className="text-sm font-semibold text-gray-900">All Items</p>
              <p className="text-xs text-gray-500 mt-1">Browse everything</p>
            </button>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`notion-card p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:scale-105 ${
                    selectedCategory === category.name 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-8 w-8 mx-auto mb-3 text-gray-600" />
                  <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Find great deals</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notion-style Search and Actions */}
        <div className="notion-card bg-white rounded-2xl shadow-sm p-8 mb-12 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 flex gap-4 w-full">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for items, categories, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-56 h-12 border-gray-200 focus:border-blue-500 rounded-xl">
                  <Filter className="h-5 w-5 mr-2 text-gray-500" />
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
                <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-base">
                  <Plus className="h-5 w-5 mr-2" />
                  List Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900">List New Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-6">
                  <Input
                    placeholder="Item title"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    className="h-12 rounded-xl border-gray-200"
                    required
                  />
                  <Textarea
                    placeholder="Describe your item in detail..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="min-h-24 rounded-xl border-gray-200"
                    required
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price ($)"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="h-12 rounded-xl border-gray-200"
                    required
                  />
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                    <SelectTrigger className="h-12 rounded-xl border-gray-200">
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
                    <SelectTrigger className="h-12 rounded-xl border-gray-200">
                      <SelectValue placeholder="Item condition" />
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
                    placeholder="Location (e.g., Campus, Dorm building)"
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    className="h-12 rounded-xl border-gray-200"
                    required
                  />
                  <Input
                    placeholder="Contact info (email/phone)"
                    value={newItem.contact_info}
                    onChange={(e) => setNewItem({...newItem, contact_info: e.target.value})}
                    className="h-12 rounded-xl border-gray-200"
                    required
                  />
                  
                  <ImageUpload
                    onImagesChange={(imageUrls) => setNewItem({...newItem, images: imageUrls})}
                    maxImages={5}
                    maxSizePerImage={5}
                  />
                  
                  <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold">
                    List Item
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Guest Purchase Dialog */}
        <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Complete Your Purchase</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border">
                <h3 className="font-semibold text-gray-900">{selectedItem?.title}</h3>
                <p className="text-2xl font-bold text-green-600">{selectedItem && formatPrice(selectedItem.price)}</p>
              </div>
              <div className="space-y-4">
                <Input
                  placeholder="Your full name"
                  value={buyerInfo.name}
                  onChange={(e) => setBuyerInfo({...buyerInfo, name: e.target.value})}
                  className="h-12 rounded-xl border-gray-200"
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo({...buyerInfo, email: e.target.value})}
                  className="h-12 rounded-xl border-gray-200"
                  required
                />
                <Input
                  placeholder="Phone number (optional)"
                  value={buyerInfo.phone}
                  onChange={(e) => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                  className="h-12 rounded-xl border-gray-200"
                />
              </div>
              <Button 
                onClick={handleGuestPurchase}
                className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-semibold"
                disabled={!buyerInfo.name || !buyerInfo.email}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Items Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              Loading marketplace items...
            </div>
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              const hasImages = item.images && item.images.length > 0;
              return (
                <Card key={item.id} className="notion-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl border-gray-200 overflow-hidden">
                  {/* Image Carousel */}
                  {hasImages && (
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                          +{item.images.length - 1} more
                        </div>
                      )}
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <Badge variant="secondary" className={`${getCategoryColor(item.category)} border`}>
                          {item.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs font-medium">
                        {item.condition}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{item.seller_profile?.full_name || 'Anonymous Seller'}</span>
                      </div>
                      {item.seller_profile?.institution && (
                        <div className="text-xs text-gray-400">
                          {item.seller_profile.institution}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        Posted {formatDate(item.created_at)}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl h-12" 
                        onClick={() => handleBuyItem(item)}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-gray-200 hover:bg-gray-50 rounded-xl h-12 font-semibold"
                      >
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 border border-gray-200 max-w-md mx-auto">
              <Package className="h-16 w-16 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No items found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? "Try adjusting your search or filters" 
                  : "Be the first to list something amazing!"}
              </p>
              <Button 
                onClick={() => setShowAddItemDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                List First Item
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
