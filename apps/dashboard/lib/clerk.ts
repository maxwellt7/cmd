export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const clerkSecretKey = process.env.CLERK_SECRET_KEY;

export const isClerkConfigured =
  typeof clerkPublishableKey === "string" &&
  clerkPublishableKey.length > 0 &&
  typeof clerkSecretKey === "string" &&
  clerkSecretKey.length > 0;
