"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

interface PresetTabsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PresetTabs({ value, onChange }: PresetTabsProps) {
  return (
    <div className="mt-4">
      <Tabs defaultValue={value} onValueChange={onChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preset1">PRESET 1</TabsTrigger>
          <TabsTrigger value="preset2">PRESET 2</TabsTrigger>
          <TabsTrigger value="preset3">PRESET 3</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
