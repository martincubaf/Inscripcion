import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { validate, phone, lima, callao } from "../shared/validation.js";
import { handle } from "../server/service.mjs";
const data = {
  name: "Persona de prueba",
  profession: "Médico",
  phone: "987 654 321",
  email: "prueba@example.com",
  attends: "No",
  consent: true,
  policyVersion: "2026-10-15",
};
const env = {
  APPS_SCRIPT_URL: "https://script.google.com/test",
  APPS_SCRIPT_SECRET: "test-secret",
  FORM_TOKEN_SECRET: "a".repeat(32),
  PUBLIC_ORIGIN: "https://example.com",
  PRIVACY_URL: "https://example.com/privacidad",
  PRIVACY_APPROVED: "true",
};
function token(age = 5000) {
  const time = String(Date.now() - age);
  return (
    time +
    "." +
    createHmac("sha256", env.FORM_TOKEN_SECRET).update(time).digest("hex")
  );
}
function request(overrides = {}, origin = env.PUBLIC_ORIGIN) {
  return new Request("https://example.com/api/registration", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({
      id: randomUUID(),
      data,
      token: token(),
      ...overrides,
    }),
  });
}
test("celular peruano con prefijo opcional y caracteres de presentación", () => {
  for (const p of ["987654321", "+51 987 654 321", "987-654-321"])
    assert.equal(phone(p), "+51987654321");
  for (const p of [
    "123456789",
    "98765432",
    "51987654321",
    "+52 987654321",
    "9876543210",
  ])
    assert.equal(phone(p), null);
});
test("obligatorios, consentimiento y correo", () => {
  assert.equal(validate(data).valid, true);
  assert.equal(
    validate({ ...data, email: "a@b", consent: false }).valid,
    false,
  );
  for (const key of ["name", "profession", "phone", "email", "attends"])
    assert.ok(validate({ ...data, [key]: "" }).errors[key]);
});
test("campos condicionales y valores permitidos", () => {
  assert.ok(validate({ ...data, profession: "Otro" }).errors.otherProfession);
  assert.ok(validate({ ...data, attends: "Sí" }).errors.establishment);
  const establishment = {
    ...data,
    attends: "Sí",
    establishment: "Prueba",
    establishmentType: "Hospital",
    district: "Lima",
  };
  assert.ok(validate(establishment).errors.address);
  assert.equal(
    validate({ ...establishment, address: "Av. Prueba 123" }).valid,
    true,
  );
  assert.equal(validate({ ...data, attends: "No", address: "" }).valid, true);
  assert.ok(
    validate({
      ...data,
      attends: "Sí",
      establishment: "A",
      establishmentType: "Hospital",
      district: "Otra localidad",
    }).errors.otherLocation,
  );
  assert.equal(
    validate({ ...data, attends: "No", establishment: "Dato oculto" }).data
      .establishment,
    "",
  );
  assert.equal(lima.length, 43);
  assert.equal(callao.length, 7);
});
test("no habilita inscripciones sin política aprobada y secretos", async () => {
  assert.equal((await handle(request(), {})).status, 503);
  assert.equal(
    (await (await handle(new Request("https://example.com"), {})).json()).ready,
    false,
  );
});
test("rechaza origen, firma, envío rápido y honeypot", async () => {
  for (const r of [
    request({}, "https://attacker.example"),
    request({ token: "forged" }),
    request({ token: token(100) }),
    request({ website: "spam" }),
  ])
    assert.ok((await handle(r, env)).status >= 400);
});
test("no confirma respuestas vacías, IDs distintos ni fallos de Sheets", async () => {
  for (const receipt of [
    {},
    { ok: true, saved: false },
    { ok: true, saved: true, id: "wrong" },
  ])
    assert.equal(
      (await handle(request(), env, async () => Response.json(receipt))).status,
      502,
    );
  assert.equal(
    (
      await handle(request(), env, async () => {
        throw new Error("offline");
      })
    ).status,
    502,
  );
});
test("solo confirma recibo guardado con ID coincidente", async () => {
  const id = randomUUID();
  const res = await handle(request({ id }), env, async (url, opts) => {
    const payload = JSON.parse(opts.body);
    assert.equal(payload.secret, env.APPS_SCRIPT_SECRET);
    assert.equal(payload.data.phone, "+51987654321");
    return Response.json({
      ok: true,
      saved: true,
      id,
      schemaVersion: 2,
      marketingConsent: false,
    });
  });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).id, id);
});
function gasHarness() {
  const rows = [];
  let fail = false;
  let tz = "";
  const cache = new Map();
  let locked = false;
  const range = (r, c, n = 1, m = 1) => ({
    setValues(values) {
      if (fail) throw Error("write fail");
      values.forEach((v, i) => {
        rows[r - 1 + i] ??= [];
        v.forEach((x, j) => (rows[r - 1 + i][c - 1 + j] = x));
      });
      return this;
    },
    getValues() {
      return Array.from({ length: n }, (_, i) =>
        Array.from({ length: m }, (_, j) => rows[r - 1 + i]?.[c - 1 + j] ?? ""),
      );
    },
    getValue() {
      return rows[r - 1]?.[c - 1];
    },
    setNumberFormat() {
      return this;
    },
    setFontWeight() {
      return this;
    },
    createTextFinder(id) {
      return {
        matchEntireCell() {
          return this;
        },
        findNext() {
          const index = rows.findIndex(
            (row, index) =>
              index >= r - 1 && index < r - 1 + n && row[0] === id,
          );
          return index < 0 ? null : { getRow: () => index + 1 };
        },
      };
    },
  });
  const sheet = {
    getLastRow: () => rows.length,
    getRange: range,
    setFrozenRows() {},
  };
  const context = {
    console,
    Date,
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (v) => ({ setMimeType: () => JSON.parse(v) }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) =>
          ({ WRITE_SECRET: "test-secret", SPREADSHEET_ID: "test-sheet" })[key],
      }),
    },
    SpreadsheetApp: {
      openById: () => ({
        getSheetByName: () => sheet,
        setSpreadsheetTimeZone: (v) => {
          tz = v;
        },
      }),
      flush() {},
    },
    LockService: {
      getScriptLock: () => ({
        waitLock() {
          assert.equal(locked, false);
          locked = true;
        },
        releaseLock() {
          locked = false;
        },
      }),
    },
    CacheService: {
      getScriptCache: () => ({
        get: (k) => cache.get(k),
        put: (k, v) => cache.set(k, v),
      }),
    },
    Utilities: {
      formatDate: (date, zone, format) => {
        assert.equal(zone, "America/Lima");
        const parts = new Intl.DateTimeFormat("sv-SE", {
          timeZone: zone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
        }).format(date);
        return format === "yyyy-MM-dd"
          ? parts.slice(0, 10)
          : format === "HH:mm:ss"
            ? parts.slice(11)
            : parts;
      },
    },
  };
  vm.createContext(context);
  vm.runInContext(readFileSync("apps-script/Code.gs", "utf8"), context);
  context.setupSheet();
  return {
    context,
    rows,
    get tz() {
      return tz;
    },
    fail: () => {
      fail = true;
    },
    send: (id = randomUUID(), extra = {}) =>
      context.doPost({
        postData: {
          contents: JSON.stringify({
            secret: "test-secret",
            id,
            data,
            rateKey: "a".repeat(32),
            ...extra,
          }),
        },
      }),
  };
}
test("Apps Script simulado: escribe 22 columnas, hora Perú y deduplica", () => {
  const gas = gasHarness();
  const id = randomUUID();
  assert.equal(gas.send(id).saved, true);
  assert.equal(gas.send(id).saved, true);
  assert.equal(gas.rows.length, 2);
  assert.equal(gas.rows[1].length, 22);
  assert.equal(gas.rows[1][0], id);
  assert.match(gas.rows[1][1], /^\d{4}-\d{2}-\d{2}$/);
  assert.match(gas.rows[1][2], /^\d{2}:\d{2}:\d{2}$/);
  assert.equal(gas.tz, "America/Lima");
  assert.equal(gas.context.doGet().ok, false);
});
test("Apps Script simulado: rechaza clave, datos inválidos y falla de escritura", () => {
  const gas = gasHarness();
  assert.equal(
    gas.send(randomUUID(), { secret: "wrong" }).code,
    "UNAUTHORIZED",
  );
  assert.equal(gas.send(randomUUID(), { data: {} }).code, "VALIDATION");
  gas.fail();
  assert.equal(gas.send().ok, false);
  assert.equal(gas.rows.length, 1);
});
test("Apps Script simulado: limita envíos y neutraliza fórmulas", () => {
  const gas = gasHarness();
  gas.send(randomUUID(), { data: { ...data, name: "=1+1" } });
  assert.equal(gas.rows[1][3], "'=1+1");
  for (let i = 0; i < 4; i++) assert.equal(gas.send().ok, true);
  assert.equal(gas.send().code, "RATE_LIMIT");
});

