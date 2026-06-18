"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  tiposProyecto,
  type ContactInput,
} from "@/lib/contact-schema";
import { submitContact } from "@/app/actions/contact";
import { Button, Text } from "@/components/ui";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: ContactInput) => {
    setStatus("submitting");
    const result = await submitContact(data);
    if (result.ok) {
      setStatus("success");
      reset();
    } else {
      setStatus("error");
    }
  };

  if (status === "success") {
    return <SuccessPanel onReset={() => setStatus("idle")} />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8"
      aria-busy={status === "submitting"}
    >
      <Field
        id="nombre"
        label="Nombre"
        error={errors.nombre?.message}
        className="sm:col-span-1"
      >
        <input
          id="nombre"
          type="text"
          autoComplete="name"
          {...register("nombre")}
          className={inputClasses(!!errors.nombre)}
          placeholder="María"
        />
      </Field>

      <Field
        id="email"
        label="Email"
        error={errors.email?.message}
        className="sm:col-span-1"
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          className={inputClasses(!!errors.email)}
          placeholder="vos@ejemplo.com"
        />
      </Field>

      <Field
        id="whatsapp"
        label="WhatsApp (opcional)"
        hint="Solo si preferís que te escriba por ahí."
        error={errors.whatsapp?.message}
        className="sm:col-span-1"
      >
        <input
          id="whatsapp"
          type="tel"
          autoComplete="tel"
          {...register("whatsapp")}
          className={inputClasses(!!errors.whatsapp)}
          placeholder="+57 300 000 0000"
        />
      </Field>

      <Field
        id="tipoProyecto"
        label="Tipo de proyecto"
        error={errors.tipoProyecto?.message}
        className="sm:col-span-1"
      >
        <select
          id="tipoProyecto"
          {...register("tipoProyecto")}
          defaultValue=""
          className={inputClasses(!!errors.tipoProyecto)}
        >
          <option value="" disabled>
            Elegí una opción
          </option>
          {tiposProyecto.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        id="mensaje"
        label="¿Qué necesitás?"
        hint="Contame brevemente qué tenés en mente, para quién y por qué."
        error={errors.mensaje?.message}
        className="sm:col-span-2"
      >
        <textarea
          id="mensaje"
          rows={5}
          {...register("mensaje")}
          className={cn(inputClasses(!!errors.mensaje), "resize-y min-h-32")}
          placeholder="Quiero una landing para mi marca de joyas dentales…"
        />
      </Field>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        {...register("honeypot")}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Enviando…" : "Enviar consulta"}
        </Button>
        <Text size="sm" tone="subtle" className="max-w-sm">
          Te respondo en 24h hábiles. Sin filtros de agencia, sin formularios
          que no leés.
        </Text>
      </div>

      {status === "error" && (
        <div
          role="alert"
          className="sm:col-span-2 border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] px-4 py-3 rounded-sm"
        >
          <Text size="sm">
            Algo falló al enviar. Probá de nuevo o escribime directo por
            WhatsApp.
          </Text>
        </div>
      )}
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="text-sm uppercase tracking-[0.18em] text-subtle"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-sm text-subtle">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-[color:oklch(72%_0.18_25)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClasses(hasError: boolean) {
  return cn(
    "w-full bg-transparent border-b px-0 py-3 text-foreground text-lg",
    "placeholder:text-subtle",
    "focus:outline-none transition-colors",
    hasError
      ? "border-[color:oklch(72%_0.18_25)]"
      : "border-[color:var(--color-border-strong)] focus:border-[color:var(--color-fg-muted)]",
  );
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  return (
    <div
      role="status"
      className="border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] p-10 rounded-sm"
    >
      <p className="font-serif text-3xl text-foreground">
        Recibido. Gracias.
      </p>
      <Text size="lg" tone="muted" className="mt-4 max-w-md">
        Te respondo en menos de 24h hábiles desde addelcv@gmail.com. Si es
        urgente, también podés escribirme por WhatsApp.
      </Text>
      <button
        type="button"
        onClick={onReset}
        className="mt-8 text-sm text-subtle underline underline-offset-4 hover:text-foreground"
      >
        Enviar otra consulta
      </button>
    </div>
  );
}
