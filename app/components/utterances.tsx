import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only'

interface UtterancesProps {
  repo: string;
  theme?: 'github-light' | 'github-dark';
  issueTerm?: string;
}

function UtterancesContent({ 
  repo, 
  theme = 'github-light',
  issueTerm = 'pathname' 
}: UtterancesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 移除旧的评论实例
    const utterancesFrame = containerRef.current?.querySelector('.utterances-frame');
    if (utterancesFrame) {
      utterancesFrame.remove();
    }

    // 创建新的评论实例
    const utterancesScript = document.createElement('script');
    const attributes = {
      src: 'https://utteranc.es/client.js',
      repo,
      'issue-term': issueTerm,
      theme,
      crossorigin: 'anonymous',
      async: 'true'
    };

    Object.entries(attributes).forEach(([key, value]) => {
      utterancesScript.setAttribute(key, value);
    });

    // 添加自定义样式
    const styleId = 'utterances-style';
    let style = document.getElementById(styleId);
    
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .utterances {
          max-width: 100% !important;
        }
        .utterances-frame {
          width: 100% !important;
        }
      `;
      document.head.appendChild(style);
    }

    if (containerRef.current) {
      containerRef.current.appendChild(utterancesScript);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [repo, theme, issueTerm]);

  return (
    <div className="shadow-md rounded-lg p-6 bg-background text-foreground w-full" ref={containerRef} />
  );
}

export function Utterances(props: UtterancesProps) {
  const { t } = useTranslation();
  return (
    <ClientOnly fallback={<div className="shadow-md rounded-lg p-6 bg-background text-foreground">{t("comment_loading")}</div>}>
      {() => <UtterancesContent {...props} />}
    </ClientOnly>
  );
} 