test("configuración de Google: genera la clave una vez y conserva el destino de la hoja", () => {
  const gas = gasHarness();
  const props = {};
  gas.context.PropertiesService = {
    getScriptProperties: () => ({
      getProperty: (key) => props[key],
      setProperty: (key, value) => {
        props[key] = value;
      },
    }),
  };
  gas.context.Utilities.getUuid = randomUUID;
  gas.context.setupSheet();
  const secret = props.WRITE_SECRET;
  assert.match(secret, /^[a-f0-9]{64}$/);
  gas.context.setupSheet();
  assert.equal(props.WRITE_SECRET, secret);
  assert.equal(
    gas.context.spreadsheetId_(),
    "1CFRPtNyyhpmA8kvR7uVb28ui2sl2pd_CJhv9jS2p7Xc",
  );
});

test("CONSEVIA: acepta producción y el alias de main con el mismo ajuste", async () => {
  const domains = [
    "https://inscripcion-nine.vercel.app",
    "https://inscripcion-git-main-neslab.vercel.app",
  ];
  for (const configured of domains) {
    for (const origin of domains) {
      const id = randomUUID();
      const result = await handle(
        request({ id }, origin),
        { ...env, PUBLIC_ORIGIN: configured },
        async () =>
          Response.json({
            ok: true,
            saved: true,
            id,
            schemaVersion: 2,
            marketingConsent: false,
          }),
      );
      assert.equal(result.status, 200);
      assert.equal((await result.json()).id, id);
    }
  }
});

