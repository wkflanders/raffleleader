import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { replicate } from "@/lib/replicate";

const app = new Hono()
  .post(
    "/generate-image",
    zValidator(
      "json",
      z.object({
        prompt: z.string(),
      }),
    ),
    async (c) => {
      const { prompt } = c.req.valid("json");

      const input = {
        prompt: prompt,
      };

      const outputStream = await replicate.run("stability-ai/stable-diffusion-3", { input }) as ReadableStream;

      // Replicate.com for some reason returning base64 readable stream instead of the image url (Nextjs interfering?)

      // Convert ReadableStream into a string (if it's JSON data)
      const base64Data = await new Response(outputStream).text(); 
      // .text() instead of .json() to read the base64 data as a string

      // Return the base64 image data directly
      return c.json({ data: base64Data });
    }
  );

export default app;