import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

type Entry = Record<"value" | "label", string>;

interface MultiSelectProps {
  entries: Entry[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const MultiSelect: React.FC<MultiSelectProps> = ({ entries, selected, onChange, placeholder, className, disabled = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleUnselect = (entry: string) => {
    onChange(selected.filter(item => item !== entry));
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "") {
          handleUnselect(selected[selected.length - 1])
        }
      }
      if (e.key === "Escape") {
        input.blur();
      }
    }
  }

  const selectables = entries.filter(entry => !selected.includes(entry.value));

  return (
    <Command onKeyDown={handleKeyDown} className={twMerge(clsx("overflow-visible bg-transparent flex", disabled && "opacity-50"), className)}>
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((entry) => {
            return (
              <Badge key={entry} variant="secondary">
                {entries.find(item => item.value === entry)?.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(entry);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(entry)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      {open && selectables.length > 0 ? (
        <div className="relative">
          <div className="absolute w-full z-10 top-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="max-h-96 overflow-auto">
              {selectables.map((entry) => {
                return (
                  <CommandItem
                    key={entry.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      setInputValue("")
                      onChange([...selected, entry.value]);
                    }}
                    className={"cursor-pointer"}
                  >
                    {entry.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        </div>
      ) : null}
    </Command>
  )
}

export default MultiSelect
