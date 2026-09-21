import React, { type InputHTMLAttributes } from "react";
import styles from "../field.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export default function Input({ label, error, required, hint, id, ...rest }: InputProps) {
  const fieldId = id ?? `in-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return React.createElement(
    "div",
    { className: styles.field },
    React.createElement(
      "label",
      { className: styles.label, htmlFor: fieldId },
      label,
      required && React.createElement("span", { className: styles.req }, "*")
    ),
    React.createElement("input", {
      id: fieldId,
      className: error ? styles.inputError : styles.input,
      "aria-invalid": !!error,
      ...rest,
    }),
    hint && !error && React.createElement("span", { className: styles.hint }, hint),
    error && React.createElement("span", { className: styles.error, role: "alert" }, error)
  );
}