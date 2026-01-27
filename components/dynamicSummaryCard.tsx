import { Calendar, CreditCard, Wallet, Users, TrendingUp, ShoppingCart, CheckCircle, Clock, AlertCircle, Download, LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CountAnimation from "@/components/ui/custom/count-animation";

// EXPORT these types so other files can use them
export type IconName = "calendar" | "users" | "creditCard" | "wallet" | "trendingUp" | "shoppingCart" | "checkCircle" | "clock" | "alertCircle" | "download";

export type BgColorName = "indigo" | "green" | "purple" | "orange" | "blue" | "red" | "pink" | "yellow";

export interface SummaryCardData {
  title: string;
  value: number;
  changeValue: number;
  icon: IconName;
  bgColor: BgColorName;
  prefix?: string;
  suffix?: string;
  changeLabel?: string;
}

interface SummaryCardsProps {
  cards: SummaryCardData[];
}

// Icon mapping object - ADD the new icons here
const iconMap: Record<IconName, LucideIcon> = {
  calendar: Calendar,
  users: Users,
  creditCard: CreditCard,
  wallet: Wallet,
  trendingUp: TrendingUp,
  shoppingCart: ShoppingCart,
  checkCircle: CheckCircle,
  clock: Clock,
  alertCircle: AlertCircle,
  download: Download,
};


// Background color mapping
const bgColorMap: Record<BgColorName, string> = {
  indigo: "bg-indigo-200 dark:bg-indigo-950",
  green: "bg-green-200 dark:bg-green-950",
  purple: "bg-purple-200 dark:bg-purple-950",
  orange: "bg-orange-200 dark:bg-orange-950",
  blue: "bg-blue-200 dark:bg-blue-950",
  red: "bg-red-200 dark:bg-red-950",
  pink: "bg-pink-200 dark:bg-pink-950",
  yellow: "bg-yellow-200 dark:bg-yellow-950",
};

export default function DynamicSummaryCards({ cards }: SummaryCardsProps) {

  return (
    <div className="rounded-md border bg-border overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-px bg-border">
        {cards.map((card: SummaryCardData, index: number) => {
          const Icon = iconMap[card.icon] || Calendar;
          const bgColor = bgColorMap[card.bgColor] || "bg-gray-200 dark:bg-gray-950";
          const changeColor = card.changeValue >= 0 ? "text-green-600" : "text-red-600";
          const changeSign = card.changeValue >= 0 ? "+" : "";

          return (
            <div key={index} className="bg-card w-full flex flex-col justify-between p-2 lg:p-4">
              <div className="flex items-center justify-between ">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{card.title}</span>
                <div className={`p-1.5 rounded-full ${bgColor} bg-opacity-50`}>
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                </div>
              </div>

              <div>
                <div className="text-xl font-bold font-display tracking-tight">
                  {card.prefix || ""}
                  <CountAnimation number={card.value} />
                  {card.suffix || ""}
                </div>

                <div className="flex items-center mt-1 space-x-1">
                  <span className={`text-[10px] font-medium ${changeColor} flex items-center`}>
                    {changeSign}{card.changeValue}%
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {card.changeLabel || "vs last month"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 