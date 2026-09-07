import {
  Croissant,
  Wheat,
  Drumstick,
  Bean,
  Milk,
  Apple,
  Salad,
  Nut,
  Droplet,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Panificados: Croissant,
  Cereales: Wheat,
  Proteínas: Drumstick,
  Legumbres: Bean,
  Lácteos: Milk,
  Frutas: Apple,
  Verduras: Salad,
  Snacks: Nut,
  Grasas: Droplet,
};

export function FoodIcon({
  category,
  className = "h-4 w-4",
}: {
  category: string;
  className?: string;
}) {
  const Icon = ICONS[category] ?? UtensilsCrossed;
  return <Icon aria-hidden className={`${className} shrink-0`} />;
}
