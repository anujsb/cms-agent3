// app/agent/page.tsx
"use client";

import UserSelector from "@/components/UserSelector";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Calendar,
  Package,
  ShieldCheck,
  UserCircle2,
  MessageSquare,
  History,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TopIssuesSummary from "@/components/TopIssuesSummary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import OrderAnalysis from "@/components/OrderAnalysis";

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  orders: {
    orderId: string;
    orderProductId: string;
    productName: string;
    inServiceDate: string;
    outServiceDate: string | null;
    plan: string;
    status: string;
    createDate: string;
  }[];
  incidents: {
    incidentId: string;
    date: string;
    description: string;
    status: string;
  }[];
}

interface OrderProduct {
  orderProductId: string;
  productName: string;
  inServiceDate: string;
  outServiceDate: string | null;
  plan: string;
}

interface OrderWithProducts {
  orderId: string;
  status: string;
  createDate: string;
  products: OrderProduct[];
}

export default function AgentHome() {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordersWithProducts, setOrdersWithProducts] = useState<OrderWithProducts[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!selectedUser) return;

    async function fetchUserDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${selectedUser}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);

          if (data.orders && data.orders.length > 0) {
            const orderMap = new Map<string, OrderWithProducts>();

            data.orders.forEach((order: any) => {
              if (!orderMap.has(order.orderId)) {
                orderMap.set(order.orderId, {
                  orderId: order.orderId,
                  status: order.status,
                  createDate:
                    order.createDate || new Date().toISOString().split("T")[0],
                  products: [],
                });
              }

              const orderWithProducts = orderMap.get(order.orderId)!;
              orderWithProducts.products.push({
                orderProductId: order.orderProductId,
                productName: order.productName,
                inServiceDate: order.inServiceDate,
                outServiceDate: order.outServiceDate,
                plan: order.plan,
              });
            });

            setOrdersWithProducts(Array.from(orderMap.values()));
          } else {
            setOrdersWithProducts([]);
          }
        } else {
          console.error("Failed to fetch user details");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserDetails();
  }, [selectedUser]);

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const handleUpsellClick = (productName: string, lastPlan: string) => {
    const message = `Based on the customer's purchase history, they have purchased ${productName} multiple times. Their last plan was ${lastPlan}. Consider suggesting an upgrade to the latest plan.`;
    setInput(message);

    setTimeout(() => {
      const chatWindow = document.querySelector("[data-chat-window]");
      if (chatWindow) {
        const sendButton = chatWindow.querySelector('button[type="submit"]');
        if (sendButton) {
          (sendButton as HTMLButtonElement).click();
        }
      }
    }, 100);
  };

  return (
    <main className="flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 min-h-screen text-slate-50">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h1 className="mb-1 font-semibold text-slate-50 text-2xl md:text-3xl tracking-tight">
              Customer Support Workspace
            </h1>
            <p className="text-slate-300/90 text-xs md:text-sm">
              Switch between customers, see their history at a glance, and collaborate with your AI copilot in the same view.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="w-full lg:w-[72%]">
            <Card className="bg-slate-900/70 shadow-xl backdrop-blur mb-4 border-slate-800/80 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-white">
                <CardTitle className="flex items-center">
                  <UserCircle2 className="mr-2" size={20} />
                  <span>Agent console</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="mb-6">
                  <h3 className="mb-2 font-semibold text-[0.7rem] text-slate-300 uppercase tracking-[0.18em]">
                    Select customer
                  </h3>
                  <UserSelector onUserChange={handleUserChange} />
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
                      <Skeleton className="mb-4 w-32 h-6" />
                      <div className="flex items-center">
                        <Skeleton className="mr-2 rounded-full w-4 h-4" />
                        <Skeleton className="w-32 h-4" />
                      </div>
                      <Skeleton className="mt-4 w-full h-20" />
                    </div>
                  </div>
                ) : user ? (
                  <div className="space-y-5">
                    <div className="bg-slate-900/80 shadow-sm p-4 border border-slate-800/80 rounded-xl">
                      <h2 className="flex items-center font-semibold text-slate-50 text-base">
                        <UserCircle2 size={20} className="mr-2 text-blue-400" />
                        {user.name}
                      </h2>
                      <div className="flex items-center bg-slate-900 mt-2 px-3 py-2 border border-slate-800/80 rounded-md text-slate-300">
                        <Phone size={14} className="mr-2 text-blue-400" />
                        <span className="font-medium text-xs">
                          {user.phoneNumber}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h3 className="flex items-center mb-2 font-semibold text-[0.7rem] text-slate-400 uppercase tracking-[0.18em]">
                          <ShieldCheck
                            size={14}
                            className="mr-1 text-blue-400"
                          />
                          Active plan
                        </h3>
                        {user.orders.find((o) => o.status === "Active") ? (
                          <div className="bg-blue-500/10 p-3 border border-blue-500/30 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-slate-50 text-sm">
                                {
                                  user.orders.find((o) => o.status === "Active")
                                    ?.productName
                                }
                              </span>

                              <div className="font-medium text-blue-100 text-xs">
                                {
                                  user.orders.find((o) => o.status === "Active")
                                    ?.plan
                                }
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center text-[0.7rem] text-slate-200">
                                <Calendar
                                  size={14}
                                  className="mr-1 text-blue-300"
                                />
                                <span>
                                  From{" "}
                                  {
                                    user.orders.find(
                                      (o) => o.status === "Active"
                                    )?.inServiceDate
                                  }
                                  {user.orders.find(
                                    (o) => o.status === "Active"
                                  )?.outServiceDate
                                    ? ` to ${
                                        user.orders.find(
                                          (o) => o.status === "Active"
                                        )?.outServiceDate
                                      }`
                                    : ""}
                                </span>
                              </div>
                              <Badge className="bg-emerald-400/10 border border-emerald-300/40 text-[0.65rem] text-emerald-200">
                                Active
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-900 p-4 border border-slate-800/80 rounded-lg text-center">
                            <p className="text-slate-400 text-xs">
                              No active plan
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <TopIssuesSummary userId={selectedUser} />

                    <Tabs defaultValue="orders" className="w-full">
                      <TabsList className="grid grid-cols-2 bg-slate-900/80 mb-3 rounded-lg">
                        <TabsTrigger
                          value="orders"
                          className="data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-md text-slate-300 text-xs"
                        >
                          <Package size={14} className="mr-1.5" />
                          Orders
                        </TabsTrigger>
                        <TabsTrigger
                          value="incidents"
                          className="data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-md text-slate-300 text-xs"
                        >
                          <History size={14} className="mr-1.5" />
                          Support history
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="orders" className="space-y-3 mt-0">
                        {ordersWithProducts.length > 0 ? (
                          <Accordion type="single" collapsible className="w-full">
                            {ordersWithProducts.map((order) => (
                              <AccordionItem
                                key={order.orderId}
                                value={order.orderId}
                              >
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex justify-between items-center pr-4 w-full">
                                    <div className="flex flex-col items-start">
                                      <span className="font-semibold text-slate-50 text-sm">
                                        {order.orderId}
                                      </span>
                                      <span className="text-[0.7rem] text-slate-400">
                                        Created: {order.createDate}
                                      </span>
                                    </div>
                                    <Badge
                                      className={`${getStatusColor(
                                        order.status
                                      )} border`}
                                    >
                                      {order.status}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3 pt-2">
                                    {order.products.map((product) => (
                                      <div
                                        key={product.orderProductId}
                                        className="bg-slate-900 p-3 border border-slate-800/80 rounded-lg"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium text-slate-100 text-sm">
                                            {product.productName}
                                          </span>
                                          <span className="text-[0.7rem] text-slate-500">
                                            ID: {product.orderProductId}
                                          </span>
                                        </div>
                                        <div className="flex items-center mt-1 text-[0.7rem] text-slate-300">
                                          <Calendar
                                            size={14}
                                            className="mr-1 text-blue-300"
                                          />
                                          <span>
                                            {product.inServiceDate}
                                            {product.outServiceDate
                                              ? ` to ${product.outServiceDate}`
                                              : ""}
                                          </span>
                                          <span className="mx-2 text-gray-400">
                                            •
                                          </span>
                                          <span className="text-slate-300">
                                            Plan: {product.plan}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        ) : (
                          <div className="bg-slate-900 p-6 border border-slate-800/80 rounded-xl text-center">
                            <Package
                              size={24}
                              className="mx-auto mb-2 text-slate-500"
                            />
                            <p className="text-slate-400 text-xs">
                              No orders found
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="incidents" className="space-y-3 mt-0">
                        {user.incidents.length > 0 ? (
                          user.incidents.map((incident) => (
                            <div
                              key={incident.incidentId}
                              className="bg-slate-900 shadow-sm hover:shadow-md p-4 border border-slate-800/80 rounded-xl transition-shadow duration-200"
                            >
                              <div className="flex justify-between items-center">
                                <span
                                  className="font-semibold text-slate-50 text-sm truncate"
                                  title={incident.description}
                                >
                                  {incident.description.length > 40
                                    ? incident.description.substring(0, 40) +
                                      "..."
                                    : incident.description}
                                </span>
                                <Badge
                                  className={`${getStatusColor(
                                    incident.status
                                  )} border whitespace-nowrap ml-2 text-[0.65rem]`}
                                >
                                  {incident.status}
                                </Badge>
                              </div>
                              <div className="flex items-center mt-2 text-[0.7rem] text-slate-300">
                                <History
                                  size={14}
                                  className="mr-2 text-blue-300"
                                />
                                <span className="mr-2">
                                  {incident.incidentId}
                                </span>
                                <span className="text-gray-400">•</span>
                                <Calendar
                                  size={14}
                                  className="mx-2 text-blue-600"
                                />
                                <span>{incident.date}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-slate-900 p-6 border border-slate-800/80 rounded-xl text-center">
                            <History
                              size={24}
                              className="mx-auto mb-2 text-slate-500"
                            />
                            <p className="text-slate-400 text-xs">No support incidents found</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <OrderAnalysis
                      userId={selectedUser}
                      onUpsellClick={handleUpsellClick}
                    />
                  </div>
                ) : selectedUser ? (
                  <div className="bg-red-50 p-6 border border-red-100 rounded-xl text-center">
                    <p className="text-red-600">Failed to load customer details</p>
                  </div>
                ) : (
                  <div className="bg-slate-900 p-6 border border-slate-800/80 rounded-xl text-center">
                    <UserCircle2
                      size={32}
                      className="mx-auto mb-2 text-blue-400"
                    />
                    <p className="text-slate-200 text-sm">Select a customer to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chatbot UI removed from agent view on purpose */}
        </div>
      </div>
    </main>
  );
}

