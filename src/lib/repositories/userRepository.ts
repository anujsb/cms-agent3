// // lib/repositories/userRepository.ts
// import { db } from '../db';
// import { users, orders, incidents, invoices, products } from '../schema';
// import { eq } from 'drizzle-orm';
// import { v4 as uuidv4 } from 'uuid';

// export interface UserWithDetails {
//   id: string;
//   name: string;
//   phoneNumber: string;
//   orders: {
//     orderId: string;
//     productName: string;
//     inServiceDate: string;
//     outServiceDate: string | null; // Nullable if not set
//     plan: string;
//     status: string;
//   }[];
//   incidents: {
//     incidentId: string;
//     date: string;
//     description: string;
//     status: string;
//   }[];
//   invoices: {
//     id: number;
//     periodStartDate: string;
//     periodEndDate: string;
//     price: string;
//     adjustment: string | null;
//   }[];
// }

// export class UserRepository {
//   // Get all users (basic info only)
//   async getAllUsers() {
//     return db.select({
//       id: users.externalId,
//       name: users.name,
//       phoneNumber: users.phoneNumber,
//     }).from(users);
//   }

//   // Get a user by their external ID with all details
//   async getUserById(externalId: string): Promise<UserWithDetails | null> {
//     // Get the user
//     const userResults = await db.select().from(users).where(eq(users.externalId, externalId));
    
//     if (userResults.length === 0) {
//       return null;
//     }
    
//     const user = userResults[0];
    
//     // Get the user's orders
//     const userOrders = await db.select({
//       orderId: orders.orderId,
//       productName: orders.productName,
//       inServiceDate: orders.inServiceDate,
//       outServiceDate: orders.outServiceDate,
//       plan: orders.plan,
//       status: orders.status,
//     }).from(orders).where(eq(orders.userId, user.id));
    
//     // Get the user's incidents
//     const userIncidents = await db.select({
//       incidentId: incidents.incidentId,
//       date: incidents.date,
//       description: incidents.description,
//       status: incidents.status,
//     }).from(incidents).where(eq(incidents.userId, user.id));
    
//     // Get the user's invoices
//     const userInvoices = await db.select({
//       id: invoices.id,
//       periodStartDate: invoices.periodStartDate,
//       periodEndDate: invoices.periodEndDate,
//       price: invoices.price,
//       adjustment: invoices.adjustment,
//     }).from(invoices).where(eq(invoices.userId, user.id));
    
//     // Format dates for frontend display
//     const formattedOrders = userOrders.map(order => ({
//       ...order,
//       inServiceDate: order.inServiceDate ? new Date(order.inServiceDate).toISOString().split('T')[0] : '',
//       outServiceDate: order.outServiceDate ? new Date(order.outServiceDate).toISOString().split('T')[0] : null,
//     }));
    
//     const formattedIncidents = userIncidents.map(incident => ({
//       ...incident,
//       date: new Date(incident.date).toISOString().split('T')[0]
//     }));
    
//     const formattedInvoices = userInvoices.map(invoice => ({
//       ...invoice,
//       periodStartDate: new Date(invoice.periodStartDate).toISOString().split('T')[0],
//       periodEndDate: new Date(invoice.periodEndDate).toISOString().split('T')[0]
//     }));
    
//     // Return the user with their orders and incidents
//     return {
//       id: user.externalId,
//       name: user.name,
//       phoneNumber: user.phoneNumber,
//       orders: formattedOrders,
//       incidents: formattedIncidents,
//       invoices: formattedInvoices,
//     };
//   }

//   // Create a new user
//   async createUser(name: string, email: string, phoneNumber: string) {
//     const externalId = uuidv4();
//     await db.insert(users).values({
//       externalId,
//       name,
//       email,
//       phoneNumber,
//     });
//     return externalId;
//   }

//   // Get product by name or create if it doesn't exist
//   async getOrCreateProduct(productName: string, price: string = "0.00") {
//     // Try to find the product first
//     const productResults = await db.select().from(products).where(eq(products.productName, productName));
    
//     if (productResults.length > 0) {
//       return productResults[0].id;
//     }
    
