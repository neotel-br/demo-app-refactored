"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      style={
        {
          "--normal-bg":      "#0D111A",
          "--normal-text":    "rgba(255,255,255,0.85)",
          "--normal-border":  "rgba(255,255,255,0.09)",
          "--success-bg":     "#0D111A",
          "--success-text":   "#fff",
          "--success-border": "rgba(26,198,71,0.28)",
          "--error-bg":       "#0D111A",
          "--error-text":     "#fff",
          "--error-border":   "rgba(248,113,113,0.28)",
          "--warning-bg":     "#0D111A",
          "--warning-text":   "#fff",
          "--warning-border": "rgba(251,191,36,0.28)",
          "--info-bg":        "#0D111A",
          "--info-text":      "#fff",
          "--info-border":    "rgba(96,165,250,0.28)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.8125rem",
          fontWeight: "400",
          borderRadius: "8px",
          backdropFilter: "blur(8px)",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
