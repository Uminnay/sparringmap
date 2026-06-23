"use client";

import { useState } from "react";

import { Sidebar } from "@/components/app-shell/Sidebar";
import { TopBar } from "@/components/app-shell/TopBar";
import { CanvasPlaceholder } from "@/components/canvas/CanvasPlaceholder";
import { IdeaForm, type IdeaFormValues } from "@/components/idea/IdeaForm";
import { InspectorPanel } from "@/components/inspector/InspectorPanel";
import { cn } from "@/lib/utils";

type ThemeMode = "dark" | "light";

export function AppShell() {
  const [draft, setDraft] = useState<IdeaFormValues>({
    rawInput: "",
    type: "app_product",
  });
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);

  const appGrid = cn(
    "grid min-h-screen grid-cols-1 transition-[grid-template-columns] duration-300",
    "lg:grid-cols-[260px_minmax(720px,1fr)_320px]",
    !isSidebarOpen &&
      isInspectorOpen &&
      "lg:grid-cols-[56px_minmax(0,1fr)_320px]",
    isSidebarOpen &&
      !isInspectorOpen &&
      "lg:grid-cols-[260px_minmax(0,1fr)_56px]",
    !isSidebarOpen &&
      !isInspectorOpen &&
      "lg:grid-cols-[56px_minmax(0,1fr)_56px]"
  );

  return (
    <main
      className={cn(
        "min-h-screen bg-background text-foreground antialiased",
        theme === "dark" && "dark"
      )}
    >
      <div className={appGrid}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((value) => !value)}
        />
        <section className="flex min-w-0 flex-col border-y bg-canvas lg:min-h-screen lg:border-x lg:border-y-0">
          <TopBar
            onToggleTheme={() =>
              setTheme((value) => (value === "dark" ? "light" : "dark"))
            }
            projectType={draft.type}
            theme={theme}
          />
          <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(460px,1fr)] gap-4 p-3 md:gap-5 md:p-5">
            <IdeaForm initialValues={draft} onChange={setDraft} />
            <CanvasPlaceholder
              hasDraft={draft.rawInput.trim().length > 0}
              projectType={draft.type}
            />
          </div>
        </section>
        <InspectorPanel
          draft={draft}
          isOpen={isInspectorOpen}
          onToggle={() => setIsInspectorOpen((value) => !value)}
        />
      </div>
    </main>
  );
}