//     // If product doesn't exist, create it
//     const result = await db.insert(products).values({
//       productName,
//       price,
//     }).returning({ id: products.id });
    
//     return result[0].id;
//   }

//   // Add an order for a user
//   async addOrder(userId: string, productName: string, plan: string, status: 'Active' | 'Expired' | 'Pending', inServiceDate: Date, outServiceDate?: Date) {
//     // Get the internal user ID
//     const userResults = await db.select().from(users).where(eq(users.externalId, userId));
    
//     if (userResults.length === 0) {
//       throw new Error('User not found');
//     }
    
//     // Get or create the product
//     const productId = await this.getOrCreateProduct(productName);
//     const orderId = `ORD${Math.floor(1000 + Math.random() * 9000)}`;
    
//     await db.insert(orders).values({
//       orderId,
//       userId: userResults[0].id,
//       productId,
//       productName,
//       date: new Date(),
//       inServiceDate,
//       outServiceDate: outServiceDate || null,
//       plan,
//       status,
//     });
    
//     return orderId;
//   }

//   // Add an incident for a user
//   async addIncident(userId: string, description: string, status: 'Open' | 'Pending' | 'Resolved') {
//     // Get the internal user ID
//     const userResults = await db.select().from(users).where(eq(users.externalId, userId));
    
//     if (userResults.length === 0) {
//       throw new Error('User not found');
//     }
    
//     const incidentId = `INC${Math.floor(1000 + Math.random() * 9000)}`;
    
//     await db.insert(incidents).values({
//       incidentId,
//       userId: userResults[0].id,
//       date: new Date(),
//       description,
//       status,
//     });
    
//     return incidentId;
//   }

//   // Update an incident status
//   async updateIncidentStatus(incidentId: string, status: 'Open' | 'Pending' | 'Resolved') {
//     await db.update(incidents)
//       .set({ status })
//       .where(eq(incidents.incidentId, incidentId));
//   }

//   // Update an order status
//   async updateOrderStatus(orderId: string, status: 'Active' | 'Expired' | 'Pending') {
//     await db.update(orders)
//       .set({ status })
//       .where(eq(orders.orderId, orderId));
//   }
// }


// lib/repositories/userRepository.ts
import { db } from '../db';
import { customers, contacts, orders, orderProducts, productTypes, orderProductParameters, incidents, invoices } from '../schema';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface UserWithDetails {
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
  invoices: {
    id: number;
    periodStartDate: string;
    periodEndDate: string;
    price: string;
    description: string;
    adjustment: string | null;
  }[];
}

