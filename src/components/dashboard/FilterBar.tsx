import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, RefreshCw, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const REGIONS = [
  'All Regions',
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Global',
];

const DEPARTMENTS = [
  'All Departments',
  'Accounts Payable',
  'Accounts Receivable',
  'General Ledger',
  'Treasury',
  'Tax',
  'Reporting',
];

interface FilterBarProps {
  dateFrom: Date;
  dateTo: Date;
  selectedRegions: string[];
  selectedDepartments: string[];
  onDateFromChange: (date: Date) => void;
  onDateToChange: (date: Date) => void;
  onRegionsChange: (regions: string[]) => void;
  onDepartmentsChange: (departments: string[]) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const MultiSelect = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    if (value === options[0]) {
      onChange([options[0]]);
    } else {
      const newSelected = selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected.filter((s) => s !== options[0]), value];
      onChange(newSelected.length === 0 ? [options[0]] : newSelected);
    }
  };

  const displayText = selected.includes(options[0])
    ? options[0]
    : selected.length === 1
    ? selected[0]
    : `${selected.length} selected`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-[200px] justify-between text-left font-normal bg-card focus-ring"
          role="combobox"
          aria-expanded={open}
          aria-label={`Select ${label.toLowerCase()}`}
          aria-haspopup="listbox"
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[200px] p-0 bg-card border border-border shadow-lg z-50" 
        align="start"
        role="listbox"
        aria-label={`${label} options`}
      >
        <div className="max-h-[300px] overflow-auto">
          {options.map((option, index) => (
            <div
              key={option}
              className={cn(
                'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted transition-colors focus-ring',
                selected.includes(option) && 'bg-primary/10'
              )}
              onClick={() => handleToggle(option)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggle(option);
                }
              }}
              role="option"
              aria-selected={selected.includes(option)}
              tabIndex={0}
            >
              <div
                className={cn(
                  'w-4 h-4 border rounded flex items-center justify-center transition-colors',
                  selected.includes(option)
                    ? 'bg-primary border-primary'
                    : 'border-input'
                )}
                aria-hidden="true"
              >
                {selected.includes(option) && (
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm text-foreground">{option}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const FilterBar = ({
  dateFrom,
  dateTo,
  selectedRegions,
  selectedDepartments,
  onDateFromChange,
  onDateToChange,
  onRegionsChange,
  onDepartmentsChange,
  onRefresh,
  isLoading,
}: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div 
      className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm transition-all duration-300"
      role="region"
      aria-label="Dashboard filters"
    >
      {/* Mobile Collapse Toggle */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="md:hidden">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between mb-2 focus-ring"
            aria-expanded={isExpanded}
            aria-controls="filter-content"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" aria-hidden="true" />
              Filters
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent id="filter-content" className="animate-fade-in">
          <FilterContent
            dateFrom={dateFrom}
            dateTo={dateTo}
            selectedRegions={selectedRegions}
            selectedDepartments={selectedDepartments}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onRegionsChange={onRegionsChange}
            onDepartmentsChange={onDepartmentsChange}
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Desktop Always Visible */}
      <div className="hidden md:block">
        <FilterContent
          dateFrom={dateFrom}
          dateTo={dateTo}
          selectedRegions={selectedRegions}
          selectedDepartments={selectedDepartments}
          onDateFromChange={onDateFromChange}
          onDateToChange={onDateToChange}
          onRegionsChange={onRegionsChange}
          onDepartmentsChange={onDepartmentsChange}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

const FilterContent = ({
  dateFrom,
  dateTo,
  selectedRegions,
  selectedDepartments,
  onDateFromChange,
  onDateToChange,
  onRegionsChange,
  onDepartmentsChange,
  onRefresh,
  isLoading,
}: Omit<FilterBarProps, never>) => (
  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
    {/* Date Range */}
    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
      <div className="flex items-center gap-2">
        <label htmlFor="date-from" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          From:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date-from"
              variant="outline"
              className="w-full sm:w-[160px] justify-start text-left font-normal bg-card focus-ring"
              aria-label={`Start date: ${format(dateFrom, 'MMMM dd, yyyy')}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              {format(dateFrom, 'MMM dd, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border border-border shadow-lg z-50" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(date) => date && onDateFromChange(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="date-to" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          To:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date-to"
              variant="outline"
              className="w-full sm:w-[160px] justify-start text-left font-normal bg-card focus-ring"
              aria-label={`End date: ${format(dateTo, 'MMMM dd, yyyy')}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
              {format(dateTo, 'MMM dd, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border border-border shadow-lg z-50" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(date) => date && onDateToChange(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>

    {/* Divider */}
    <div className="hidden lg:block w-px h-8 bg-border" aria-hidden="true" />

    {/* Region Filter */}
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Region:</label>
      <MultiSelect
        label="Region"
        options={REGIONS}
        selected={selectedRegions}
        onChange={onRegionsChange}
      />
    </div>

    {/* Department Filter */}
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Department:</label>
      <MultiSelect
        label="Department"
        options={DEPARTMENTS}
        selected={selectedDepartments}
        onChange={onDepartmentsChange}
      />
    </div>

    {/* Refresh Button */}
    <div className="ml-auto">
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        className="gap-2 focus-ring"
        aria-label={isLoading ? 'Refreshing data...' : 'Refresh dashboard data'}
      >
        <RefreshCw 
          className={cn('w-4 h-4', isLoading && 'animate-spin')} 
          aria-hidden="true" 
        />
        <span className="sr-only sm:not-sr-only">Refresh</span>
      </Button>
    </div>
  </div>
);

export default FilterBar;
