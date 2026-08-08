import { useCallback, useEffect, useRef } from 'react'
import { type Category } from '../types'

type CategoriesTabsProps = {
    categories: Category[]
    selectedCategory: number | null
    onSelectCategory: (id: number) => void
}

// Скролл табов в видимую область
const TAB_SCROLL_PADDING = 32

function scrollTabIntoView(
    container: HTMLDivElement,
    tab: HTMLParagraphElement,
    isFirstTab: boolean,
) {
    if (isFirstTab) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
        return
    }

    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth)
    const offset = tab.offsetLeft - TAB_SCROLL_PADDING
    container.scrollTo({
        left: Math.min(Math.max(0, offset), maxScroll),
        behavior: 'smooth',
    })
}

// Горизонтальные табы категорий
export default function CategoriesTabs({ categories, selectedCategory, onSelectCategory }: CategoriesTabsProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const tabRefs = useRef<Record<number, HTMLParagraphElement | null>>({})
    const lastClickedCategoryRef = useRef<number | null>(null)

    const handleSelectCategory = useCallback((categoryId: number) => {
        lastClickedCategoryRef.current = categoryId
        onSelectCategory(categoryId)
    }, [onSelectCategory])

    // Скролл выбранного таба в видимую область при смене selectedCategory
    useEffect(() => {
        if (selectedCategory === null) return

        if (lastClickedCategoryRef.current === selectedCategory) {
            lastClickedCategoryRef.current = null
            return
        }

        const container = containerRef.current
        const tab = tabRefs.current[selectedCategory]
        if (!container || !tab) return

        const tabIndex = categories.findIndex(c => c.id === selectedCategory)

        // rAF: дождаться layout после mount/unmount и смены selectedCategory
        let raf2 = 0
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                const liveContainer = containerRef.current
                const liveTab = tabRefs.current[selectedCategory]
                if (liveContainer && liveTab) {
                    scrollTabIntoView(liveContainer, liveTab, tabIndex === 0)
                }
            })
        })

        return () => {
            cancelAnimationFrame(raf1)
            cancelAnimationFrame(raf2)
        }
    }, [selectedCategory, categories])

    return (
        <div 
            ref={containerRef}
            className='relative flex flex-row gap-3 mt-8 px-8 overflow-x-auto whitespace-nowrap scrollbar-hide select-none'
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
            }}
        >
            {categories.map((category) => (
                <p 
                    key={category.id}
                    ref={(el) => { tabRefs.current[category.id] = el }}
                    className={
                        `text-lg px-10 py-3.5 my-1 rounded-full shrink-0 whitespace-nowrap
                        transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                        active:scale-90 font-semibold
                        ${selectedCategory === category.id ? `bg-black text-white cursor-default`
                             : `bg-[#E4E2E2] text-gray-800 cursor-pointer`}`
                    }
                    onClick={() => handleSelectCategory(category.id)}
                >
                    {category.name}
                </p>
            ))}
        </div>
    )
}
