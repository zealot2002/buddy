import { cn } from '@/lib/utils';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  /** 是否预留底部导航栏空间 */
  withBottomNav?: boolean;
}

export const PageShell = ({
  children,
  className,
  withBottomNav = true,
}: PageShellProps) => (
  <div
    className={cn(
      'min-h-screen bg-deep-navy',
      withBottomNav ? 'pb-nav' : 'pb-safe',
      className,
    )}
  >
    {children}
  </div>
);

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  withHeader?: boolean;
}

export const PageContent = ({
  children,
  className,
  withHeader = true,
}: PageContentProps) => (
  <main
    className={cn(
      'px-4',
      withHeader ? 'pt-header' : 'pt-safe',
      className,
    )}
  >
    {children}
  </main>
);
