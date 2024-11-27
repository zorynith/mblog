import { useEffect, useRef } from 'react';
import { useLocation } from '@remix-run/react';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.substring(1); // 移除 '#' 字符
      const targetElement = document.getElementById(targetId);
      const scrollContainer = scrollContainerRef.current;

      if (targetElement && scrollContainer) {
        const navbarHeight = 80; // 根据你的导航栏实际高度调整
        const buffer = 20; // 额外的缓冲空间

        // 计算目标元素相对于滚动容器的位置
        const targetPosition = targetElement.offsetTop - scrollContainer.offsetTop;

        // 滚动到目标位置，考虑导航栏高度和缓冲空间
        scrollContainer.scrollTo({
          top: targetPosition - navbarHeight - buffer,
          behavior: 'smooth'
        });
      }
    }
  }, [location]);

  return (
    <div ref={scrollContainerRef} style={{ height: '100vh', overflowY: 'auto' }}>
      {children}
    </div>
  );
}