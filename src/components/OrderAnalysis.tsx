"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Info, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Order {
  orderId: string;
  orderProductId: string;
  productName: string;
  inServiceDate: string;
  outServiceDate: string | null;
  plan: string;
  status: string;
  createDate: string;
}

interface OrderAnalysisProps {
  userId: string;
  onUpsellClick: (productName: string, lastPlan: string) => void;
}

export default function OrderAnalysis({ userId, onUpsellClick }: OrderAnalysisProps) {
  const [mostUsedProduct, setMostUsedProduct] = useState<{
    productName: string;
    count: number;
    lastPlan: string;
    lastPurchaseDate: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserOrders() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          const orders = data.orders || [];

          // Analyze orders to find most used product
          const productCounts = new Map<string, { 
            count: number; 
            lastPlan: string;
            lastPurchaseDate: string;
          }>();
          
          orders.forEach((order: Order) => {
            if (order.outServiceDate) { // Only consider completed/expired orders
              const current = productCounts.get(order.productName) || { 
                count: 0, 
                lastPlan: order.plan,
                lastPurchaseDate: order.inServiceDate
              };
              productCounts.set(order.productName, {
                count: current.count + 1,
                lastPlan: order.plan,
                lastPurchaseDate: order.inServiceDate > current.lastPurchaseDate ? 
                  order.inServiceDate : current.lastPurchaseDate
              });
            }
          });

          // Find the most used product
          let maxCount = 0;
          let mostUsed = null;
          
          productCounts.forEach((value, productName) => {
            if (value.count > maxCount) {
              maxCount = value.count;
              mostUsed = {
                productName,
                count: value.count,
                lastPlan: value.lastPlan,
                lastPurchaseDate: value.lastPurchaseDate
              };
            }
          });

          setMostUsedProduct(mostUsed);
        }
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserOrders();
    }
  }, [userId]);

  const handleUpsell = () => {
    if (mostUsedProduct) {
      onUpsellClick(mostUsedProduct.productName, mostUsedProduct.lastPlan);
    }
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Analyzing Customer History...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!mostUsedProduct) {
    return null;
  }

  const lastPurchaseDate = new Date(mostUsedProduct.lastPurchaseDate).toLocaleDateString();

  return (
    <Card className="shadow-sm border-gray-200">
      <div className="py-2 px-4 border-b border-gray-100">
        <h1 className="text-sm font-medium flex items-center gap-2 text-gray-700">
          <TrendingUp size={16} className="text-gray-500" />
          UPSELL OPPORTUNITY
        </h1>
      </div>
      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex flex-col p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">📊</span>
                <Badge className="text-blue-500 border-blue-200 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                  Product Analysis
                </Badge>
              </div>
              <div className="flex flex-col items-end justify-between gap-2">
                <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded-md">
                  {mostUsedProduct.count} {mostUsedProduct.count === 1 ? "purchase" : "purchases"}
                </span>
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-0.5 font-normal">
                  {mostUsedProduct.lastPlan}
                </Badge>
              </div>
            </div>
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Most Purchased Product:</span>
                <span className=" text-gray-900 text-base text-right" style={{maxWidth: '60%', wordBreak: 'break-word'}}>{mostUsedProduct.productName}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Last Purchase Date:</span>
                <span className=" text-gray-900 text-base text-right">{lastPurchaseDate}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
