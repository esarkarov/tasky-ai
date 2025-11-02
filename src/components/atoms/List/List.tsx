import { CSSProperties, memo, PropsWithChildren } from 'react';

interface NavListProps extends PropsWithChildren {
  index: number;
}

interface ItemListProps extends PropsWithChildren {
  getClassName: (index: number) => string;
  getStyle: (index: number) => CSSProperties;
  index: number;
}

export const NavList: React.FC<NavListProps> = memo(({ children, index }) => {
  return (
    <div
      className="animate-fade-in opacity-0 [animation-fill-mode:forwards]"
      style={{
        animationDelay: `${index * 0.05}s`,
      }}>
      {children}
    </div>
  );
});

export const ItemList: React.FC<ItemListProps> = memo(({ children, getClassName, getStyle, index }) => {
  return (
    <div
      className={getClassName(index)}
      style={getStyle(index)}>
      {children}
    </div>
  );
});

NavList.displayName = 'NavList';
ItemList.displayName = 'ItemList';
