import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface MaterialOption {
  name: string;
  costs: {
    A1: number;
    A2: number;
    A4: number;
  };
}

interface CustomArtPricingProps {
  onPricingChange: (pricing: {
    doesCustomArt: boolean;
    customArtPricing: {
      A1: { basePrice: number | null; perPersonPrice: number | null };
      A2: { basePrice: number | null; perPersonPrice: number | null };
      A4: { basePrice: number | null; perPersonPrice: number | null };
    } | null;
    materialOptions: MaterialOption[] | null;
  }) => void;
  initialValues?: {
    doesCustomArt: boolean;
    customArtPricing: {
      A1: { basePrice: number | null; perPersonPrice: number | null };
      A2: { basePrice: number | null; perPersonPrice: number | null };
      A4: { basePrice: number | null; perPersonPrice: number | null };
    } | null;
    materialOptions: MaterialOption[] | null;
  };
}

export const CustomArtPricing = ({ onPricingChange, initialValues }: CustomArtPricingProps) => {
  const [doesCustomArt, setDoesCustomArt] = useState(initialValues?.doesCustomArt || false);
  const [pricing, setPricing] = useState(initialValues?.customArtPricing || {
    A1: { basePrice: null, perPersonPrice: null },
    A2: { basePrice: null, perPersonPrice: null },
    A4: { basePrice: null, perPersonPrice: null }
  });
  const [materialOptions, setMaterialOptions] = useState<MaterialOption[]>(
    initialValues?.materialOptions || []
  );
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    costs: {
      A1: "",
      A2: "",
      A4: ""
    }
  });

  const handlePricingChange = (
    size: "A1" | "A2" | "A4",
    field: "basePrice" | "perPersonPrice",
    value: string
  ) => {
    const newPricing = {
      ...pricing,
      [size]: {
        ...pricing[size],
        [field]: value === "" ? null : parseInt(value)
      }
    };
    setPricing(newPricing);
    onPricingChange({
      doesCustomArt,
      customArtPricing: doesCustomArt ? newPricing : null,
      materialOptions: doesCustomArt ? materialOptions : null
    });
  };

  const handleCustomArtToggle = (checked: boolean) => {
    setDoesCustomArt(checked);
    onPricingChange({
      doesCustomArt: checked,
      customArtPricing: checked ? pricing : null,
      materialOptions: checked ? materialOptions : null
    });
  };

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.costs.A1 || !newMaterial.costs.A2 || !newMaterial.costs.A4) return;
    
    const newMaterialOptions = [
      ...materialOptions,
      {
        name: newMaterial.name,
        costs: {
          A1: parseInt(newMaterial.costs.A1),
          A2: parseInt(newMaterial.costs.A2),
          A4: parseInt(newMaterial.costs.A4)
        }
      }
    ];
    setMaterialOptions(newMaterialOptions);
    setNewMaterial({
      name: "",
      costs: {
        A1: "",
        A2: "",
        A4: ""
      }
    });
    onPricingChange({
      doesCustomArt,
      customArtPricing: doesCustomArt ? pricing : null,
      materialOptions: newMaterialOptions
    });
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterialOptions = materialOptions.filter((_, i) => i !== index);
    setMaterialOptions(newMaterialOptions);
    onPricingChange({
      doesCustomArt,
      customArtPricing: doesCustomArt ? pricing : null,
      materialOptions: newMaterialOptions
    });
  };

  const handleMaterialCostChange = (size: "A1" | "A2" | "A4", value: string) => {
    setNewMaterial(prev => ({
      ...prev,
      costs: {
        ...prev.costs,
        [size]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Switch
          id="custom-art"
          checked={doesCustomArt}
          onCheckedChange={handleCustomArtToggle}
        />
        <Label htmlFor="custom-art" className="text-lg font-medium">
          Do you offer custom art services?
        </Label>
      </div>

      {doesCustomArt && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Custom Art Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(["A1", "A2", "A4"] as const).map((size) => (
                  <div key={size} className="space-y-4">
                    <h3 className="text-lg font-medium">{size} Size</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base Price (1 Person)</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Base Price"
                            value={pricing[size].basePrice || ""}
                            onChange={(e) => handlePricingChange(size, "basePrice", e.target.value)}
                            min="0"
                            className="w-full"
                          />
                          <span className="text-gray-500">₹</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Additional Price per Person</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Per Person Price"
                            value={pricing[size].perPersonPrice || ""}
                            onChange={(e) => handlePricingChange(size, "perPersonPrice", e.target.value)}
                            min="0"
                            className="w-full"
                          />
                          <span className="text-gray-500">₹</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Options</CardTitle>
              <p>This will be added to the prices set above</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Material Name"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    {(["A1", "A2", "A4"] as const).map((size) => (
                      <div key={size} className="space-y-2">
                        <Label>{size} Size Cost</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder={`${size} Cost`}
                            value={newMaterial.costs[size]}
                            onChange={(e) => handleMaterialCostChange(size, e.target.value)}
                            min="0"
                          />
                          <span className="text-gray-500">₹</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddMaterial}
                    disabled={!newMaterial.name || !newMaterial.costs.A1 || !newMaterial.costs.A2 || !newMaterial.costs.A4}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </div>

                <div className="space-y-2">
                  {materialOptions.map((material, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{material.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMaterial(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>A1: ₹{material.costs.A1}</div>
                        <div>A2: ₹{material.costs.A2}</div>
                        <div>A4: ₹{material.costs.A4}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}; 