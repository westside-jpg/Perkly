import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import KioskFrame from './KioskFrame'
import CategoriesTabs from './components/CategoriesTabs'
import ProductCard from './components/ProductCard'
import CustomizationPopUp from './components/CustomizationPopUp'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MethodCard from './pages/MethodCard'
import MethodSBP from './pages/MethodSBP'
import Approved from './pages/Approved'
import Declined from './pages/Declined'
import Screensaver from './pages/Screensaver'
import InactivityModal from './components/InactivityModal'
import { declinationWord } from './utils/declination'
import { Toaster } from 'sonner'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'framer-motion'

import type { CartItem, PopUpProductInfo, PopUpVariant, Milk, PopUpOption, ProductCardAndCategories, CartItemForCheckout, CheckoutRequest } from './types'

// --- Скролл и синхронизация категорий ---
const CATALOG_TOP_PADDING = 64
const SCROLL_BOTTOM_THRESHOLD = 15
const ACTIVATION_LINE_RATIO = 0.35

function getElementOffsetTop(container: HTMLElement, element: HTMLElement): number {
  let offset = 0
  let current: HTMLElement | null = element

  while (current && current !== container) {
    offset += current.offsetTop
    current = current.offsetParent as HTMLElement | null
  }

  return offset
}

function getCategoryScrollTop(container: HTMLElement, title: HTMLElement): number {
  const marginTop = parseFloat(getComputedStyle(title).marginTop) || 0
  return Math.max(0, getElementOffsetTop(container, title) + marginTop - CATALOG_TOP_PADDING)
}

function resolveActiveCategory(
  container: HTMLElement,
  categories: { id: number; name: string }[],
  titleRefs: Record<number, HTMLParagraphElement | null>,
): number | null {
  if (categories.length === 0) return null

  const containerRect = container.getBoundingClientRect()
  const activationLine = containerRect.top + container.clientHeight * ACTIVATION_LINE_RATIO

  let currentId: number | null = null

  for (const category of categories) {
    const title = titleRefs[category.id]
    if (!title) continue

    if (title.getBoundingClientRect().top <= activationLine) {
      currentId = category.id
    } else {
      break
    }
  }

  if (container.scrollHeight - container.scrollTop - container.clientHeight <= SCROLL_BOTTOM_THRESHOLD) {
    currentId = categories[categories.length - 1].id
  }

  return currentId
}

