import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Axios from '@/utils/Axios';
import SummaryApi from '@/common/summaryApi';
import { toast } from '@/hooks/use-toast';
import { formatRupees } from '@/lib/currency';

interface ProductCardProps {
    id: string;
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviews: number;
    category: string;
    isNew?: boolean;
    isSale?: boolean;
}

const ProductCard = ({
    id,
    slug,
    name,
    price,
    originalPrice,
    image,
    rating,
    reviews,
    category,
    isNew,
    isSale,
}: ProductCardProps) => {
    const { isAuthenticated, user, updateUser } = useAuth();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const isLiked = user?.wishlist?.includes(id);

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const response = await Axios.post(SummaryApi.toggleWishlist.url, { productId: id });
            if (response.data.success) {
                updateUser({ ...user, wishlist: response.data.wishlist });
                toast({
                    title: response.data.message,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
            });
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        addToCart({
            id,
            name,
            price,
            image,
            quantity: 1,
        });
    };

    return (
        <Link to={`/product/${slug}`}>
            <Card className="group cursor-pointer hover:shadow-elegant transition-all duration-300 overflow-hidden h-full flex flex-col">
                <div className="relative overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {isNew && (
                            <span className="bg-gradient-luxury text-white text-xs px-2 py-1 rounded-full font-medium">
                                New
                            </span>
                        )}
                        {isSale && (
                            <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                                Sale
                            </span>
                        )}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white" onClick={handleLikeClick}>
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white" onClick={handleAddToCart}>
                            <ShoppingBag className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="text-sm text-muted-foreground mb-1">{category}</div>
                    <h3 className="font-medium text-foreground mb-2 line-clamp-2 flex-grow">{name}</h3>

                    <div className="flex items-center gap-1 mb-3">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < Math.floor(rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({reviews})</span>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                        <span className="font-semibold text-lg">{formatRupees(price)}</span>
                        {originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                                {formatRupees(originalPrice)}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default ProductCard;