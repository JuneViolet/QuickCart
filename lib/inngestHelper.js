import { inngest } from "@/config/inngest";

export async function sendInngestEvent(eventName, eventId, data, options = {}) {
  const { maxRetries = 3, timeout = 5000, fallbackCallback = null } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const inngestPromise = inngest.send({
        name: eventName,
        id: eventId,
        data,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Inngest timeout")), timeout)
      );

      await Promise.race([inngestPromise, timeoutPromise]);

      console.log(`✅ Inngest event sent successfully (attempt ${attempt})`);
      return { success: true, attempt };
    } catch (error) {
      console.error(`❌ Inngest attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        console.error(`❌ All ${maxRetries} Inngest attempts failed`);

        // Gọi fallback nếu có
        if (fallbackCallback) {
          try {
            await fallbackCallback(data);
            console.log("✅ Fallback callback executed successfully");
          } catch (fallbackError) {
            console.error(
              "❌ Fallback callback failed:",
              fallbackError.message
            );
          }
        }

        return { success: false, error: error.message, attempts: maxRetries };
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}

export function createInngestFallback(
  orderId,
  trackingCode,
  items,
  address,
  amount
) {
  return async () => {
    // Import động để tránh circular dependency
    const { processGHNOrder } = await import("@/app/api/order/create/route");
    await processGHNOrder(orderId, trackingCode, items, address, amount);
  };
}
