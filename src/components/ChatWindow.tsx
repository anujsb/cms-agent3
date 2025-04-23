// components/ChatWindow.tsx

"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Send,
  Phone,
  RotateCw,
  Bot,
  User2,
  Smile,
  Info,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import InlinePlanSelector from "./InlinePlanSelector";
import { Modal } from "@/components/ui/Modal";

// Add CSS for compact lists
const compactListStyles = `
  .markdown-content ul, 
  .markdown-content ol {
    margin-top: 0.25rem !important;
    margin-bottom: 0.25rem !important;
    padding-left: 1.25rem !important;
  }
  
  .markdown-content ul li,
  .markdown-content ol li {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
  
  .markdown-content p + ul,
  .markdown-content p + ol {
    margin-top: 0 !important;
  }
  
  .markdown-content ul + p,
  .markdown-content ol + p {
    margin-top: 0.25rem !important;
  }
  
  .markdown-content strong {
    font-weight: 600;
  }
`;

interface Message {
  text: string;
  isBot: boolean;
  timestamp: string;
  isOrderConfirmation?: boolean;
  orderId?: string;
  showOrderSelector?: boolean; // Add this field
  suggestedProduct?: string | null; // Allow null as well
  showCallButton?: boolean; // Add this field to indicate when to show the call button
}

interface ChatWindowProps {
  userId: string;
}

