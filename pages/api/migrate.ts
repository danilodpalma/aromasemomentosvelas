import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { secret } = req.query;

  if (secret !== process.env.MIGRATE_SECRET) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  exec(
    "node ./node_modules/prisma/build/index.js db push --accept-data-loss",
    { env: { ...process.env, HOME: "/tmp" } },
    (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: error.message, stderr });
      }
      return res.status(200).json({ success: true, output: stdout });
    },
  );
}
