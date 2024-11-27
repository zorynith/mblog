import { cn } from '~/utils/cn'

type LogoProps = {
    width?: number
    height?: number
    className?: string
    [key: string]: unknown | undefined
}

export function Logo({ width, height, className, ...args }: LogoProps) {
    return (
        <svg
            {...args}
            width={width ?? 40}
            height={height ?? 40}
            xmlns="http://www.w3.org/2000/svg"
            className={cn(`text-primary ${className}`)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
            <g transform="translate(14, -1) scale(0.67)">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </g>
        </svg>
    )
}
