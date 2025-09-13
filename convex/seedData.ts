import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Seed data for users
export const seedUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = [
      {
        clerkId: "user_2abc123def456",
        name: "John Doe",
        email: "john.doe@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      {
        clerkId: "user_2xyz789ghi012",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      {
        clerkId: "user_2mno345pqr678",
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        clerkId: "user_2stu901vwx234",
        name: "Sarah Wilson",
        email: "sarah.wilson@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      {
        clerkId: "user_2def567hij890",
        name: "Alex Chen",
        email: "alex.chen@example.com",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      }
    ];

    const userIds = [];
    for (const user of users) {
      const userId = await ctx.db.insert("users", user);
      userIds.push(userId);
    }
    
    console.log(`Seeded ${userIds.length} users`);
    return userIds;
  },
});

// Seed data for events
export const seedEvents = mutation({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, { userIds }) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const events = [
      {
        title: "Tech Conference 2024",
        description: "Annual technology conference featuring the latest innovations in AI, blockchain, and web development.",
        venue: "San Francisco Convention Center",
        date: "2024-03-15",
        capacity: 500,
        slug: "tech-conference-2024",
        ownerId: userIds[0],
        createdAt: now
      },
      {
        title: "Music Festival Summer",
        description: "Three-day outdoor music festival featuring indie bands and electronic artists.",
        venue: "Golden Gate Park",
        date: "2024-07-20",
        capacity: 2000,
        slug: "music-festival-summer",
        ownerId: userIds[1],
        createdAt: now + oneDay
      },
      {
        title: "Startup Pitch Night",
        description: "Local entrepreneurs pitch their innovative startup ideas to investors and mentors.",
        venue: "Innovation Hub Downtown",
        date: "2024-04-10",
        capacity: 150,
        slug: "startup-pitch-night",
        ownerId: userIds[2],
        createdAt: now + (2 * oneDay)
      },
      {
        title: "Food & Wine Expo",
        description: "Culinary experience showcasing local restaurants, wineries, and food artisans.",
        venue: "Pier 39 Exhibition Hall",
        date: "2024-05-25",
        capacity: 800,
        slug: "food-wine-expo",
        ownerId: userIds[0],
        createdAt: now + (3 * oneDay)
      },
      {
        title: "Art Gallery Opening",
        description: "Contemporary art exhibition featuring emerging local artists.",
        venue: "Modern Art Museum",
        date: "2024-06-08",
        capacity: 200,
        slug: "art-gallery-opening",
        ownerId: userIds[3],
        createdAt: now + (4 * oneDay)
      }
    ];

    const eventIds = [];
    for (const event of events) {
      const eventId = await ctx.db.insert("events", event);
      eventIds.push(eventId);
    }
    
    console.log(`Seeded ${eventIds.length} events`);
    return eventIds;
  },
});

