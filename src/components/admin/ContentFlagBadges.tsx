import { Badge } from '@/components/ui/badge';
import { getContentFlagLabel } from '@/lib/helpers/contentAnalysis';
import { AlertTriangle, Shield, Info, TrendingDown, User, Megaphone, Ban } from 'lucide-react';

interface ContentFlagBadgesProps {
  flags: string[];
  className?: string;
}

const FLAG_ICONS: Record<string, React.ReactNode> = {
  forbidden_topic: <Ban className="h-3 w-3" />,
  copyright_concern: <Shield className="h-3 w-3" />,
  misinformation: <AlertTriangle className="h-3 w-3" />,
  low_quality: <TrendingDown className="h-3 w-3" />,
  pii_exposure: <User className="h-3 w-3" />,
  promotional: <Megaphone className="h-3 w-3" />,
  adult_content: <Info className="h-3 w-3" />,
};

const FLAG_VARIANTS: Record<string, 'destructive' | 'secondary' | 'outline' | 'default'> = {
  forbidden_topic: 'destructive',
  copyright_concern: 'destructive',
  misinformation: 'destructive',
  low_quality: 'secondary',
  pii_exposure: 'destructive',
  promotional: 'secondary',
  adult_content: 'destructive',
};

export function ContentFlagBadges({ flags, className }: ContentFlagBadgesProps) {
  if (!flags || flags.length === 0) {
    return (
      <Badge variant="outline" className={className}>
        لا توجد علامات
      </Badge>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {flags.map((flag) => (
        <Badge
          key={flag}
          variant={FLAG_VARIANTS[flag] || 'default'}
          className="flex items-center gap-1"
        >
          {FLAG_ICONS[flag]}
          <span>{getContentFlagLabel(flag, 'ar')}</span>
        </Badge>
      ))}
    </div>
  );
}
