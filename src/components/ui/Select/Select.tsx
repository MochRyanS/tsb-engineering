import React, { type SelectHTMLAttributes } from "react";
import styles from "../field.module.css";

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: Option[];
    error?: string;
    required?: boolean;
    hint?: string;
    placeholder?: string;
    id?: string;
}

export default function Select({ label, options, error, required, hint, placeholder, id, ...rest }: SelectProps) {
    const fieldId = id ?? `sel-${label.replace(/\s+/g, "-").toLowerCase()}`;

    return React.createElement(
        "div",
        { className: styles.field },
        React.createElement(
            "label",
            { className: styles.label, htmlFor: fieldId },
            label,
            required && React.createElement("span", { className: styles.req }, "*")
        ),
        React.createElement(
            "select",
            { id: fieldId, className: error ? styles.inputError : styles.select, "aria-invalid": !!error, ...rest },
            placeholder && React.createElement("option", { value: "" }, placeholder),
            ...options.map((o) =>
                React.createElement("option", { key: o.value, value: o.value }, o.label)
            )
        ),
        hint && !error && React.createElement("span", { className: styles.hint }, hint),
        error && React.createElement("span", { className: styles.error, role: "alert" }, error)
    );
}