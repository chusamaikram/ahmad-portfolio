"use client";

import React from "react";

type BaseProps = {
  label: string;
  required?: boolean;
  className?: string;
  error?: string;
};

type InputProps = BaseProps & {
  as?: "input";
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

type TextareaProps = BaseProps & {
  as: "textarea";
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (value: string) => void;
};

type SelectProps = BaseProps & {
  as: "select";
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
};

type Props = InputProps | TextareaProps | SelectProps;

const baseClass =
  "w-full bg-white dark:bg-gray-950 border rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 transition-all";

function fieldClass(error?: string) {
  return `${baseClass} ${
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
      : "border-gray-300 dark:border-gray-700 focus:border-violet-500 focus:ring-violet-500/30"
  }`;
}

export default function FormField(props: Props) {
  const { label, required, className = "", error } = props;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>

      {(!props.as || props.as === "input") && (
        <input
          type={(props as InputProps).type ?? "text"}
          placeholder={(props as InputProps).placeholder}
          value={(props as InputProps).value}
          onChange={(e) => (props as InputProps).onChange(e.target.value)}
          className={fieldClass(error)}
        />
      )}

      {props.as === "textarea" && (
        <textarea
          placeholder={(props as TextareaProps).placeholder}
          rows={(props as TextareaProps).rows ?? 4}
          value={(props as TextareaProps).value}
          onChange={(e) => (props as TextareaProps).onChange(e.target.value)}
          className={`${fieldClass(error)} resize-none`}
        />
      )}

      {props.as === "select" && (
        <select
          value={(props as SelectProps).value}
          onChange={(e) => (props as SelectProps).onChange(e.target.value)}
          className={`${fieldClass(error)} text-gray-300`}
        >
          {(props as SelectProps).options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}
