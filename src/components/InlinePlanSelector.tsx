// components/InlinePlanSelector.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { toast } from "@/components/ui/use-toast";
import { toast } from "sonner";

interface InlinePlanSelectorProps {
  onPlanSelected: (product: string, plan: string) => void;
  initialProduct?: string;
  userId: string;
  showToast?: boolean; // Add this optional prop with a default value of true
}

interface Product {
  id: number;
  productName: string;
  productTypeId: number;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  feature: string;
}

// Map for icons based on product name patterns
const getProductIcon = (productName: string): string => {
  if (productName.toLowerCase().includes("workspace")) return "🧩";
  if (productName.toLowerCase().includes("analytics")) return "📊";
  if (productName.toLowerCase().includes("support")) return "🎧";
  if (productName.toLowerCase().includes("automation")) return "⚙️";
  return "📦"; // Default icon
};

export default function InlinePlanSelector({
  onPlanSelected,
  initialProduct,
  userId,
  showToast = true 
}: InlinePlanSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderProcessing, setOrderProcessing] = useState<boolean>(false);

  // Plans for each product (generic SaaS-style demo plans)
  const getPlansForProduct = (productName: string): Plan[] => {
    const lower = productName.toLowerCase();

    if (lower.includes("workspace")) {
      return [
        { id: "Starter", name: "Starter", price: "$19/mo", feature: "Up to 5 team members" },
        {
          id: "Growth",
          name: "Growth",
          price: "$49/mo",
          feature: "Up to 25 team members",
        },
        {
          id: "Scale",
          name: "Scale",
          price: "$99/mo",
          feature: "Unlimited team members",
        },
        {
          id: "Enterprise",
          name: "Enterprise",
          price: "Talk to sales",
          feature: "Security & SSO",
        },
      ];
    } else if (lower.includes("analytics")) {
      return [
        {
          id: "Insights",
          name: "Insights",
          price: "$29/mo",
          feature: "Core dashboards",
        },
        {
          id: "Advanced",
          name: "Advanced",
          price: "$59/mo",
          feature: "Custom reports",
        },
        {
          id: "Cohorts",
          name: "Cohorts",
          price: "$79/mo",
          feature: "Retention & cohorts",
        },
        {
          id: "DataWarehouse",
          name: "Warehouse sync",
          price: "$129/mo",
          feature: "Sync to warehouse",
        },
      ];
    } else if (lower.includes("support")) {
      return [
        { id: "Lite", name: "Lite", price: "$9/agent", feature: "Email support" },
        {
          id: "Pro",
          name: "Pro",
          price: "$19/agent",
          feature: "Email + chat",
        },
        {
          id: "Omni",
          name: "Omnichannel",
          price: "$29/agent",
          feature: "Chat, email & phone",
        },
        {
          id: "AI",
          name: "AI Assist",
          price: "$39/agent",
          feature: "AI summaries & suggestions",
        },
      ];
    }
    return [
      { id: "Basic", name: "Basic", price: "$10/mo", feature: "Core features" },
      {
        id: "Premium",
        name: "Premium",
        price: "$20/mo",
        feature: "Advanced features",
      },
      {
        id: "Unlimited",
        name: "Unlimited",
        price: "$30/mo",
        feature: "Unlimited usage",
      },
      {
        id: "Family",
        name: "Family",
        price: "$45/mo",
        feature: "Team bundle",
      },
    ];
  };

  // Fetch products from database on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const mockProducts: Product[] = [
          { id: 1, productName: "Core workspace subscription", productTypeId: 1 },
          { id: 2, productName: "Insights analytics add-on", productTypeId: 2 },
          { id: 3, productName: "Customer support seats", productTypeId: 3 },
          { id: 4, productName: "Automation rules pack", productTypeId: 4 },
        ];

        setProducts(mockProducts);

        // Set default selected product
        if (
          initialProduct &&
          mockProducts.some((p) => p.productName === initialProduct)
        ) {
          setSelectedProduct(initialProduct);
        } else if (mockProducts.length > 0) {
          setSelectedProduct(mockProducts[0].productName);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialProduct]);

  // First verify if the user exists before trying to place an order
  const verifyUserExists = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error verifying user:", error);
      return false;
    }
  };

  // Handle plan selection and API call
  const handleOrderSubmit = async () => {
    if (!selectedProduct || !selectedPlan || !userId) return;

    try {
      setOrderProcessing(true);

      // For demo/chatbot users, just simulate an order without touching the backend
      if (userId === "demo-user") {
        onPlanSelected(selectedProduct, selectedPlan);
        if (showToast !== false && typeof toast === "function") {
          toast("Demo order simulated for this plan");
        }
        return;
      }

      // Verify user exists first
      const userExists = await verifyUserExists();

      if (!userExists) {
        console.error("User does not exist, skipping order creation for safety");
        if (showToast !== false && typeof toast === "function") {
          toast("Cannot place order: customer record not found");
        }
        return;
      }

      // Now place the order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          productName: selectedProduct,
          plan: selectedPlan,
          status: "Active",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      // Call the parent's callback
      onPlanSelected(selectedProduct, selectedPlan);

      // Show success message
      if (showToast !== false && typeof toast === "function") {
        toast("Order placed successfully");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(
        "Failed to place order: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setOrderProcessing(false);
    }
  };
  if (loading) {
    return (
      <Card className="bg-blue-50/50 mt-2 border border-blue-100 w-full">
        <CardContent className="p-3">
          <div className="py-4 text-center">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50/50 mt-2 border border-blue-100 w-full overflow-hidden">
      <CardContent className="p-3">
        <Tabs
          value={selectedProduct}
          onValueChange={(val) => {
            setSelectedProduct(val);
            setSelectedPlan(null);
          }}
        >
          <TabsList className="grid grid-cols-4 bg-blue-100/50 mb-3 h-8">
            {products.map((product) => (
              <TabsTrigger
                key={product.id}
                value={product.productName}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs"
              >
                <span className="mr-1">
                  {getProductIcon(product.productName)}
                </span>
                {product.productName.length > 12
                  ? `${product.productName.substring(0, 10)}...`
                  : product.productName}
              </TabsTrigger>
            ))}
          </TabsList>

          {products.map((product) => (
            <TabsContent
              key={product.id}
              value={product.productName}
              className="mt-0"
            >
              <div className="gap-2 grid grid-cols-2">
                {getPlansForProduct(product.productName).map((plan) => (
                  <div
                    key={plan.id}
                    className={`
                      relative p-2 border rounded cursor-pointer text-xs
                      ${
                        selectedPlan === plan.id &&
                        selectedProduct === product.productName
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }
                    `}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="font-medium">{plan.name}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-gray-600">{plan.feature}</div>
                      <div className="font-bold text-blue-600">
                        {plan.price}
                      </div>
                    </div>
                    {selectedPlan === plan.id &&
                      selectedProduct === product.productName && (
                        <CheckCircle
                          size={14}
                          className="top-2 right-2 absolute text-blue-600"
                        />
                      )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  disabled={!selectedPlan || orderProcessing}
                  onClick={handleOrderSubmit}
                  className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                >
                  {orderProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <ShoppingCart size={12} className="mr-1" />
                      Order {selectedProduct.split(" ")[0]} {selectedPlan || ""}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
