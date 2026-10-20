/** Server-side diagnostics. Return names and reasons only, never secret values. */
export function paymentReadiness(
  env: Record<string, string | undefined> = process.env,
) {
  const issues: string[] = [];
  const required = [
    "COMMERCE_GATEWAY_URL",
    "COMMERCE_GATEWAY_SECRET",
    "COMMERCE_GATEWAY_WEBHOOK_SECRET",
    "COMMERCE_PAYMENT_HOSTS",
  ];
  for (const name of required)
    if (!env[name]?.trim()) issues.push(`${name} is missing`);
  if (env.COMMERCE_GATEWAY_URL) {
    try {
      const url = new URL(env.COMMERCE_GATEWAY_URL);
      if (
        (url.protocol !== "https:" &&
          !(env.NODE_ENV === "test" && url.protocol === "http:")) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        issues.push(
          "COMMERCE_GATEWAY_URL must be an HTTPS base URL without credentials, query or fragment",
        );
    } catch {
      issues.push("COMMERCE_GATEWAY_URL is invalid");
    }
  }
  for (const name of [
    "COMMERCE_GATEWAY_SECRET",
    "COMMERCE_GATEWAY_WEBHOOK_SECRET",
  ]) {
    if (env[name] && env[name]!.length < 32)
      issues.push(`${name} must contain at least 32 characters`);
  }
  if (
    env.COMMERCE_GATEWAY_SECRET &&
    env.COMMERCE_GATEWAY_SECRET === env.COMMERCE_GATEWAY_WEBHOOK_SECRET
  )
    issues.push("Outbound and webhook signing keys must be different");
  const hosts = (env.COMMERCE_PAYMENT_HOSTS || "")
    .split(",")
    .map((x) => x.trim());
  if (
    env.COMMERCE_PAYMENT_HOSTS &&
    hosts.some((host) => {
      try {
        const url = new URL(`https://${host}`);
        return (
          !host ||
          !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(host) ||
          host.includes(":") ||
          url.hostname !== host ||
          url.port !== "" ||
          url.pathname !== "/" ||
          !!url.search ||
          !!url.hash ||
          !!url.username ||
          !!url.password
        );
      } catch {
        return true;
      }
    })
  )
    issues.push(
      "COMMERCE_PAYMENT_HOSTS must contain exact lowercase hostnames without URLs, paths, ports or wildcards",
    );
  return { ready: issues.length === 0, issues };
}