export default function ChatWindow({ userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! How can I assist you today?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentOrderId, setRecentOrderId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{
    product: string;
    plan: string;
  } | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Reset chat when user changes
  useEffect(() => {
    setMessages([
      {
        text: "Hello! How can I assist you today?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setRecentOrderId(null);
  }, [userId]);

  // Focus input when component mounts or user changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [userId]);

  // Helper function to extract product and plan from message for quick order
  const extractOrderDetails = (text: string) => {
    // Try to match common request patterns
    const phoneMatch = text.match(
      /(?:want|need|buy|order|get).*(?:phone|iphone|samsung|pixel)/i
    );
    const simMatch = text.match(
      /(?:want|need|buy|order|get).*(?:sim|esim|card)/i
    );
    const internetMatch = text.match(
      /(?:want|need|buy|order|get).*(?:internet|wifi|broadband)/i
    );
    const tvMatch = text.match(
      /(?:want|need|buy|order|get).*(?:tv|television)/i
    );

    // Try to match plan patterns
    const unlimitedMatch = text.match(/unlimited/i);
    const basicMatch = text.match(/basic/i);
    const premiumMatch = text.match(/premium/i);
    const familyMatch = text.match(/family/i);

    let product = null;
    if (phoneMatch) product = "Phone";
    else if (simMatch) product = "SIM";
    else if (internetMatch) product = "Internet";
    else if (tvMatch) product = "TV";

    let plan = null;
    if (unlimitedMatch) plan = "Unlimited";
    else if (basicMatch) plan = "Basic";
    else if (premiumMatch) plan = "Premium";
    else if (familyMatch) plan = "Family";

    return { product, plan };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      text: input,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId }),
      });

      const data = await res.json();

      // Check if the user is asking for customer care
      const userAskingForCare = isAskingForCustomerCare(input);

      // Check if the backend indicates an order intent
      const botMessage = {
        text: data.reply,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOrderConfirmation: data.orderPlaced,
        orderId: data.orderId,
        showOrderSelector: data.isOrderIntent || false, // Only show selector if order intent is detected
        suggestedProduct: data.productName || null,
        showCallButton: userAskingForCare || needsRealCustomerCare(data.reply), // Show call button if user is asking for care or bot indicates need for real person
      };

      if (data.orderPlaced && data.orderId) {
        setRecentOrderId(data.orderId);
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble connecting to the server. Please try again later or contact our support team directly.",
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          showCallButton: true, // Show call button on error
        },
      ]);
    } finally {
      setIsLoading(false);
      // Focus the input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  const handleQuickOrder = (product: string, plan: string) => {
    setPendingOrder({ product, plan });

    // Add a message to the chat with Accept and Decline buttons
    setMessages((prev) => [
      ...prev,
      {
        text: `Please review the terms and conditions for the ${product} with the ${plan} plan. Do you accept?`,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        showOrderSelector: false,
      },
    ]);
  };

  const handleAcceptTerms = async () => {
    if (pendingOrder) {
      const { product, plan } = pendingOrder;
      setPendingOrder(null);
  
      // Proceed with order submission
      await handleInlinePlanSelection(product, plan);
      
      // Show success toast after order is processed
      toast("Order placed successfully"
        // description: `Your order for ${product} with ${plan} plan has been placed.`,
        // variant: "default",
      );
    }
  };
  const handleDeclineTerms = () => {
    setPendingOrder(null);

    // Add a message to the chat indicating the user declined
    setMessages((prev) => [
      ...prev,
      {
        text: "You have declined the terms and conditions. Let us know if you need further assistance.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleCallSupport = () => {
    // Show a toast notification
    toast("Connecting to customer support...", {
      description: "You will be connected to a customer service representative shortly.",
      duration: 3000,
    });
    
    // Add a message to the chat indicating the call is being initiated
    setMessages((prev) => [
      ...prev,
      {
        text: "Connecting to customer support...",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    
    // In a real application, this would initiate a call or redirect to a support page
    // For now, we'll just simulate a connection after a delay
    setTimeout(() => {
      toast("Connected to customer support", {
        description: "You are now speaking with a customer service representative.",
        duration: 3000,
      });
    }, 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        text: "Hello! How can I assist you today?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setRecentOrderId(null);
    // Focus the input after reset
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSend();
      }
    }
  };

  // Function to check if text contains a numbered list or bullet points
  const hasListContent = (text: string) => {
    return /(?:^|\n)(\d+\.|\•|\*|\-)\s/.test(text);
  };

  // Function to check if text contains invoice-like content
  const hasInvoiceContent = (text: string) => {
    return /(?:€|EUR|invoice|bill|plan fee|adjustment|amount)/i.test(text);
  };

  // Function to check if message has order request
  const hasOrderRequest = (text: string) => {
    return /(?:order|buy|purchase|subscribe|sign up|get a new)/i.test(text);
  };

  // Function to check if message requires order confirmation
  const needsOrderConfirmation = (text: string) => {
    return (
      text.includes("To confirm your order") &&
      text.includes("please reply with")
    );
  };

  // Function to check if a real customer care person is needed
  const needsRealCustomerCare = (text: string) => {
    return (
      text.includes("real person") ||
      text.includes("human agent") ||
      text.includes("customer service representative") ||
      text.includes("speak to someone") ||
      text.includes("talk to someone") ||
      text.includes("connect with an agent") ||
      text.includes("transfer to an agent") ||
      text.includes("escalate") ||
      text.includes("complex issue") ||
      text.includes("complicated problem") ||
      text.includes("technical support") ||
      text.includes("billing department") ||
      text.includes("account specialist")
    );
  };

  // Function to check if user is asking for a customer care person
  const isAskingForCustomerCare = (text: string) => {
    return (
      text.includes("customer care") ||
      text.includes("customer service") ||
      text.includes("support agent") ||
      text.includes("help desk") ||
      text.includes("call center") ||
      text.includes("contact support") ||
      text.includes("get help") ||
      text.includes("speak to someone") ||
      text.includes("talk to someone") ||
      text.includes("human") ||
      text.includes("agent") ||
      text.includes("representative") ||
      text.includes("operator")
    );
  };

  const handleInlinePlanSelection = async (product: string, plan: string) => {
    const confirmMessage = `Confirm order: Yes, product: ${product}, plan: ${plan}`;

    // Add the user's message to the chat
    const userMessage = {
      text: confirmMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Update previous bot message to hide the selector
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === prev.length - 1 && msg.isBot && msg.showOrderSelector
          ? { ...msg, showOrderSelector: false }
          : msg
      )
    );

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: confirmMessage, userId }),
      });

      const data = await res.json();

      const botMessage = {
        text: data.reply,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOrderConfirmation: data.orderPlaced,
        orderId: data.orderId,
      };

      if (data.orderPlaced && data.orderId) {
        setRecentOrderId(data.orderId);
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble connecting to the server. Please try again later or contact our support team directly.",
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <>
      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <Modal onClose={handleDeclineTerms}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">
              General Terms and Conditions
            </h3>
            <p className="text-sm mb-4">
              1. By clicking "Accept," I agree to the summary, General Terms and
              Conditions, the promotional and additional conditions, the current
              rates, and the creation of a payment obligation.
            </p>
            <p className="text-sm mb-4">
              2. I give permission to check and analyze the status of my
              internet line and, if necessary, free up other services.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleDeclineTerms}>
                Decline
              </Button>
              <Button
                className="bg-blue-600 text-white"
                onClick={handleAcceptTerms}
              >
                Accept
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add the style tag for compact lists */}
      <style jsx global>
        {compactListStyles}
      </style>

      <Card className="flex flex-col h-[600px] shadow-lg rounded-xl border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className=" flex items-center">
              <MessageSquare size={18} className="mr-2" />
              Customer Support Assistant
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-blue-700 rounded-full flex items-center justify-center"
                onClick={handleReset}
                title="Reset conversation"
              >
                <RotateCw size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:bg-blue-700 rounded-full flex items-center justify-center"
                onClick={handleCallSupport}
                title="Call support"
              >
                <Phone size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow p-0 overflow-hidden bg-gray-50">
          <ScrollArea className="h-full px-4 py-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.isBot ? "justify-start" : "justify-end"
                  } ${idx === 0 ? "animate-fadeIn" : ""}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg shadow-sm ${
                      msg.isBot
                        ? "bg-white border-l-4 border-l-blue-400 text-gray-800"
                        : "bg-blue-600 text-white"
                    } ${
                      msg.isOrderConfirmation
                        ? "border-green-500 border-l-4"
                        : ""
                    } ${
                      hasInvoiceContent(msg.text) && msg.isBot
                        ? "invoice-content"
                        : ""
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {msg.isBot ? (
                        <span className="flex items-center text-xs font-medium text-blue-600">
                          <Bot size={14} className="mr-1" /> Support Bot
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-medium text-blue-100">
                          <User2 size={14} className="mr-1" /> You
                        </span>
                      )}
                    </div>
                    {msg.isBot ? (
                      <div className="whitespace-pre-wrap break-words markdown-content">
                        {msg.isOrderConfirmation && (
                          <div className="flex items-center mb-2 text-green-600">
                            <CheckCircle size={16} className="mr-2" />
                            <span className="font-medium">Order Confirmed</span>
                          </div>
                        )}

                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="text-sm mb-1" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-disc text-sm my-1 pl-5"
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                className="list-decimal text-sm my-1 pl-5"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-sm py-0 my-0" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                className="font-bold text-blue-600 text-sm mt-2 mb-1"
                                {...props}
                              />
                            ),
                            h4: ({ node, ...props }) => (
                              <h4
                                className="font-semibold text-sm mt-2 mb-1"
                                {...props}
                              />
                            ),
                            strong: ({ node, ...props }) => (
                              <strong className="font-semibold" {...props} />
                            ),
                            em: ({ node, ...props }) => (
                              <em className="italic" {...props} />
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>

                        {/* Special formatting for invoice-like content */}
                        {hasInvoiceContent(msg.text) && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                            <div className="flex items-center text-blue-700 mb-2">
                              <Info size={14} className="mr-1" />
                              <span className="text-xs font-medium">
                                Invoice Details
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                    )}
                    <div
                      className={`flex items-center text-xs mt-2 ${
                        msg.isBot ? "text-gray-400" : "text-blue-100"
                      }`}
                    >
                      <Clock size={12} className="mr-1" />
                      {msg.timestamp}
                    </div>
                    {/* Order Confirmation Buttons */}
                    {msg.isBot && needsOrderConfirmation(msg.text) && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {/* Extract product and plan information from the message */}
                        {(() => {
                          const productMatch =
                            msg.text.match(/order for (\w+)/i);
                          const planMatch =
                            msg.text.match(/with the (\w+) plan/i);
                          const product = productMatch ? productMatch[1] : "";
                          const plan = planMatch ? planMatch[1] : "";

                          if (product && plan) {
                            return (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 flex items-center"
                                onClick={() => handleQuickOrder(product, plan)}
                              >
                                <CheckCircle size={14} className="mr-2" />
                                Confirm Order
                              </Button>
                            );
                          }
                          return null;
                        })()}

                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                          onClick={handleCallSupport}
                        >
                          <Phone size={14} className="mr-2" />
                          Call for Help
                        </Button>
                      </div>
                    )}
                    {/* Call support button for Call Now messages */}
                    {msg.isBot &&
                      (msg.text.includes("Would you like to call now?") ||
                       needsRealCustomerCare(msg.text) ||
                       msg.showCallButton) && (
                        <div className="mt-3 flex">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                            onClick={handleCallSupport}
                          >
                            <Phone size={14} className="mr-2" />
                            Call Customer Care
                          </Button>
                        </div>
                      )}
                    {/* Add help button for invoice-related messages */}
                    {msg.isBot &&
                      hasInvoiceContent(msg.text) &&
                      !msg.text.includes("Would you like to call now?") && (
                        <div className="mt-3 flex">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 mr-2"
                            onClick={() => {
                              setInput(
                                "I don't understand my invoice. Can you explain it in simpler terms?"
                              );
                            }}
                          >
                            <AlertCircle size={14} className="mr-2" />
                            Need Help Understanding?
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                            onClick={handleCallSupport}
                          >
                            <Phone size={14} className="mr-2" />
                            Call Support
                          </Button>
                        </div>
                      )}
                    {msg.isBot && msg.showOrderSelector && (
                      <InlinePlanSelector
                      onPlanSelected={handleQuickOrder}
                      initialProduct={msg.suggestedProduct || undefined}
                      userId={userId}
                      showToast={false} // Add this prop to prevent toast in the component
                    />
                    )}
                    {/* Quick order buttons for messages with order intent */}
                    {/* {msg.isBot &&
                      hasOrderRequest(msg.text) &&
                      !needsOrderConfirmation(msg.text) && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-2">
                            Quick Order Options:
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                              onClick={() =>
                                handleQuickOrder("SIM", "Unlimited")
                              }
                            >
                              <ShoppingCart size={14} className="mr-2" />
                              SIM Unlimited
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                              onClick={() =>
                                handleQuickOrder("Internet", "Premium")
                              }
                            >
                              <ShoppingCart size={14} className="mr-2" />
                              Internet Premium
                            </Button>
                          </div>
                        </div>
                      )} */}
                    {msg.text.includes("Do you accept?") && (
                      <div className="mt-3 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                          onClick={handleAcceptTerms}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          onClick={handleDeclineTerms}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-blue-400">
                    <div className="flex items-center mb-1">
                      <span className="flex items-center text-xs font-medium text-blue-600">
                        <Bot size={14} className="mr-1" /> Support Bot
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <div
                        className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: "100ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: "200ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t bg-white">
          <form
            className="flex w-full gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="relative flex-grow">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="pr-10 pl-4 py-2 border-gray-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <Button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
                onClick={() => setInput(input + "😊")}
                disabled={isLoading}
              >
                <Smile size={18} />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              <Send size={16} className="mr-2" />
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </>
  );
}