// Seed data for tickets
export const seedTickets = mutation({
  args: { 
    userIds: v.array(v.id("users")),
    eventIds: v.array(v.id("events"))
  },
  handler: async (ctx, { userIds, eventIds }) => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Generate tickets for each event
    const tickets = [];
    
    // Tech Conference tickets
    tickets.push(
      {
        code: "TC2024-001",
        userId: userIds[0],
        eventId: eventIds[0],
        reservedAt: now - (5 * oneHour)
      },
      {
        code: "TC2024-002",
        userId: userIds[1],
        eventId: eventIds[0],
        reservedAt: now - (4 * oneHour),
        checkedInAt: now - (2 * oneHour),
        checkedInBy: userIds[4]
      },
      {
        code: "TC2024-003",
        userId: userIds[2],
        eventId: eventIds[0],
        reservedAt: now - (3 * oneHour)
      }
    );
    
    // Music Festival tickets
    tickets.push(
      {
        code: "MFS2024-001",
        userId: userIds[1],
        eventId: eventIds[1],
        reservedAt: now - (6 * oneHour)
      },
      {
        code: "MFS2024-002",
        userId: userIds[3],
        eventId: eventIds[1],
        reservedAt: now - (5 * oneHour),
        checkedInAt: now - (1 * oneHour),
        checkedInBy: userIds[0]
      }
    );
    
    // Startup Pitch Night tickets
    tickets.push(
      {
        code: "SPN2024-001",
        userId: userIds[4],
        eventId: eventIds[2],
        reservedAt: now - (2 * oneHour)
      },
      {
        code: "SPN2024-002",
        userId: userIds[0],
        eventId: eventIds[2],
        reservedAt: now - (1 * oneHour)
      }
    );
    
    // Food & Wine Expo tickets
    tickets.push(
      {
        code: "FWE2024-001",
        userId: userIds[2],
        eventId: eventIds[3],
        reservedAt: now - (7 * oneHour)
      },
      {
        code: "FWE2024-002",
        userId: userIds[3],
        eventId: eventIds[3],
        reservedAt: now - (6 * oneHour)
      }
    );
    
    // Art Gallery Opening tickets
    tickets.push(
      {
        code: "AGO2024-001",
        userId: userIds[4],
        eventId: eventIds[4],
        reservedAt: now - (8 * oneHour),
        checkedInAt: now - (3 * oneHour),
        checkedInBy: userIds[3]
      }
    );

    const ticketIds = [];
    for (const ticket of tickets) {
      const ticketId = await ctx.db.insert("tickets", ticket);
      ticketIds.push(ticketId);
    }
    
    console.log(`Seeded ${ticketIds.length} tickets`);
    return ticketIds;
  },
});

// Seed data for checkin logs
export const seedCheckinLogs = mutation({
  args: { 
    userIds: v.array(v.id("users")),
    eventIds: v.array(v.id("events")),
    ticketIds: v.array(v.id("tickets"))
  },
  handler: async (ctx, { userIds, eventIds, ticketIds }) => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const checkinLogs = [
      {
        ticketId: ticketIds[1], // TC2024-002
        eventId: eventIds[0],
        byUserId: userIds[4],
        status: "success" as const,
        at: now - (2 * oneHour)
      },
      {
        ticketId: ticketIds[4], // MFS2024-002
        eventId: eventIds[1],
        byUserId: userIds[0],
        status: "success" as const,
        at: now - (1 * oneHour)
      },
      {
        ticketId: ticketIds[9], // AGO2024-001
        eventId: eventIds[4],
        byUserId: userIds[3],
        status: "success" as const,
        at: now - (3 * oneHour)
      },
      // Some failed attempts
      {
        ticketId: ticketIds[0], // TC2024-001 - attempted duplicate checkin
        eventId: eventIds[0],
        byUserId: userIds[2],
        status: "already" as const,
        at: now - (30 * 60 * 1000) // 30 minutes ago
      },
      {
        eventId: eventIds[2],
        byUserId: userIds[1],
        status: "invalid" as const,
        at: now - (45 * 60 * 1000) // 45 minutes ago - invalid ticket
      }
    ];

    const checkinLogIds = [];
    for (const log of checkinLogs) {
      const logId = await ctx.db.insert("checkinLogs", log);
      checkinLogIds.push(logId);
    }
    
    console.log(`Seeded ${checkinLogIds.length} checkin logs`);
    return checkinLogIds;
  },
});


// Master seed function that runs all seeds in the correct order
export const seedAllData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting data seeding...");
    
    // Step 1: Seed users first (no dependencies)
    const userIds: any = await ctx.runMutation(api.seedData.seedUsers, {});
    
    // Step 2: Seed events (depends on users)
    const eventIds: any = await ctx.runMutation(api.seedData.seedEvents, { userIds });
    
    // Step 3: Seed tickets (depends on users and events)
    const ticketIds: any = await ctx.runMutation(api.seedData.seedTickets, { userIds, eventIds });
    
    // Step 4: Seed checkin logs (depends on users, events, and tickets)
    const checkinLogIds: any = await ctx.runMutation(api.seedData.seedCheckinLogs, { userIds, eventIds, ticketIds });
    
    console.log("Data seeding completed successfully!");
    
    return {
      users: userIds.length,
      events: eventIds.length,
      tickets: ticketIds.length,
      checkinLogs: checkinLogIds.length,
      total: userIds.length + eventIds.length + ticketIds.length + checkinLogIds.length
    };
  },
});
