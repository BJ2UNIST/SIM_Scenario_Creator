export default defineNuxtPlugin(() => {
  const log = (level: "info" | "error", ...args: any) => {
    console[level](`[${new Date().toISOString()}]`, ...args);
  };

  return {
    provide: {
      log: {
        info: (...args: any) => log("info", ...args),
        error: (...args: any) => log("error", ...args),
        // 필요한 다른 로그 레벨 추가
      },
    },
  };
});
