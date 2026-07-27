import { useState, useRef, useEffect, useMemo } from 'react'
import KioskFrame from './KioskFrame'
import CategoriesTabs from './components/CategoriesTabs'
import ProductCard from './components/ProductCard'
import CustomizationPopUp from './components/CustomizationPopUp'
import { Toaster } from 'sonner'
import { toast } from 'sonner'

type ProductCardAndCategories = {
    id:            number
		category_id:   number
		name:          string
		category_name: string
		unit:          string
		image_url:     string
		min_volume:    number
		min_price:     number
		min_calories:  number
}

function App() {
  const [results, setResults] = useState<ProductCardAndCategories[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  // useMemo пересчитывает уникальные категории ТОЛЬКО когда изменился results,
  // а не при каждом рендере (рендер происходит при каждом scroll, т.к. selectedCategory это state).
  // Без useMemo здесь каждый scroll создавал бы НОВЫЙ массив categories,
  // из-за чего useEffect ниже (у него categories в зависимостях) пересоздавался бы
  // на каждое переключение категории слушатель scroll снимался бы и вешался заново без причины
  const categories = useMemo(() => 
    Array.from(
      new Map(results.map(item => [item.category_id, item.category_name])).entries()
    ).map(([id, name]) => ({ id, name })),
    [results]
  )

  // --- Скролл и всё, что с ним связано ---

  // sectionRefs словарь "id категории -> реальный DOM-элемент её секции".
  // Нужен, чтобы потом узнать offsetTop конкретной секции и прокрутить к ней вручную
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // scrollContainerRef ссылка на сам скроллящийся div (весь список категорий+товаров)
  // Прокручиваем именно его через .scrollTo(), а не всю страницу.
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // isManualScrollRef флаг "сейчас едет программный скролл от клика по вкладке".
  // Не useState специально: смена этого флага не должна вызывать ре-рендер компонента,
  // это просто служебная пометка, которая читается/пишется много раз в секунду при скролле
  const isManualScrollRef = useRef(false)

  // scrollEndTimerRef таймер для дебаунса. Определяем момент, когда программный скролл
  // РЕАЛЬНО закончился (а не гадаем по фиксированной задержке, которая была бы либо
  // слишком короткой для дальних категорий, либо слишком долгой для близких)
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Клик по вкладке категории
  const scrollToCategory = (categoryId: number) => {
    // Поднимаем флаг СРАЗУ и обновляем selectedCategory СРАЗУ,
    // не дожидаясь, когда доедет скролл
    isManualScrollRef.current = true
    setSelectedCategory(categoryId)

    const container = scrollContainerRef.current
    const target = sectionRefs.current[categoryId]
    if (container && target) {
      const offset = target.offsetTop - container.offsetTop - 24
      container.scrollTo({ top: offset, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Секция считается "текущей", когда её верх пересекает
    // эту линию (35% высоты видимой области от верха контейнера)
    const ACTIVATION_LINE_RATIO = 0.35

    const handleScroll = () => {
      // --- Дебаунс программного скролла ---
      // Каждое scroll-событие сбрасывает таймер и ставит новый на 150мс.
      // Пока скролл продолжается (клик по дальней вкладке), события идут часто,
      // таймер не успевает сработать. Как только скролл реально остановился ->
      // 150мс без новых событий -> таймер срабатывает -> флаг снимается.
      // Это чинит "дёрганье" категорий при программном скролле мимо промежуточных секций
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
      scrollEndTimerRef.current = setTimeout(() => {
        isManualScrollRef.current = false
      }, 150)

      // Пока едет программный скролл, игнорируем "естественное" определение категории,
      // иначе подсветка скакала бы по всем секциям, мимо которых проезжает скролл
      if (isManualScrollRef.current) return

      // Считаем, где сейчас находится линия активации в системе координат контента
      const line = container.scrollTop + container.clientHeight * ACTIVATION_LINE_RATIO

      // Идём по категориям по порядку (сверху вниз) и берём ПОСЛЕДНЮЮ,
      // чей верх уже выше линии активации, это и есть "текущая" секция.
      // Как только нашли первую секцию НИЖЕ линии, дальше все тоже ниже, останавливаемся
      let currentId: number | null = null
      for (const category of categories) {
        const el = sectionRefs.current[category.id]
        if (!el) continue
        const sectionTop = el.offsetTop - container.offsetTop
        if (sectionTop <= line) {
          currentId = category.id
        } else {
          break
        }
      }

      if (currentId !== null) {
        setSelectedCategory(currentId)
      }
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [categories])

  const GetProductsAndCategories = async() => {
    try {
      const response = await fetch("http://localhost:8080/api/get-products-and-categories")
      const data = await response.json()

      if (response.ok) {
        setResults(data["products"])
      } else {
        toast.error(data["error"])
      }
    } catch (err) {
      console.log("Ошибка сервера: ", err)
      toast.error("Ошибка сервера")
    }
  }

  useEffect(() => {
    GetProductsAndCategories()
  }, [])

  return (
    <KioskFrame>

      <Toaster
        position="bottom-center"
        style={{ fontFamily: "MyFont, sans-serif" }}
      />

      <div className='flex justify-center mt-4'>
        <p className='font-extrabold text-6xl'>PERKLY</p>
      </div>

      <CategoriesTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={scrollToCategory}
      />

      <CustomizationPopUp />

      <div 
      ref={scrollContainerRef}
      className="overflow-y-auto scrollbar-hide max-h-[980px] pb-[50px]"
      style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 64px, black calc(100% - 64px), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 64px, black calc(100% - 64px), transparent)',
        }}>
          {categories.map(category => (
              // data-category-id + ref. Заполняем sectionRefs.current[category.id] реальным
              // DOM-узлом этой секции, как только React его отрендерит
              <div key={category.id}
                   data-category-id={category.id}
                   ref={(el) => { sectionRefs.current[category.id] = el }}
              >
                  <p className="text-[40px] px-2 mt-6">{category.name}</p>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                      {results
                          .filter(p => p.category_id === category.id)
                          .map(product => <ProductCard key={product.id} product={product} />)}
                  </div>
              </div>
          ))}
      </div>

    </KioskFrame>
  )

}

export default App