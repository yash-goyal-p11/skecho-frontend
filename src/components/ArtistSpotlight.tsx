import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Seller } from "@/lib/types";
import { fetchSellers } from "@/lib/api";

interface Artist {
  id: string;
  user: {
    name: string;
    createdAt: string;
  };
  profileImage?: string | null;
  products: Array<{
    id: string;
    name: string;
    price: number;
    images: string[];
    categories: Array<{
      id: string;
      name: string;
    }>;
  }>;
  _count: {
    products: number;
  };
}

export const ArtistSpotlight = () => {
  const { data: artists, isLoading, error } = useQuery<Seller[]>({
    queryKey: ["spotlightArtists"],
    queryFn: fetchSellers,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Artists</h2>
          <p className="text-lg text-gray-600 mb-8">Failed to load artists. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Artists</h2>
          <p className="text-lg text-gray-600">Discover talented artists in our community</p>
        </div>

        {isLoading ? (
          renderSkeletons()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {artists?.slice(0, 6).map((artist) => (
              <Card key={artist.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-skecho-coral to-skecho-coral-dark flex items-center justify-center overflow-hidden">
                        <img
                          src={artist.profileImage || "/assets/pfp.jpg"}
                          alt={`${artist.user.name}'s profile`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{artist.user.name}</h3>
                        <p className="text-gray-600">Member since {new Date(artist.user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(artist.products.flatMap(p => p.categories.map(c => c.name)))).map((category) => (
                        <span
                          key={category}
                          className="px-3 py-1 bg-skecho-coral/10 text-skecho-coral-dark rounded-full text-sm"
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div>
                        <div className="text-2xl font-bold text-skecho-coral">{artist.products.length}</div>
                        <div className="text-sm text-gray-600">Artworks</div>
                      </div>
                    </div>

                    <Link to={`/artist/${artist.id}`}>
                      <Button variant="outline" className="w-full border-skecho-coral/20 hover:bg-skecho-coral/10">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link to="/browse">
            <Button size="lg" variant="outline" className="border-skecho-coral/20 hover:bg-skecho-coral/10">
              Discover More Artists
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
