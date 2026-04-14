"use client";
import { useState, useEffect } from "react";

function getAbuDhabiTime(): string {
  return new Date().toLocaleTimeString("en-AE", {
    timeZone: "Asia/Dubai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) + " · Abu Dhabi";
}

export function useClock(): string {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(getAbuDhabiTime());
    const interval = setInterval(() => setTime(getAbuDhabiTime()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return time;
}
