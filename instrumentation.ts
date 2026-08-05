import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;

  // Runtime logs deliberately omit query strings, headers, and form data so
  // customer contact details are never written to the monitoring stream.
  console.error(
    JSON.stringify({
      event: "next_server_error",
      message: error instanceof Error ? error.message : String(error),
      digest,
      method: request.method,
      pathname: request.path.split("?", 1)[0],
      routePath: context.routePath,
      routeType: context.routeType,
      timestamp: new Date().toISOString(),
    }),
  );
};
