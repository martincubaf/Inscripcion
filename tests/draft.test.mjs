import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readDraft, saveDraft, clearDraft } from "../src/draft.js";
function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}
test("borrador: recupera campos, autorizaciones e identificador al regresar", () => {
  const session = storage();
  const draft = {
    id: randomUUID(),
    data: { name: "Prueba", address: "Av. Prueba 123" },
    consent: true,
    marketingConsent: false,
    sentData: "intento-previo",
  };
  saveDraft(session, draft, 1000);
  assert.deepEqual(readDraft(session, 2000), draft);
  clearDraft(session);
  assert.equal(readDraft(session, 2000), null);
});
test("borrador: descarta sesiones vencidas o dañadas", () => {
  const session = storage();
  saveDraft(session, { id: randomUUID(), data: {}, consent: true }, 1000);
  assert.equal(readDraft(session, 1000 + 2 * 60 * 60 * 1000 + 1), null);
  session.setItem("consevia.registration-draft", "{invalido");
  assert.equal(readDraft(session), null);
});
test("borrador: no atribuye consentimientos de otra política y tolera almacenamiento bloqueado", () => {
  const session = storage();
  saveDraft(session, { id: randomUUID(), data: {}, consent: true }, 1000);
  const payload = JSON.parse(session.getItem("consevia.registration-draft"));
  payload.policyVersion = "antigua";
  session.setItem("consevia.registration-draft", JSON.stringify(payload));
  assert.equal(readDraft(session, 2000), null);
  const blocked = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
    removeItem() {
      throw Error();
    },
  };
  assert.equal(readDraft(blocked), null);
  assert.doesNotThrow(() => saveDraft(blocked, {}));
});
