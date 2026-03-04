// app/agent/page.tsx
"use client";

import ChatWindow from "@/components/ChatWindow";
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
    <main className="flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 min-h-screen">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="mb-2 font-bold text-gray-800 text-2xl">
              Customer Support Workspace
            </h1>
            <p className="text-gray-500">
              View customer context, top issues, and chat with AI side-by-side.
            </p>
          </div>
        </header>

        <div className="flex md:flex-row flex-col gap-2">
          <div className="pr-4 border-gray-300 border-r w-full md:w-1/3">
            <Card className="shadow-lg mb-6 border-gray-200 rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                <CardTitle className="flex items-center">
                  <UserCircle2 className="mr-2" size={20} />
                  <span>Agent console</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-6">
                  <h3 className="mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    Select customer profile
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
                  <div className="space-y-6">
                    <div className="bg-white shadow-sm p-4 border border-gray-100 rounded-xl">
                      <h2 className="flex items-center font-bold text-gray-800 text-lg">
                        <UserCircle2 size={20} className="mr-2 text-blue-600" />
                        {user.name}
                      </h2>
                      <div className="flex items-center bg-gray-50 mt-2 p-2 rounded-md text-gray-600">
                        <Phone size={16} className="mr-2 text-blue-600" />
                        <span className="font-medium">{user.phoneNumber}</span>
                      </div>

                      <div className="mt-4">
                        <h3 className="flex items-center mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                          <ShieldCheck
                            size={14}
                            className="mr-1 text-blue-600"
                          />
                          Active plan
                        </h3>
                        {user.orders.find((o) => o.status === "Active") ? (
                          <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">
                                {
                                  user.orders.find((o) => o.status === "Active")
                                    ?.productName
                                }
                              </span>

                              <div>
                                {
                                  user.orders.find((o) => o.status === "Active")
                                    ?.plan
                                }
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center text-gray-600 text-sm">
                                <Calendar
                                  size={14}
                                  className="mr-1 text-blue-600"
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
                              <Badge className="bg-emerald-100 border border-emerald-200 text-emerald-800">
                                Active
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 border border-gray-100 rounded-lg text-center">
                            <p className="text-gray-500">No active plan</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <TopIssuesSummary userId={selectedUser} />

                    <Tabs defaultValue="orders" className="w-full">
                      <TabsList className="grid grid-cols-2 bg-gray-100 mb-4">
                        <TabsTrigger
                          value="orders"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                        >
                          <Package size={16} className="mr-2" />
                          Orders
                        </TabsTrigger>
                        <TabsTrigger
                          value="incidents"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                        >
                          <History size={16} className="mr-2" />
                          Support history
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="orders" className="space-y-3 mt-0">
                        {ordersWithProducts.length > 0 ? (
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            {ordersWithProducts.map((order) => (
                              <AccordionItem
                                key={order.orderId}
                                value={order.orderId}
                              >
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex justify-between items-center pr-4 w-full">
                                    <div className="flex flex-col items-start">
                                      <span className="font-semibold text-gray-800">
                                        {order.orderId}
                                      </span>
                                      <span className="text-gray-500 text-xs">
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
                                        className="bg-gray-50 p-3 border border-gray-100 rounded-lg"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium text-gray-700">
                                            {product.productName}
                                          </span>
                                          <span className="text-gray-500 text-xs">
                                            ID: {product.orderProductId}
                                          </span>
                                        </div>
                                        <div className="flex items-center mt-1 text-gray-600 text-xs">
                                          <Calendar
                                            size={14}
                                            className="mr-1 text-blue-600"
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
                                          <span className="text-gray-600">
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
                          <div className="bg-white p-6 border border-gray-100 rounded-xl text-center">
                            <Package
                              size={24}
                              className="mx-auto mb-2 text-gray-400"
                            />
                            <p className="text-gray-500">No orders found</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="incidents" className="space-y-3 mt-0">
                        {user.incidents.length > 0 ? (
                          user.incidents.map((incident) => (
                            <div
                              key={incident.incidentId}
                              className="bg-white shadow-sm hover:shadow-md p-4 border border-gray-100 rounded-xl transition-shadow duration-200"
                            >
                              <div className="flex justify-between items-center">
                                <span
                                  className="font-semibold text-gray-800 truncate"
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
                                  )} border whitespace-nowrap ml-2`}
                                >
                                  {incident.status}
                                </Badge>
                              </div>
                              <div className="flex items-center mt-2 text-gray-600 text-xs">
                                <History
                                  size={14}
                                  className="mr-2 text-blue-600"
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
                          <div className="bg-white p-6 border border-gray-100 rounded-xl text-center">
                            <History
                              size={24}
                              className="mx-auto mb-2 text-gray-400"
                            />
                            <p className="text-gray-500">
                              No support incidents found
                            </p>
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
                  <div className="bg-blue-50 p-6 border border-blue-100 rounded-xl text-center">
                    <UserCircle2
                      size={32}
                      className="mx-auto mb-2 text-blue-600"
                    />
                    <p className="text-blue-700">
                      Select a customer to view details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="pl-2 w-full md:w-2/3">
            {selectedUser ? (
              <ChatWindow
                userId={selectedUser}
                input={input}
                onInputChange={setInput}
              />
            ) : (
              <Card className="flex justify-center items-center shadow-lg p-8 border-gray-200 rounded-xl h-full">
                <div className="p-6 text-center">
                  <div className="inline-flex justify-center items-center bg-blue-100 mb-4 p-6 rounded-full">
                    <MessageSquare size={32} className="text-blue-600" />
                  </div>
                  <h2 className="mb-3 font-bold text-gray-800 text-xl">
                    Agent-side AI assistant
                  </h2>
                  <p className="max-w-md text-gray-500">
                    Select a customer from the workspace sidebar to start a guided
                    AI conversation with full context.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

