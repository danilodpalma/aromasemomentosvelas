import type { NextApiRequest, NextApiResponse } from "next";

export function withApiErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>,
) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      await handler(req, res);
    } catch (error) {
      console.error("API error:", error);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error";
      return res.status(500).json({ error: message });
    }
  };
}
