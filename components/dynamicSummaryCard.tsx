  import { Calendar, CreditCard, DollarSign, Users, TrendingUp, ShoppingCart, CheckCircle, Clock, AlertCircle, Download, LucideIcon } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import CountAnimation from "@/components/ui/custom/count-animation";

  // EXPORT these types so other files can use them
  export type IconName = "calendar" | "users" | "creditCard" | "dollarSign" | "trendingUp" | "shoppingCart" | "checkCircle" | "clock" | "alertCircle" | "download";

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
    dollarSign: DollarSign,
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
      <div className="overflow-hidden rounded-md border">
        <div className="grid divide-y-1! md:grid-cols-2 md:divide-x-1! lg:grid-cols-4 lg:divide-y-0! [&>*:nth-child(2)]:border-e-0! md:[&>*:nth-child(2)]:border-e-0! lg:[&>*:nth-child(2)]:border-e-1!">
          {cards.map((card: SummaryCardData, index: number) => {
            const Icon = iconMap[card.icon] || Calendar;
            const bgColor = bgColorMap[card.bgColor] || "bg-gray-200 dark:bg-gray-950";
            const changeColor = card.changeValue >= 0 ? "text-green-600" : "text-red-600";
            const changeSign = card.changeValue >= 0 ? "+" : "";

            return (
              <Card key={index} className="hover:bg-muted rounded-none border-0 transition-colors">
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0">
                  <CardTitle>{card.title}</CardTitle>
                  <div className={`absolute end-4 top-0 flex size-12 items-center justify-center rounded-full p-4 ${bgColor}`}>
                    <Icon className="size-5" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="font-display text-3xl">
                    {card.prefix || ""}
                    <CountAnimation number={card.value} />
                    {card.suffix || ""}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    <span className={changeColor}>
                      {changeSign}{card.changeValue}%
                    </span>{" "}
                    {card.changeLabel || "from last month"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  } 