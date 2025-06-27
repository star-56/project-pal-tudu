
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
}

const ImageUpload = ({ 
  onImagesChange, 
  maxImages = 5, 
  maxSizePerImage = 5 
}: ImageUploadProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${maxImages} images.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes and types
    const validFiles = [];
    for (const file of files) {
      if (file.size > maxSizePerImage * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than ${maxSizePerImage}MB.`,
          variant: "destructive",
        });
        continue;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const filePath = `marketplace/${fileName}`;

        const { data, error } = await supabase.storage
          .from('marketplace-images')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('marketplace-images')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      
      setImages(newImages);
      onImagesChange(newImages);

      toast({
        title: "Images uploaded successfully",
        description: `${validFiles.length} image(s) uploaded.`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number, imageUrl: string) => {
    try {
      // Extract file path from URL to delete from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `marketplace/${fileName}`;

      await supabase.storage
        .from('marketplace-images')
        .remove([filePath]);

      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">
          Product Images ({images.length}/{maxImages})
        </label>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <AlertCircle className="h-3 w-3" />
          Max {maxSizePerImage}MB per image
        </div>
      </div>

      {/* Upload Button */}
      {images.length < maxImages && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <div className="p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-16 px-8 rounded-xl border-gray-200 hover:bg-blue-50 hover:border-blue-300"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Choose Images
                </div>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Upload up to {maxImages - images.length} more images
            </p>
          </div>
        </Card>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden rounded-xl">
              <div className="aspect-square relative">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index, imageUrl)}
                    className="rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                  {index + 1}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <Card className="border-gray-200 bg-gray-50">
          <div className="p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No images uploaded yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Add images to showcase your product
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;
