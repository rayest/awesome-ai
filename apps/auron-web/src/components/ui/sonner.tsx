"use client";

import React from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

/**
 * 项目级 toast 包装
 * 在 root layout 渲染一次，所有页面即可用 toast() / toast.success() 等
 */
export function Toaster(props: ToasterProps) {
  return <SonnerToaster {...props} />;
}
