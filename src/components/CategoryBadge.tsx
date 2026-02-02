import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { VehicleCategory } from '@/types';
import { categoryDescriptions } from '@/data/mockData';
import { HelpCircle } from 'lucide-react';

interface CategoryBadgeProps {
  category: VehicleCategory;
  showTooltip?: boolean;
}

const categoryColors: Record<VehicleCategory, string> = {
  A: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  B: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  C: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
  D: 'bg-gray-900 text-white border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
  EV: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
};

export function CategoryBadge({ category, showTooltip = true }: CategoryBadgeProps) {
  const badge = (
    <Badge variant="outline" className={`font-bold ${categoryColors[category]}`}>
      {category}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {badge}
          <HelpCircle className="h-3 w-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{categoryDescriptions[category]}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-sm">
      {Object.entries(categoryDescriptions).map(([cat, desc]) => (
        <div key={cat} className="flex items-center gap-1">
          <CategoryBadge category={cat as VehicleCategory} showTooltip={false} />
          <span className="text-muted-foreground">= {desc}</span>
        </div>
      ))}
    </div>
  );
}
