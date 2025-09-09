import { openrouter } from "@/ai/openrouter";

export async function chatComplete({
  system,
  user,
  model = "openai/gpt-4o-mini", // modelo rápido por defecto
  temperature = 0.2,
}: {
  system?: string;
  user: string;
  model?: string;
  temperature?: number;
}): Promise<string> {
  const messages = [
    ...(system ? [{ role: "system" as const, content: system }] : []),
    { role: "user" as const, content: user },
  ];

  const resp = await openrouter.chat.completions.create({
    model,
    messages,
    temperature,
  });

  return resp.choices[0]?.message?.content ?? "";
}
