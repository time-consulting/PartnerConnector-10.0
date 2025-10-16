import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BusinessNameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (businessName: string) => void;
  placeholder?: string;
  "data-testid"?: string;
}

export default function BusinessNameAutocomplete({ 
  value, 
  onChange, 
  onSelect,
  placeholder = "Type business name...",
  "data-testid": testId = "autocomplete-business-name"
}: BusinessNameAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [businesses, setBusinesses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch business names from the pipeline when user types
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (searchQuery.length < 2) {
        setBusinesses([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/businesses/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setBusinesses(data);
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchBusinesses, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setSearchQuery(selectedValue);
    if (onSelect) {
      onSelect(selectedValue);
    }
    setOpen(false);
  };

  const handleAddNew = () => {
    onChange(searchQuery);
    if (onSelect) {
      onSelect(searchQuery);
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.length > 0) {
      e.preventDefault();
      handleAddNew();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11"
          data-testid={testId}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyDown={handleKeyDown}
            data-testid="input-business-search"
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <div className="py-2 px-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      No existing businesses found
                    </p>
                    {searchQuery.length > 0 && (
                      <Button
                        onClick={handleAddNew}
                        variant="outline"
                        size="sm"
                        className="w-full"
                        data-testid="button-add-new-business"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add "{searchQuery}"
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
                {businesses.length > 0 && (
                  <CommandGroup heading="Existing Businesses">
                    {businesses.map((business) => (
                      <CommandItem
                        key={business}
                        value={business}
                        onSelect={() => handleSelect(business)}
                        data-testid={`item-business-${business}`}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === business ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {business}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {searchQuery.length > 0 && businesses.length > 0 && (
                  <>
                    <CommandGroup heading="Add New">
                      <CommandItem
                        value={searchQuery}
                        onSelect={handleAddNew}
                        data-testid="button-add-new-business-group"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add "{searchQuery}"
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
