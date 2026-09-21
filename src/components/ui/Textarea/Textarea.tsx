import * as React from "react";
import type { TextareaHTMLAttributes } from "react";
import styles from "../field.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    id?: string;
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    max?: number;
    value?: string | number | readonly string[];
}

export default function Textarea({ label, error, required, hint, max, id, value, ...rest }: TextareaProps) {
    const fieldId = id ?? `ta-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const len = typeof value === "string" ? value.length : 0;

    return React.createElement(
        "div",
        { className: styles.field },
        React.createElement(
            "div",
            { className: styles.labelRow },
            React.createElement(
                "label",
                { className: styles.label, htmlFor: fieldId },
                label,
                required && React.createElement("span", { className: styles.req }, "*"),
            ),
            max && React.createElement("span", { className: styles.counter }, `${len}/${max}`),
        ),
        React.createElement("textarea", {
            id: fieldId,
            className: error ? styles.inputError : styles.textarea,
            value,
            maxLength: max,
            "aria-invalid": !!error,
            ...rest,
        }),
        hint && !error && React.createElement("span", { className: styles.hint }, hint),
        error && React.createElement("span", { className: styles.error, role: "alert" }, error),
    );
}