// netlify/functions/generate.js
// This file runs on Netlify's servers — the API key never touches the browser.

const RATE_LIMIT = new Map(); // simple in-memory rate limiter

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Basic rate limiting — max 10 requests per IP per hour
  const ip = event.headers["x-forwarded-for"] || "unknown";
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10;

  if (!RATE_LIMIT.has(ip)) {
    RATE_LIMIT.set(ip, []);
  }
  const timestamps = RATE_LIMIT.get(ip).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: "Too many requests — please try again later! 🌙" }),
    };
  }
  timestamps.push(now);
  RATE_LIMIT.set(ip, timestamps);

  // Parse request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { system, user } = body;
  if (!system || !user) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing system or user prompt" }) };
  }

  // Call Anthropic — API key stays here on the server
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 6000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "Anthropic API error" }),
      };
    }

    const result = data.content.map(b => b.text || "").join("");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error — please try again" }),
    };
  }
};
