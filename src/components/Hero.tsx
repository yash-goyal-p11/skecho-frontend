import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Discover{" "}
                <span className="text-skecho-coral">
                  Unique Art
                </span>{" "}
                by Independent Artists
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Connect directly with talented artists. Buy ready-made masterpieces or commission custom artwork tailored just for you.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/browse">
                <Button size="lg" className="bg-skecho-coral hover:bg-skecho-coral-dark text-white">
                  Explore Artworks
                </Button>
              </Link>
              <Link to="/custom">
                <Button size="lg" variant="outline" className="border-skecho-coral text-skecho-coral-dark hover:bg-skecho-coral-light/30">
                  Commission Custom Art
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-skecho-coral">500+</div>
                <div className="text-gray-600">Artists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-skecho-coral">2.5k+</div>
                <div className="text-gray-600">Artworks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-skecho-coral">1k+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <img 
              src="/assets/hero.png" 
              alt="Girl drawing artwork" 
              className="w-full h-auto max-w-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};