test("CONSEVIA: rechaza otros dominios, imitaciones y origen ausente", async () => {
  const production = {
    ...env,
    PUBLIC_ORIGIN: "https://inscripcion-nine.vercel.app",
  };
  const denied = [
    "https://otro-proyecto.vercel.app",
    "https://inscripcion-nine.vercel.app.ejemplo.com",
    "https://inscripcion-nine.vercel.app:8443",
    "http://inscripcion-nine.vercel.app",
    "https://inscripcion-git-main-neslab.vercel.app.ejemplo.com",
    "null",
    "",
  ];
  for (const origin of denied) {
    const result = await handle(request({}, origin), production, async () => {
      throw Error("No debe contactar Google");
    });
    assert.equal(result.status, 403);
    assert.equal((await result.json()).message, "Origen no permitido.");
  }
  const ordinary = await handle(
    request({}, "https://inscripcion-git-main-neslab.vercel.app"),
    env,
  );
  assert.equal(
    ordinary.status,
    403,
    "Un proyecto distinto no debe heredar los alias de CONSEVIA",
  );
});

test("origen configurado: normaliza espacios y barra final, y admite lista explícita", async () => {
  for (const configured of [
    " https://inscripcion-nine.vercel.app/ ",
    "https://example.com, https://otro.example/",
  ]) {
    const origin = configured.includes("inscripcion")
      ? "https://inscripcion-git-main-neslab.vercel.app"
      : "https://otro.example";
    const id = randomUUID();
    const result = await handle(
      request({ id }, origin),
      { ...env, PUBLIC_ORIGIN: configured },
      async () =>
        Response.json({
          ok: true,
          saved: true,
          id,
          schemaVersion: 2,
          marketingConsent: false,
        }),
    );
    assert.equal(result.status, 200);
  }
});

