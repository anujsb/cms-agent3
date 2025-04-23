// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserRepository } from "@/lib/repositories/userRepository";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const userRepository = new UserRepository();

// Helper function to detect order intent
function detectOrderIntent(message: string): { isOrderIntent: boolean; productName?: string; plan?: string } {
  const orderKeywords = ["place order", "buy", "purchase", "subscribe", "sign up", "get a new"];
  const queryKeywords = ["recent order", "old orders", "order history", "previous orders", "all orders", "past orders", "show", "latest", "last", "previous", "order details"];

  // Check if the message is asking about existing orders
  const isQueryAboutOrders = queryKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );

  if (isQueryAboutOrders) {
    return { isOrderIntent: false }; // Not an order intent
  }

  // Check if the message contains an order intent
  const hasOrderIntent = orderKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );

  if (hasOrderIntent) {
    // Try to identify product name and plan
    let productName: string | undefined;
    let plan: string | undefined;

    // Basic product detection
    if (message.toLowerCase().includes("sim") || message.toLowerCase().includes("esim")) {
      productName = "SIM";
    } else if (message.toLowerCase().includes("phone") || message.toLowerCase().includes("iphone") || message.toLowerCase().includes("samsung")) {
      productName = "Phone";
    } else if (message.toLowerCase().includes("internet") || message.toLowerCase().includes("wifi") || message.toLowerCase().includes("broadband")) {
      productName = "Internet";
    } else if (message.toLowerCase().includes("tv") || message.toLowerCase().includes("television")) {
      productName = "TV";
    }

    // Basic plan detection
    if (message.toLowerCase().includes("unlimited")) {
      plan = "Unlimited";
    } else if (message.toLowerCase().includes("basic")) {
      plan = "Basic";
    } else if (message.toLowerCase().includes("premium")) {
      plan = "Premium";
    } else if (message.toLowerCase().includes("family")) {
      plan = "Family";
    }

    return { isOrderIntent: true, productName, plan };
  }

  return { isOrderIntent: false };
}

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    // Fetch user data from the database
    const user = await userRepository.getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the message contains an order intent
    const orderIntent = detectOrderIntent(message);

    // Handle order confirmation
    if (message.toLowerCase().includes("confirm order") && message.toLowerCase().includes("yes")) {
      try {
        const productName = message.match(/product:\s*([^,]+)/i)?.[1] || "SIM";
        const plan = message.match(/plan:\s*([^,]+)/i)?.[1] || "Unlimited";

        const inServiceDate = new Date();
        const orderId = await userRepository.addOrder(
          userId,
          productName,
          plan,
          'Active',
          inServiceDate
        );

        return NextResponse.json({
          reply: `Great! Your order for **${productName}** with the **${plan}** plan has been confirmed. Your order number is **${orderId}**. The service will be active starting today.\n\nIs there anything else I can help you with?`,
          orderPlaced: true,
          orderId
        });
      } catch (error) {
        console.error("Error placing order:", error);
        return NextResponse.json({
          reply: "I'm sorry, but there was an error processing your order. Please try again later or contact our customer service at 1200.",
          orderPlaced: false
        });
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are a helpful and friendly customer care bot for Odido, a Dutch telecom company. Your role is to assist users with queries about their telecom services in clear and simple language. Always be empathetic and understanding, especially when users seem confused.
    Always provide clear and concise answers based on what user has asked without displaying additional information, and if you don't know something, say so. Avoid using technical jargon or complex terms.
    
    User Data:
    - Name: ${user.name}
    - Phone Number: ${user.phoneNumber}
    - Orders: ${JSON.stringify(user.orders)}
    - Incidents: ${JSON.stringify(user.incidents)}
    - Invoices: ${JSON.stringify(user.invoices)}
    
    User query: "${message}"
    
    ${orderIntent.isOrderIntent ? 
      `The user's message contains an intent to place an order. If appropriate, ask clarifying questions about what product they want and which plan. If you have enough information about the product and plan they want, offer them to confirm the order with the following template:
      
      "To confirm your order for [PRODUCT] with the [PLAN] plan, please reply with 'Confirm order: Yes, product: [PRODUCT], plan: [PLAN]'"
      
      Available products: SIM, Phone, Internet, TV
      Available plans: Basic, Premium, Unlimited, Family` 
      : ""}
    
    FORMATTING RULES (VERY IMPORTANT):
    1. Use compact markdown formatting with minimal spacing
    2. Use markdown for formatting:
      - For bold text: **bold text**
      - For bullet points: Use dashes with single space (- Item)
      - For numbered lists: Use numbers (1. Item)
    3. DO NOT put blank lines before or after lists
    4. Connect lists directly to preceding paragraphs
    5. Only use one line break between different paragraphs
    6. After greeting, place the rest of the text in a new line

    INVOICE EXPLANATION RULES (VERY IMPORTANT):
    1. When explaining invoices, check the description field carefully:
      - If the description starts with "Discount:", it's a special offer or promotional discount
      - If there's no "Discount:" prefix and the price is negative, it means the service was stopped before the end of the billing period
    2. Group charges into these simple categories:
      - Your Monthly Services (regular charges)
      - Special Offers & Discounts (amounts with "Discount:" in description)
      - Credit for Stopped Services (negative amounts without "Discount:" prefix)
    3. Format the explanation like this example:
       Here's a simple breakdown of your bill:
        - **Your Monthly Services:**
        Internet: €20.00
        TV Package: €5.00
        - **Special Offers & Discounts:**
        **Savings** on ESPN Package: -€7.50 (special offer discount)
        - **Credit for Stopped Services:**
        **Money Back** for Entertainment Package: -€2.00 (credit because you stopped this service early)
    4. Use simple, everyday language:
      - Say "savings" or "discount" instead of "promotional discount"
      - Say "money back" or "credit" instead of "service adjustment"
      - Always explain negative amounts in plain terms like "because you stopped this service early" or "special offer discount"
    5. Only show the most important charges unless asked for more detail
    6. Be direct and clear about what each charge or credit means
    
    Be friendly and helpful, but keep explanations simple and easy to understand. Use **bold text** to highlight important savings or credits. Always explain charges in a way that makes sense to everyday customers.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    const cleanedResponse = response
      .replace(/\n\s*\n/g, "\n")
      .replace(/\n\s*- /g, "\n- ")
      .replace(/\n\s*\d+\. /g, "\n1. ")
      .trim();

    return NextResponse.json({
      reply: cleanedResponse,
      isOrderIntent: orderIntent.isOrderIntent, // Include order intent in the response
      productName: orderIntent.productName || null,
      plan: orderIntent.plan || null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}