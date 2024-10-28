import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { replicate } from "@/lib/replicate";

const app = new Hono()
  .post(
    "/remove-bg",
    zValidator(
      "json",
      z.object({
        image: z.string(),
      }),
    ),
    async (c) => {
      const { image } = c.req.valid("json");

      const input = {
        image: image,
      };

      const output: unknown = await replicate.run("cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003", { input });

      const res = output as string;

      return c.json({ data: res });

    },
  )
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