test("publicidad opcional, nunca implícita y sin coerción de cadenas", () => {
  assert.equal(validate(data).valid, true);
  assert.equal(validate(data).data.marketingConsent, false);
  assert.equal(
    validate({ ...data, marketingConsent: true }).data.marketingConsent,
    true,
  );
  assert.equal(validate({ ...data, marketingConsent: false }).valid, true);
  assert.equal(validate({ ...data, marketingConsent: "false" }).valid, false);
});
test("Sheets: registra decisión, versión, fecha y vencimiento a 30 días; reintentos conservan decisión", () => {
  const gas = gasHarness();
  const id = randomUUID();
  const receipt = gas.send(id, { data: { ...data, marketingConsent: true } });
  assert.equal(receipt.schemaVersion, 2);
  assert.equal(receipt.marketingConsent, true);
  assert.equal(gas.rows[1][18], "Sí");
  assert.equal(gas.rows[1][20], "2026-10-15");
  const start = new Date(gas.rows[1][19].replace(" ", "T") + "-05:00");
  const end = new Date(gas.rows[1][21].replace(" ", "T") + "-05:00");
  assert.equal(end - start, 30 * 24 * 60 * 60 * 1000);
  assert.equal(gas.send(id).marketingConsent, true);
  assert.equal(gas.rows.length, 2);
  assert.equal(gas.send().marketingConsent, false);
  assert.equal(gas.rows[2][18], "No");
});
test("migración conserva las 18 columnas y datos antiguos sin inventar consentimiento", () => {
  const gas = gasHarness();
  gas.send();
  gas.rows.forEach((row) => row.splice(18));
  const before = JSON.stringify(gas.rows);
  gas.context.setupSheet();
  assert.equal(gas.rows[0].length, 22);
  assert.equal(JSON.stringify(gas.rows.map((row) => row.slice(0, 18))), before);
  assert.equal(gas.rows[1][18], undefined);
  assert.equal(gas.send(gas.rows[1][0]).code, "CONSENT_NOT_RECORDED");
});
test("migración rechaza columnas ocupadas sin sobrescribir", () => {
  const gas = gasHarness();
  gas.send();
  gas.rows[0].splice(18);
  gas.rows[1][18] = "dato ajeno";
  const before = JSON.stringify(gas.rows);
  assert.throws(() => gas.context.setupSheet());
  assert.equal(JSON.stringify(gas.rows), before);
});
test("servidor exige confirmación de las autorizaciones y las transmite a Sheets", async () => {
  const id = randomUUID();
  for (const receipt of [
    { ok: true, saved: true, id },
    { ok: true, saved: true, id, schemaVersion: 2, marketingConsent: false },
  ]) {
    const res = await handle(
      request({ id, data: { ...data, marketingConsent: true } }),
      env,
      async () => Response.json(receipt),
    );
    assert.equal(res.status, 502);
  }
  const res = await handle(
    request({ id, data: { ...data, marketingConsent: true } }),
    env,
    async (_, opts) => {
      assert.equal(JSON.parse(opts.body).data.marketingConsent, true);
      return Response.json({
        ok: true,
        saved: true,
        id,
        schemaVersion: 2,
        marketingConsent: true,
      });
    },
  );
  assert.equal(res.status, 200);
});