function App() {
  const [screen, setScreen] = useState<'screensaver' | 'catalog' | 'cart' | 'checkout' | 'methodCard' | 'methodSBP' | 'declined' | 'approved'>('screensaver')
  const [results, setResults] = useState<ProductCardAndCategories[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [popUpOpen, setPopUpOpen] = useState(false)
  const [popUpProductInfo, setPopUpProductInfo] = useState<PopUpProductInfo| null>(null)
  const [popUpVariant, setPopUpVariant] = useState<PopUpVariant[]>([])
  const [popUpOption, setPopUpOption] = useState<PopUpOption[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const idleTimerRef = useRef<number | null>(null)
  const countdownTimerRef = useRef<number | null>(null)
  const [phone, setPhone] = useState("")
  const [isBonusProgramDebit, setIsBonusProgramDebit] = useState(false)
  const [bonusesCount, setBonusesCount] = useState(0)
  const [checkoutPrice, setCheckoutPrice] = useState(0)
  const [orderUUID, setOrderUUID] = useState("")
  const [clientNumber, setClientNumber] = useState("")


  const totalCartPrice = cart.reduce((total, item) => {
    const milkPrice = item.milk?.price_delta ?? 0
    const optionsPrice = item.options.reduce((sum, opt) => sum + opt.price_delta, 0)

    return total + item.variant.price_base + milkPrice + optionsPrice
  }, 0)

  const categories = useMemo(() => 
    Array.from(
      new Map(results.map(item => [item.category_id, item.category_name])).entries()
    ).map(([id, name]) => ({ id, name })),
    [results]
  )

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

  const GetPopUpDetails = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/get-product-information/${productId}`)
      const data = await response.json()

      if (response.ok) {
        setPopUpProductInfo(data["product"])
        setPopUpVariant(data["variants"])
        setPopUpOption(data["options"])
        setPopUpOpen(true)
      } else {
        toast.error(data["error"])
      }
    } catch (err) {
      console.log("Ошибка сервера: ", err)
      toast.error("Ошибка сервера")
    }
  }

  const addToCart = (productInfo: PopUpProductInfo, variant: PopUpVariant, milk: Milk | null, options: PopUpOption[]) => {
    if (!variant) return

    setCart(prev => [
      ...prev,
      {
        productInfo,
        variant,
        milk,
        options
      }
    ])
    
    setPopUpOpen(false)
  }

  const removeFromCart = (indexToRemove: number) => {
    setCart(prevCart => prevCart.filter((_, index) => index !== indexToRemove))
  }

  const handleCheckout = async () => {
    try {
          if (cart.length === 0) {
            toast.error("Корзина пуста")
            return
          }

          const formattedItems: CartItemForCheckout[] = cart.map(item => {
              const optionIds: number[] = []

              if (item.milk) {
                optionIds.push(item.milk.id)
              }

              item.options.forEach(opt => {
                optionIds.push(opt.id)
              })

              return {
                product_variant_id: item.variant.id,
                option_ids: optionIds
              }
        })

        const payload: CheckoutRequest = {
          phone: phone,
          items: formattedItems
        }

        const response = await fetch("http://localhost:8080/api/order/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include"
        })
        const data = await response.json()

        if (response.ok) {
          setCheckoutPrice(data["final_price"])
          setOrderUUID(data["order_uuid"])
          setScreen('checkout')
        } else {
          toast.error(data["error"])
        }
    } catch (err) {
        console.log("Ошибка сервера: ", err)
        toast.error("Ошибка сервера")
    }
  }

  const handlePay = async (method: "card" | "sbp", status: "approved" | "declined") => {
    try {
        const response = await fetch("http://localhost:8080/api/order/pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_uuid: orderUUID,
              method: method,
              status: status
            }),
            credentials: "include"
        })
        const data = await response.json()

        if (response.ok) {
          if (data["success"] == true) {
            setClientNumber(data["order_client_number"])
            setScreen('approved')
          } else if (data["success"] == false) {
            setScreen('declined')
          }
        } else {
          toast.error(data["error"])
        }

    } catch (err) {
        console.log("Ошибка сервера: ", err)
        toast.error("Ошибка сервера")
    }
  }

  useEffect(() => {
    if (cart.length === 0 && (screen === 'cart' || screen === 'checkout')) {
      setScreen('catalog')
    }
  }, [cart, screen])

  const resetToWaitScreen = async () => {
    if (isBonusProgramDebit && phone.length === 10) {
        try {
            await fetch('http://localhost:8080/api/user/verify/cancel', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: phone }),
                credentials: "include"
            })
        } catch (err) {
            console.log("Ошибка отмены бонусов при сбросе: ", err)
        }
    }

    setCart([])
    setPhone("")
    setCheckoutPrice(0)
    setOrderUUID("")
    setClientNumber("")
    setPopUpOpen(false)
    setSelectedCategory(null)
    setResults([])
    setPopUpProductInfo(null)
    setPopUpVariant([])
    setPopUpOption([])

    GetProductsAndCategories()

    setIsBonusProgramDebit(false)
    setBonusesCount(0)

    setScreen('screensaver')
  }

  const handleFullReset = useCallback(() => {
      setIsWarningOpen(false)
      setTimeLeft(15)
      resetToWaitScreen()
  }, [])

  // Сброс таймера при любом действии пользователя
  const resetIdleTimers = useCallback(() => {
      if (screen === 'screensaver') {
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
          setIsWarningOpen(false)
          return
      }

      if (isWarningOpen) return 

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)

      idleTimerRef.current = window.setTimeout(() => {
          setIsWarningOpen(true)
          setTimeLeft(15)

          countdownTimerRef.current = window.setInterval(() => {
              setTimeLeft(prev => {
                  if (prev <= 1) {
                      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
                      handleFullReset()
                      return 0
                  }
                  return prev - 1
              })
          }, 1000)

      }, 45000) 
  }, [isWarningOpen, screen, handleFullReset])

  // Слушатели глобальных событий на киоске
  useEffect(() => {
      const events = ['pointerdown', 'touchstart', 'click', 'keydown', 'scroll']
      
      events.forEach(event => {
          window.addEventListener(event, resetIdleTimers, { capture: true })
      })

      resetIdleTimers()

      return () => {
          events.forEach(event => {
              window.removeEventListener(event, resetIdleTimers, { capture: true })
          })
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
      }
  }, [resetIdleTimers])

// --- Скролл и синхронизация категорий ---
  const titleRefs = useRef<Record<number, HTMLParagraphElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const [scrollContainerReady, setScrollContainerReady] = useState(false)
  const isProgrammaticScrollRef = useRef(false)
  const scrollLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollLockCleanupRef = useRef<(() => void) | null>(null)

  const releaseProgrammaticScrollLock = useCallback(() => {
    isProgrammaticScrollRef.current = false
    scrollLockCleanupRef.current?.()
    scrollLockCleanupRef.current = null
    if (scrollLockTimerRef.current) {
      clearTimeout(scrollLockTimerRef.current)
      scrollLockTimerRef.current = null
    }
  }, [])

  const acquireProgrammaticScrollLock = useCallback((container: HTMLDivElement, fallbackMs = 900) => {
    releaseProgrammaticScrollLock()
    isProgrammaticScrollRef.current = true

    const finish = () => {
      releaseProgrammaticScrollLock()
    }

    const onScrollEnd = () => finish()
    container.addEventListener('scrollend', onScrollEnd, { once: true })

    scrollLockCleanupRef.current = () => {
      container.removeEventListener('scrollend', onScrollEnd)
    }

    scrollLockTimerRef.current = setTimeout(finish, fallbackMs)
  }, [releaseProgrammaticScrollLock])

  const setScrollContainer = useCallback((node: HTMLDivElement | null) => {
    scrollContainerRef.current = node
    setScrollContainerReady(node !== null)
  }, [])

  const scrollToCategory = useCallback((categoryId: number) => {
    setSelectedCategory(categoryId)

    const container = scrollContainerRef.current
    const title = titleRefs.current[categoryId]
    if (!container || !title) return

    acquireProgrammaticScrollLock(container)

    const top = getCategoryScrollTop(container, title)
    container.scrollTo({ top, behavior: 'smooth' })
  }, [acquireProgrammaticScrollLock])

  // Синхронизация активного таба при ручном скролле каталога
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!scrollContainerReady || !container || screen !== 'catalog' || categories.length === 0) return

    const syncActiveCategory = () => {
      if (isProgrammaticScrollRef.current) return

      const currentId = resolveActiveCategory(container, categories, titleRefs.current)
      if (currentId !== null) {
        setSelectedCategory(prev => (prev !== currentId ? currentId : prev))
      }
    }

    // Двойной rAF: дождаться layout после mount/unmount AnimatePresence
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(syncActiveCategory)
    })

    container.addEventListener('scroll', syncActiveCategory, { passive: true })

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      container.removeEventListener('scroll', syncActiveCategory)
    }
  }, [scrollContainerReady, categories, screen])

  // Дефолтная категория при первом входе в каталог
  useEffect(() => {
    if (screen === 'catalog' && selectedCategory === null && categories.length > 0) {
      setSelectedCategory(categories[0].id)
    }
  }, [screen, categories, selectedCategory])

  useEffect(() => {
    if (screen !== 'catalog') {
      releaseProgrammaticScrollLock()
    }
  }, [screen, releaseProgrammaticScrollLock])

  return (
    <KioskFrame>

        <Toaster
          position="top-center"
          style={{ fontFamily: "MyFont, sans-serif" }}
        />

        {/* -------------- ЛОГОТИП -------------- */}
        {screen != 'screensaver' && (
          <div className='flex justify-center'>
            <p className='font-extrabold text-6xl'>PERKLY</p>
          </div>
        )}

      <AnimatePresence mode="wait">

        {/* -------------- ЭКРАН ОЖИДАНИЯ -------------- */}
        {screen === 'screensaver' && (
          <motion.div
            key="screensaver"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 w-full h-full z-30"
          >
            <Screensaver onStart={() => setScreen('catalog')} />
          </motion.div>
        )}

        {/* Модалка предупреждения о бездействии */}
        {screen !== 'screensaver' && (
          <InactivityModal 
              isOpen={isWarningOpen}
              onContinue={() => {
                  setIsWarningOpen(false)
                  if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
                  resetIdleTimers()
              }}
              onCancel={() => {
                  if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
                  handleFullReset()
              }}
          />
        )}

        {/* -------------- КАТАЛОГ --------------  */}
        {screen === 'catalog' && (
        <motion.div
          key="catalog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full h-full"
        >
        <div>

            <CategoriesTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={scrollToCategory}
            />

          <CustomizationPopUp isOpen={popUpOpen} 
                              onClose={() => setPopUpOpen(false)}
                              product={popUpProductInfo}
                              variants={popUpVariant}
                              options={popUpOption}
                              addCart={addToCart}
                              />

          <div 
          ref={setScrollContainer}
          className={`relative overflow-y-auto scrollbar-hide max-h-[980px] 
            ${cart.length > 0 ? "pb-[110px]" : "pb-[50px]"}`}
          style={{
                maskImage: 'linear-gradient(to bottom, transparent, black 64px, black calc(100% - 64px), transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 64px, black calc(100% - 64px), transparent)',
            }}>
              {categories.map(category => (
                  <div key={category.id}
                      data-category-id={category.id}
                  >
                      <p
                        ref={(el) => { titleRefs.current[category.id] = el }}
                        className="text-[40px] px-2 mt-6 scroll-mt-16"
                      >
                        {category.name}
                      </p>
                      <div className="grid grid-cols-3 gap-4 mt-6">
                          {results
                              .filter(p => p.category_id === category.id)
                              .map(product => <ProductCard 
                                                key={product.id}
                                                product={product}
                                                onOpen={() => GetPopUpDetails(product.id)} />)}
                      </div>
                  </div>
              ))}
          </div>

          <div className={`sticky flex gap-3 flex-row bottom-5 z-20 duration-300 transition-all
            ${cart.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <div className={`bg-black text-white px-8 py-5 text-xl text-center rounded-full`}>
                {cart.length}
                {" "}
                {declinationWord(cart.length, "товар", "товара", "товаров")}
                {" • "}
                {totalCartPrice}₽
              </div>

              <div className={`flex-1 bg-black text-white px-4 py-5 text-xl text-center rounded-full
                transition-all duration-300 active:scale-95 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer`}
                onClick={() => { setScreen('cart') }}>
                Корзина
              </div>
              
          </div>
        </div>
        </motion.div>
        )}


        {/* -------------- КОРЗИНА --------------  */}
        {screen === 'cart' && (
          <motion.div
            key="cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full"
          >
            <Cart
              cart={cart}
              onBack={() => setScreen('catalog')}
              onRemove={removeFromCart}
              onNext={handleCheckout}
              phone={phone}
              setPhone={setPhone}
              isBonusProgramDebit={isBonusProgramDebit}
              setIsBonusProgramDebit={setIsBonusProgramDebit}
              bonusesCount={bonusesCount}
              setBonusesCount={setBonusesCount}
            />
          </motion.div>
        )}

        
        {/* -------------- ЧЕКАУТ --------------  */}
        {screen === 'checkout' && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full"
          >
            <Checkout
                checkoutPrice={checkoutPrice}
                onBack={() => { setScreen("cart") }}
                onNextMethodCard={() => { setScreen('methodCard') }}
                onNextMethodSBP={() => { setScreen('methodSBP') }}
            />
          </motion.div>
        )}



        {/* ----- ОПЛАТА КАРТОЙ ----- */}
        {screen === 'methodCard' && (
          <motion.div
            key="methodCard"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="w-full h-full"
          >
            <MethodCard
              onBack={() => { setScreen("checkout") }}
              onDeclined={() => { handlePay("card", "declined") }}
              onApproved={() => { handlePay("card", "approved") }}
            />
          </motion.div>
        )}

        {/* ----- ОПЛАТА СБП ----- */}
        {screen === 'methodSBP' && (
          <motion.div
            key="methodSBP"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="w-full h-full"
          >
            <MethodSBP
              onBack={() => { setScreen("checkout") }}
              onDeclined={() => { handlePay("sbp", "declined") }}
              onApproved={() => { handlePay("sbp", "approved") }}
            />
          </motion.div>
        )}
        

        {/* ----- НЕУДАЧНАЯ ОПЛАТА ----- */}
        {screen === 'declined' && (
          <motion.div 
            key="declined" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="w-full h-full"
          >
            <Declined onBack={() => setScreen('checkout')}/>
          </motion.div>
        )}

        {/* ----- УСПЕШНАЯ ОПЛАТА ----- */}
        {screen === 'approved' && (
          <motion.div 
            key="approved" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.15 }}
            className="w-full h-full"
          >
            <Approved
              onFinish={resetToWaitScreen}
              orderNumber={clientNumber}
              isApproved={screen === 'approved'}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </KioskFrame>
  )

}

export default App