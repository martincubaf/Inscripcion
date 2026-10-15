import { policyVersion } from "../shared/validation.js";

const key = "consevia.registration-draft";
const lifetime = 2 * 60 * 60 * 1000;
export function clearDraft(storage) {
  try {
    storage.removeItem(key);
  } catch {
    /* El formulario funciona sin almacenamiento. */
  }
}
export function readDraft(storage, now = Date.now()) {
  try {
    const draft = JSON.parse(storage.getItem(key) || "null");
    if (!draft) return null;
    if (
      draft.policyVersion !== policyVersion ||
      !Number.isFinite(draft.savedAt) ||
      now - draft.savedAt < 0 ||
      now - draft.savedAt > lifetime ||
      !draft.data ||
      typeof draft.data !== "object" ||
      Array.isArray(draft.data) ||
      !Object.values(draft.data).every((value) => typeof value === "string") ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        draft.id || "",
      )
    ) {
      clearDraft(storage);
      return null;
    }
    return {
      data: draft.data,
      consent: draft.consent === true,
      marketingConsent: draft.marketingConsent === true,
      id: draft.id,
      sentData: typeof draft.sentData === "string" ? draft.sentData : "",
    };
  } catch {
    clearDraft(storage);
    return null;
  }
}
export function saveDraft(storage, draft, now = Date.now()) {
  try {
    storage.setItem(
      key,
      JSON.stringify({ ...draft, savedAt: now, policyVersion }),
    );
  } catch {
    /* Almacenamiento bloqueado o lleno. */
  }
}
