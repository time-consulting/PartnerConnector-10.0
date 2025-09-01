import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  iconBg: string;
  iconColor: string;
  trendColor: string;
  testId: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  iconBg,
  iconColor,
  trendColor,
  testId,
}: StatsCardProps) {
  return (
    <Card className="shadow-sm" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-3xl font-bold text-foreground" data-testid={`${testId}-value`}>
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`${iconColor} w-6 h-6`} />
          </div>
        </div>
        <p className={`${trendColor} text-sm mt-2`} data-testid={`${testId}-trend`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
