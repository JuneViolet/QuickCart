// Tạo file này để suppress styled-jsx warnings trong Next.js 15
// File này sẽ được import trong app để tắt warnings
if (typeof window === "undefined") {
  // Chỉ chạy trên server
  const originalWarn = console.warn;
  console.warn = (...args) => {
    // Bỏ qua các warning về styled-jsx và client-only
    if (
      args[0] &&
      args[0].includes &&
      (args[0].includes("styled-jsx") ||
        args[0].includes("client-only") ||
        args[0].includes("Invalid import"))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export {};
