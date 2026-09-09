import type { NextApiRequest, NextApiResponse } from "next";

export function withApiErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>,
) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      await handler(req, res);
    } catch (error) {
      const statusCode =
        error instanceof Error && (error as any).statusCode
          ? (error as any).statusCode
          : 500;
      if (statusCode >= 500) {
        console.error("API error:", error);
      }
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error";
      return res.status(statusCode).json({ error: message });
    }
  };
}
