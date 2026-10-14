import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  validate,
  professions,
  establishments,
  lima,
  callao,
} from "../shared/validation.js";
import "./styles.css";
type Data = Record<string, string> & { consent?: never };
type Config = {
  ready: boolean;
  privacyUrl: string;
  token?: string;
  message?: string;
};
function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function App() {
  const [data, setData] = useState<Data>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [config, setConfig] = useState<Config | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const gate = useRef(false);
  const id = useRef(crypto.randomUUID());
  const sentData = useRef("");
  const form = useRef<HTMLFormElement>(null);
  const successBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetch("/api/registration")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() =>
        setConfig({
          ready: false,
          privacyUrl: "",
          message: "No pudimos conectar con el servidor. Recarga la página.",
        }),
      );
  }, []);
  useEffect(() => {
    if (success) successBox.current?.focus();
  }, [success]);
  const update = (name: string, value: string) => {
    setData((old) => ({ ...old, [name]: value }));
    setErrors((old) => ({ ...old, [name]: "" }));
    setMessage("");
  };
  function field(
    name: string,
    label: string,
    required = false,
    options?: string[],
    type = "text",
    hint?: string,
  ) {
    return (
      <div className="field">
        <label htmlFor={name}>
          {label}
          {required && <span className="required"> *</span>}
          {!required && <span className="optional">Opcional</span>}
        </label>
        {options ? (
          <select
            id={name}
            name={name}
            value={data[name] || ""}
            onChange={(e) => update(name, e.target.value)}
            required={required}
            aria-invalid={!!errors[name]}
            aria-describedby={errors[name] ? name + "-error" : undefined}
          >
            <option value="">Selecciona una opción</option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={data[name] || ""}
            onChange={(e) => update(name, e.target.value)}
            maxLength={name === "email" ? 254 : 200}
            required={required}
            autoComplete={
              {
                name: "name",
                phone: "tel",
                email: "email",
                address: "street-address",
              }[name] || "off"
            }
            inputMode={type === "tel" ? "tel" : undefined}
            placeholder={
              name === "phone"
                ? "Ej. 987 654 321"
                : name === "email"
                  ? "nombre@correo.com"
                  : undefined
            }
            aria-invalid={!!errors[name]}
            aria-describedby={
              errors[name] ? name + "-error" : hint ? name + "-hint" : undefined
            }
          />
        )}
        {hint && <small id={name + "-hint"}>{hint}</small>}
        {errors[name] && (
          <small className="error" id={name + "-error"}>
            {errors[name]}
          </small>
        )}
      </div>
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (gate.current) return;
    const result = validate({ ...data, consent });
    setErrors(result.errors);
    if (!result.valid) {
      setMessage("Revisa los campos indicados para continuar.");
      const first = Object.keys(result.errors)[0];
      document.getElementById(first)?.focus();
      return;
    }
    if (!config?.ready) {
      setMessage(
        config?.message || "Las inscripciones todavía no están habilitadas.",
      );
      return;
    }
    gate.current = true;
    setBusy(true);
    setMessage("");
    const snapshot = JSON.stringify(result.data);
    if (sentData.current && sentData.current !== snapshot)
      id.current = crypto.randomUUID();
    sentData.current = snapshot;
    try {
      const website = new FormData(form.current!).get("website");
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id.current,
          data: result.data,
          token: config.token,
          website,
        }),
        signal: AbortSignal.timeout(25000),
      });
      const receipt = await response.json();
      if (
        !response.ok ||
        receipt.ok !== true ||
        receipt.saved !== true ||
        receipt.id !== id.current
      ) {
        if (receipt.errors) setErrors(receipt.errors);
        throw new Error(
          receipt.message ||
            "No pudimos confirmar el registro. Inténtalo de nuevo.",
        );
      }
      setSuccess(true);
    } catch (error) {
      setMessage(
        error instanceof Error &&
          error.name !== "TimeoutError" &&
          error.name !== "AbortError"
          ? error.message
          : "No pudimos confirmar el registro. Inténtalo de nuevo con los mismos datos.",
      );
    } finally {
      gate.current = false;
      setBusy(false);
    }
  }
  const logo = (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_LOGO_URL;
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/" aria-label="CONSEVIA, inicio">
          {logo ? <img src={logo} alt="CONSEVIA" /> : "CONSEVIA"}
        </a>
        <span className="header-caption">SALUD REPRODUCTIVA</span>
        <span className="event-pill">
          <span />
          Evento de lanzamiento
        </span>
      </header>
      <main className="layout">
        <aside className="intro">
          <div className="eyebrow">
            <span />
            UNA NUEVA PERSPECTIVA
          </div>
          <h1>
            LANZAMIENTO
            <br />
            <span>CONSEVIA</span>
          </h1>
          <p className="subtitle">
            Una nueva perspectiva en la evaluación integral de la fertilidad y
            la salud reproductiva
          </p>
          <figure className="campaign-artwork">
            <img
              src="/consevia-presentacion.png"
              alt="CONSEVIA. Tu camino, nuestra ciencia. Presentación de los paneles de fertilidad femenina: reserva ovárica, eje hormonal, ovulación y ciclo, tiroides y metabolismo."
              width="1536"
              height="1024"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
          <div className="intro-line" />
          <p className="invitation">
            Te invitamos a formar parte del lanzamiento de CONSEVIA. Completa
            tus datos para registrar tu participación en este evento.
          </p>
          <div className="intro-note">
            <span className="note-icon">↗</span>
            <p>
              Un encuentro para profesionales
              <br />
              de la salud.
            </p>
          </div>
        </aside>
        <section className="form-card" aria-label="Inscripción al evento">
          {success ? (
            <div className="success" tabIndex={-1} ref={successBox}>
              <div className="success-check">✓</div>
              <span className="eyebrow">REGISTRO CONFIRMADO</span>
              <h2>¡Inscripción realizada con éxito!</h2>
              <p>Gracias por registrarte al lanzamiento de CONSEVIA.</p>
              <p>Tu información ha sido registrada correctamente.</p>
              <strong>¡Te esperamos!</strong>
              <small>
                Identificador de inscripción
                <br />
                {id.current}
              </small>
            </div>
          ) : (
            <>
              <div className="card-heading">
                <span className="eyebrow">REGISTRO AL EVENTO</span>
                <h2>Reserva tu participación</h2>
                <p>
                  Completa el formulario. Los campos con{" "}
                  <span className="required">*</span> son obligatorios.
                </p>
              </div>
              <form noValidate ref={form} onSubmit={submit}>
                <fieldset disabled={busy}>
                  <legend>
                    <span>01</span>Datos del participante
                  </legend>
                  <div className="fields">
                    <div className="full">
                      {field("name", "Nombres y apellidos", true)}
                    </div>
                    {field("profession", "Profesión", true, professions)}
                    {field("specialty", "Especialidad")}
                    {data.profession === "Otro" && (
                      <div className="full">
                        {field(
                          "otherProfession",
                          "Especifica tu profesión",
                          true,
                        )}
                      </div>
                    )}
                    {field(
                      "phone",
                      "Celular / WhatsApp",
                      true,
                      undefined,
                      "tel",
                      "9 dígitos. Puedes incluir el prefijo +51.",
                    )}
                    {field(
                      "email",
                      "Correo electrónico",
                      true,
                      undefined,
                      "email",
                    )}
                    <div className="full">
                      {field("license", "Número de colegiatura")}
                    </div>
                  </div>
                </fieldset>
                <fieldset disabled={busy} className="work-section">
                  <legend>
                    <span>02</span>Consultorio o establecimiento
                  </legend>
                  <div className="field">
                    <span className="question" id="attends-label">
                      ¿Actualmente atiende pacientes?{" "}
                      <span className="required">*</span>
                    </span>
                    <div
                      className="radio-group"
                      role="radiogroup"
                      aria-labelledby="attends-label"
                      id="attends"
                      tabIndex={-1}
                    >
                      {["Sí", "No"].map((value) => (
                        <label
                          className={
                            "radio-option " +
                            (data.attends === value ? "selected" : "")
                          }
                          key={value}
                        >
                          <input
                            type="radio"
                            name="attends"
                            value={value}
                            checked={data.attends === value}
                            onChange={() => update("attends", value)}
                            required
                          />
                          {value}
                        </label>
                      ))}
                    </div>
                    {errors.attends && (
                      <small className="error">{errors.attends}</small>
                    )}
                  </div>
                  {data.attends === "Sí" && (
                    <div className="fields conditional">
                      <div className="full">
                        {field(
                          "establishment",
                          "Nombre del consultorio o establecimiento",
                          true,
                        )}
                      </div>
                      <div className="full">
                        {field(
                          "establishmentType",
                          "Tipo de establecimiento",
                          true,
                          establishments,
                        )}
                      </div>
                      <div className="full">
                        {field("address", "Dirección del establecimiento")}
                      </div>
                      <div className="field full">
                        <label htmlFor="district">
                          Distrito <span className="required">*</span>
                        </label>
                        <select
                          id="district"
                          value={data.district || ""}
                          onChange={(e) => update("district", e.target.value)}
                          required
                          aria-invalid={!!errors.district}
                        >
                          <option value="">Selecciona un distrito</option>
                          <optgroup label="Lima Metropolitana">
                            {lima.map((d) => (
                              <option key={d}>{d}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Callao">
                            {callao.map((d) => (
                              <option key={d}>{d}</option>
                            ))}
                          </optgroup>
                          <option>Otra localidad</option>
                        </select>
                        {errors.district && (
                          <small className="error">{errors.district}</small>
                        )}
                      </div>
                      {data.district === "Otra localidad" && (
                        <div className="full">
                          {field(
                            "otherLocation",
                            "Especifica la localidad",
                            true,
                          )}
                        </div>
                      )}
                      <div className="full">
                        {field("reference", "Referencia de ubicación")}
                      </div>
                    </div>
                  )}
                </fieldset>
                <div className="consent-block">
                  <label className="consent-label">
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        setErrors((old) => ({ ...old, consent: "" }));
                      }}
                      disabled={busy}
                      aria-invalid={!!errors.consent}
                    />{" "}
                    <span>
                      He leído y acepto la política de privacidad y autorizo el
                      tratamiento de mis datos personales para gestionar mi
                      inscripción al evento.
                    </span>
                  </label>
                  {config?.privacyUrl ? (
                    <a
                      className="privacy-link"
                      href={config.privacyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Leer política de privacidad ↗
                    </a>
                  ) : (
                    <span className="privacy-pending">
                      Política de privacidad pendiente de publicación.
                    </span>
                  )}
                  {errors.consent && (
                    <small className="error">{errors.consent}</small>
                  )}
                </div>
                <div className="trap" aria-hidden="true">
                  <label>
                    Sitio web
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                {message && (
                  <div className="alert" role="alert">
                    {message}
                  </div>
                )}
                {config && !config.ready && (
                  <p className="setup-note" role="status">
                    {config.message}
                  </p>
                )}
                <button
                  className="submit"
                  type="submit"
                  disabled={busy || !config?.ready}
                >
                  {busy ? "GUARDANDO INSCRIPCIÓN…" : "CONFIRMAR INSCRIPCIÓN"}
                  {busy ? <span className="spinner" /> : <Arrow />}
                </button>
                <p className="secure">
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M4 7V5a4 4 0 0 1 8 0v2M3 7h10v7H3z"
                      fill="none"
                      stroke="currentColor"
                    />
                  </svg>
                  Tus datos se utilizarán para gestionar este evento.
                </p>
              </form>
            </>
          )}
        </section>
      </main>
      <footer>
        <span>CONSEVIA</span>
        <p>Una nueva perspectiva en salud reproductiva.</p>
        <span>EVENTO DE LANZAMIENTO</span>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