export class UserRepository {
  // Get all users (basic info only)
  async getAllUsers() {
    // Join customers with contacts to get name
    const results = await db
      .select({
        id: customers.customerId,
        firstName: contacts.firstName,
        surname: contacts.surname,
        // We'll use a placeholder for phoneNumber since it's in the original interface
        // but not in our new schema
        phoneNumber: sql<string>`''`,
      })
      .from(customers)
      .leftJoin(contacts, eq(customers.contactId, contacts.contactId));
      
    // Map results to expected format
    return results.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.surname}`.trim(),
      phoneNumber: user.phoneNumber || '',
    }));
  }

  // Get a user by their external ID with all details
  async getUserById(externalId: string): Promise<UserWithDetails | null> {
    // Get the customer
    const customerResults = await db
      .select({
        id: customers.customerId,
        firstName: contacts.firstName,
        surname: contacts.surname,
        phoneNumber: sql<string>`''`, // Placeholder
      })
      .from(customers)
      .leftJoin(contacts, eq(customers.contactId, contacts.contactId))
      .where(eq(customers.customerId, externalId));
    
    if (customerResults.length === 0) {
      return null;
    }
    
    const user = customerResults[0];
    
    // Get the user's orders from orderProducts table
    const userOrders = await db
      .select({
        orderId: sql<string>`CAST(${orders.orderId} AS TEXT)`,
        orderProductId: orderProducts.orderProductId,
        productName: sql<string>`COALESCE(${productTypes.type}, '')`,
        inServiceDate: orderProducts.inServiceDt,
        outServiceDate: orderProducts.outServiceDt,
        status: orders.status,
        createDate: orders.createDate,
      })
      .from(orderProducts)
      .leftJoin(orders, eq(orderProducts.orderId, orders.orderId))
      .leftJoin(productTypes, eq(orderProducts.productTypeId, productTypes.productTypeId))
      .where(
        and(
          eq(orders.customerId, externalId),
          sql`${orders.orderId} IS NOT NULL`
        )
      );
    
    // Get plan info from orderProductParameters
    const planParameters = await db
      .select({
        orderProductId: orderProductParameters.orderProductId,
        value: orderProductParameters.value,
      })
      .from(orderProductParameters)
      .where(
        and(
          eq(orderProductParameters.name, 'PlanName'),
          sql`${orderProductParameters.orderProductId} IN (
            SELECT op.order_product_id 
            FROM order_products op
            JOIN orders o ON op.order_id = o.order_id
            WHERE o.customer_id = ${externalId}
          )`
        )
      );
    
    // Create a map of orderProductId to plan
    const planMap = new Map();
    planParameters.forEach(param => {
      planMap.set(param.orderProductId, param.value);
    });
    
    // Get the user's incidents
    const userIncidents = await db
      .select({
        incidentId: incidents.incidentId,
        date: incidents.date,
        description: incidents.description,
        status: incidents.status,
      })
      .from(incidents)
      .where(eq(incidents.userId, externalId));
    
    // Get the user's invoices
    const userInvoices = await db
      .select({
        id: invoices.id,
        periodStartDate: invoices.periodStartDate,
        periodEndDate: invoices.periodEndDate,
        price: invoices.price,
        description: invoices.description,
        adjustment: sql<string>`CASE WHEN ${invoices.price} < 0 THEN ${invoices.price}::text ELSE NULL END`,
      })
      .from(invoices)
      .where(eq(invoices.customerId, externalId));
    
    // Format dates for frontend display
    const formattedOrders = userOrders.map(order => ({
      ...order,
      // Get plan from map or use default value
      plan: planMap.get(order.orderProductId) || 'Standard',
      // Format dates
      inServiceDate: order.inServiceDate ? new Date(order.inServiceDate).toISOString().split('T')[0] : '',
      outServiceDate: order.outServiceDate ? new Date(order.outServiceDate).toISOString().split('T')[0] : null,
      // Map status values from new schema to expected values
      status: this.mapOrderStatus(order.status || ''),
      // Format create date
      createDate: order.createDate ? new Date(order.createDate).toISOString().split('T')[0] : '',
    }));
    
    const formattedIncidents = userIncidents.map(incident => ({
      ...incident,
      date: new Date(incident.date).toISOString().split('T')[0]
    }));
    
    const formattedInvoices = userInvoices.map(invoice => ({
      ...invoice,
      periodStartDate: invoice.periodStartDate ? new Date(invoice.periodStartDate).toISOString().split('T')[0] : '',
      periodEndDate: invoice.periodEndDate ? new Date(invoice.periodEndDate).toISOString().split('T')[0] : '',
      price: invoice.price || '', // Ensure price is always a string
      description: invoice.description || '' // Ensure description is always a string
    }));
    
    // Return the user with their orders, incidents, and invoices
    return {
      id: user.id,
      name: `${user.firstName} ${user.surname}`.trim(),
      phoneNumber: user.phoneNumber || '',
      orders: formattedOrders,
      incidents: formattedIncidents,
      invoices: formattedInvoices,
    };
  }

  // Helper method to map order status from DB to expected values
  private mapOrderStatus(status: string): string {
    switch (status) {
      case 'InProgress': return 'Active';
      case 'Completed': return 'Expired';
      case 'Pending': return 'Pending';
      default: return status;
    }
  }

  // Helper method to map expected status values to DB values
  private mapToDbOrderStatus(status: 'Active' | 'Expired' | 'Pending'): string {
    switch (status) {
      case 'Active': return 'InProgress';
      case 'Expired': return 'Completed';
      case 'Pending': return 'Pending';
    }
  }

  // Create a new user
  async createUser(name: string, email: string, phoneNumber: string) {
    const customerId = uuidv4();
    
    // Split name into first name and surname
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Create contact record
    const contactId = `PER${Math.floor(1000 + Math.random() * 9000)}`;
    await db.insert(contacts).values({
      contactId,
      firstName,
      surname,
      gender: 'M', // Default value
      age: 0, // Default value
    });
    
    // Create customer record
    await db.insert(customers).values({
      customerId,
      contactId,
    });
    
    return customerId;
  }

  // Get product by name or create if it doesn't exist
  async getOrCreateProduct(productName: string, price: string = "0.00") {
    // Try to find the product type first
    const productTypeResults = await db
      .select({
        id: productTypes.productTypeId,
      })
      .from(productTypes)
      .where(eq(productTypes.type, productName));
    
    if (productTypeResults.length > 0) {
      return productTypeResults[0].id;
    }
    
    // If product type doesn't exist, create it
    const result = await db.insert(productTypes).values({
      productTypeId: Math.floor(1000 + Math.random() * 9000), // Generate a unique ID
      type: productName,
    }).returning({ id: productTypes.productTypeId });
    
    return result[0].id;
  }

  // Add an order for a user
  async addOrder(userId: string, productName: string, plan: string, status: 'Active' | 'Expired' | 'Pending', inServiceDate: Date, outServiceDate?: Date) {
    // Get the customer
    const customerResults = await db
      .select({
        id: customers.customerId,
      })
      .from(customers)
      .where(eq(customers.customerId, userId));
    
    if (customerResults.length === 0) {
      throw new Error('User not found');
    }
    
    // Get or create the product type
    const productTypeId = await this.getOrCreateProduct(productName);
    
    // Create order
    const orderId = `${userId.substring(0, 6)}-${Math.floor(100 + Math.random() * 900)}`;
    await db.insert(orders).values({
      orderId,
      customerId: userId,
      status: this.mapToDbOrderStatus(status) as "InProgress" | "Completed" | "Pending",
      createDate: new Date(),
    });
    
    // Create order product
    const orderProductId = `OP${Math.floor(1000 + Math.random() * 9000)}`;
    await db.insert(orderProducts).values({
      orderProductId,
      orderId,
      productTypeId,
      inServiceDt: inServiceDate,
      outServiceDt: outServiceDate || null,
    });
    
    // Add plan parameter
    await db.insert(orderProductParameters).values({
      orderProductId,
      productTypeId,
      name: 'PlanName',
      value: plan,
    });
    
    return orderProductId; // Return order product ID as the order ID
  }

  // Add an incident for a user
  async addIncident(userId: string, description: string, status: 'Open' | 'Pending' | 'Resolved') {
    // Check if customer exists
    const customerResults = await db
      .select({
        id: customers.customerId,
      })
      .from(customers)
      .where(eq(customers.customerId, userId));
    
    if (customerResults.length === 0) {
      throw new Error('User not found');
    }
    
    const incidentId = `INC${Math.floor(1000 + Math.random() * 9000)}`;
    
    await db.insert(incidents).values({
      incidentId,
      userId, // Use customer ID as user ID
      date: new Date(),
      description,
      status,
    });
    
    return incidentId;
  }

  // Update an incident status
  async updateIncidentStatus(incidentId: string, status: 'Open' | 'Pending' | 'Resolved') {
    await db.update(incidents)
      .set({ status })
      .where(eq(incidents.incidentId, incidentId));
  }

  // Update an order status
  async updateOrderStatus(orderId: string, status: 'Active' | 'Expired' | 'Pending') {
    const dbStatus = this.mapToDbOrderStatus(status);
    
    // First check if orderId is an order product ID
    const orderProductResults = await db
      .select({
        orderId: orderProducts.orderId,
      })
      .from(orderProducts)
      .where(eq(orderProducts.orderProductId, orderId));
    
    if (orderProductResults.length > 0) {
      // Update the order status using the related order ID
      await db.update(orders)
        .set({ status: dbStatus as "InProgress" | "Completed" | "Pending" })
        .where(eq(orders.orderId, orderProductResults[0].orderId!));
    } else {
      // Try updating directly with the order ID
      await db.update(orders)
        .set({ status: dbStatus as "Pending" | "InProgress" | "Completed" })
        .where(eq(orders.orderId, orderId));
    }
  }
}