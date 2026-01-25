"use client";

import { useState } from "react";
import { Eye, EyeOff, Phone, Globe, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showToggle?: boolean;
}

/**
 * Password Input with eye icon toggle
 */
export const PasswordInput = ({
  showToggle = true,
  className,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};

interface PhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Phone Input with icon
 */
export const PhoneInput = ({ className, ...props }: PhoneInputProps) => {
  return (
    <div className="relative">
      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="tel"
        placeholder="+91 98765 43210"
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  );
};

interface WebsiteInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Website Input with icon
 */
export const WebsiteInput = ({ className, ...props }: WebsiteInputProps) => {
  return (
    <div className="relative">
      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="url"
        placeholder="https://example.com"
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  );
};

interface TimezoneSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/**
 * Timezone Select with Indian default
 */
export const TimezoneSelect = ({
  value,
  onValueChange,
  className,
}: TimezoneSelectProps) => {
  const timezones = [
    { value: "IST (Asia/Kolkata)", label: "IST (India)" },
    { value: "UTC", label: "UTC" },
    { value: "EST", label: "EST (US East)" },
    { value: "CST", label: "CST (US Central)" },
    { value: "MST", label: "MST (US Mountain)" },
    { value: "PST", label: "PST (US Pacific)" },
    { value: "GMT", label: "GMT (London)" },
    { value: "CET", label: "CET (Europe)" },
    { value: "GST", label: "GST (Dubai)" },
    { value: "JST", label: "JST (Japan)" },
    { value: "SGT", label: "SGT (Singapore)" },
    { value: "AEDT", label: "AEDT (Sydney)" },
  ];

  return (
    <div className="relative">
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("pl-10", className)}>
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

/**
 * Currency Select with INR default (Indian market focus)
 */
export const CurrencySelect = ({
  value,
  onValueChange,
  className,
}: CurrencySelectProps) => {
  const currencies = [
    { value: "INR", label: "INR (₹)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "AUD", label: "AUD ($)" },
    { value: "CAD", label: "CAD ($)" },
    { value: "JPY", label: "JPY (¥)" },
    { value: "SGD", label: "SGD (S$)" },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.value} value={curr.value}>
            {curr.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
