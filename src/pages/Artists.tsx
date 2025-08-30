import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSellers } from "@/lib/api";
import { Seller } from "@/lib/types";


const Artists = () => {
  const { data: artists, isLoading, error } = useQuery<Seller[]>({
    queryKey: ['artists'],
    queryFn: fetchSellers,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Failed to load artists</h1>
          <p className="text-gray-600 mt-2">Please try again later</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-skecho-warm-gray/30 to-skecho-coral-light/20">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Artists</h1>
          <p className="text-xl text-gray-600">
            {isLoading ? (
              <Skeleton className="h-8 w-96 mx-auto" />
            ) : (
              `Discover ${artists?.length || 0} talented artists in our community`
            )}
          </p>
        </div>

        {isLoading ? (
          renderSkeletons()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists?.map((artist) => (
              <Card key={artist.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
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

                  <div className="flex flex-wrap gap-2 mt-4">
                    {Array.from(new Set(artist.products.flatMap(p => p.categories.map(c => c.name)))).map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-skecho-coral/10 text-skecho-coral-dark rounded-full text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <div className="text-2xl font-bold text-skecho-coral">{artist.products.length}</div>
                      <div className="text-sm text-gray-600">Artworks</div>
                    </div>
                  </div>

                  <Link to={`/artist/${artist.id}`} className="block mt-6">
                    <Button variant="outline" className="w-full border-skecho-coral/20 hover:bg-skecho-coral/10">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Artists; 