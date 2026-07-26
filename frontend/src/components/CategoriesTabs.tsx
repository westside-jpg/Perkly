import { useEffect, useRef } from 'react'

type Category = { id: number; name: string }

type CategoriesTabsProps = {
    categories: Category[]
    selectedCategory: number | null
    onSelectCategory: (id: number) => void
}

export default function CategoriesTabs({ categories, selectedCategory, onSelectCategory }: CategoriesTabsProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const tabRefs = useRef<Record<number, HTMLParagraphElement | null>>({})

    useEffect(() => {
        if (selectedCategory === null) return
        const container = containerRef.current
        const tab = tabRefs.current[selectedCategory]
        if (container && tab) {
            const offset = tab.offsetLeft - container.offsetLeft - 32 // немного отступа слева
            container.scrollTo({ left: offset, behavior: 'smooth' })
        }
    }, [selectedCategory])

    return (
        <div 
            ref={containerRef}
            className='flex flex-row gap-3 mt-8 px-8 overflow-x-auto whitespace-nowrap scrollbar-hide'
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
                             : `bg-[#E4E2E2] text-gray-800 cursor-pointer`}`}
                    onClick={() => onSelectCategory(category.id)}
                >{category.name}</p>
            ))}
        </div>
    )
}