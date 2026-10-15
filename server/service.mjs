import { createHmac, timingSafeEqual } from "node:crypto";
import { validate } from "../shared/validation.js";
const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
function sign(text, secret) {
  return createHmac("sha256", secret).update(text).digest("hex");
}
// Dominios exactos del mismo proyecto CONSEVIA; no se admite *.vercel.app.
const CONSEVIA_ORIGINS = [
  "https://inscripcion-nine.vercel.app",
  "https://inscripcion-git-main-neslab.vercel.app",
];
function allowedOrigins(env) {
  const origins = new Set(
    String(env.PUBLIC_ORIGIN || "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean),
  );
  // Si está configurado uno de los dos dominios del proyecto, admite su alias.
  if (CONSEVIA_ORIGINS.some((origin) => origins.has(origin))) {
    for (const origin of CONSEVIA_ORIGINS) origins.add(origin);
  }
  return origins;
}
export async function handle(request, env = process.env, fetcher = fetch) {
  const configured = Boolean(
    env.APPS_SCRIPT_URL &&
    env.APPS_SCRIPT_SECRET &&
    env.FORM_TOKEN_SECRET?.length >= 32 &&
    env.PUBLIC_ORIGIN &&
    env.PRIVACY_APPROVED === "true" &&
    /^https:\/\//.test(env.PRIVACY_URL || ""),
  );
  if (request.method === "GET") {
    if (!configured)
      return json({
        ready: false,
        privacyUrl: env.PRIVACY_URL || "",
        message:
          "Las inscripciones estarán disponibles cuando se complete la configuración del evento.",
      });
    const started = Date.now().toString();
    return json({
      ready: true,
      privacyUrl: env.PRIVACY_URL,
      token: started + "." + sign(started, env.FORM_TOKEN_SECRET),
    });
  }
  if (request.method !== "POST")
    return json({ message: "Método no permitido." }, 405);
  if (!configured)
    return json(
      { message: "Las inscripciones todavía no están habilitadas." },
      503,
    );
  if (!allowedOrigins(env).has(request.headers.get("origin")))
    return json({ message: "Origen no permitido." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ message: "Formato no permitido." }, 415);
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 12000)
    return json({ message: "Solicitud demasiado grande." }, 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ message: "Solicitud inválida." }, 400);
  }
  if (!body || typeof body !== "object")
    return json({ message: "Solicitud inválida." }, 400);
  const [started, signature] = String(body.token || "").split(".");
  const expected = sign(started, env.FORM_TOKEN_SECRET);
  if (
    !/^\d{13}$/.test(started) ||
    !/^[a-f0-9]{64}$/.test(signature || "") ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return json({ message: "Recarga la página e inténtalo de nuevo." }, 403);
  const age = Date.now() - Number(started);
  if (age < 3000 || age > 2 * 60 * 60 * 1000 || body.website)
    return json(
      {
        message:
          "No pudimos validar el envío. Espera unos segundos o recarga la página.",
      },
      400,
    );
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      body.id || "",
    )
  )
    return json({ message: "Identificador inválido." }, 400);
  const result = validate(body.data);
  if (!result.valid)
    return json(
      { message: "Revisa los campos indicados.", errors: result.errors },
      422,
    );
  // Seudónimo temporal del origen, nunca se almacena la IP en la hoja.
  const source =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-nf-client-connection-ip") ||
    "local";
  const rateKey = sign(
    source.split(",")[0].trim(),
    env.APPS_SCRIPT_SECRET,
  ).slice(0, 32);
  try {
    const upstream = await fetcher(env.APPS_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.APPS_SCRIPT_SECRET,
        id: body.id,
        data: result.data,
        rateKey,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!upstream.ok) throw new Error("upstream");
    const receipt = await upstream.json();
    if (
      receipt?.ok !== true ||
      receipt.id !== body.id ||
      receipt.saved !== true
    ) {
      if (receipt?.code === "RATE_LIMIT")
        return json(
          {
            message:
              "Has realizado varios intentos. Espera unos minutos antes de volver a enviar.",
          },
          429,
        );
      throw new Error("unconfirmed");
    }
    return json({ ok: true, saved: true, id: receipt.id });
  } catch {
    return json(
      {
        message:
          "No pudimos confirmar el registro. Vuelve a intentar con los mismos datos: el reintento conserva tu identificador para evitar duplicados.",
      },
      502,
    );
  }
}
