import { useState, useRef, useEffect, useMemo } from 'react'
import KioskFrame from './KioskFrame'
import CategoriesTabs from './components/CategoriesTabs'
import ProductCard from './components/ProductCard'
import CustomizationPopUp from './components/CustomizationPopUp'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import { declinationWord } from './utils/declination'
import { Toaster } from 'sonner'
import { toast } from 'sonner'

import type { CartItem, PopUpProductInfo, PopUpVariant, Milk, PopUpOption, ProductCardAndCategories, CartItemForCheckout, CheckoutRequest } from './types'


function App() {
  const [screen, setScreen] = useState<'catalog' | 'cart' | 'checkout'>('catalog')

  const [results, setResults] = useState<ProductCardAndCategories[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [popUpOpen, setPopUpOpen] = useState(false)
  const [popUpProductInfo, setPopUpProductInfo] = useState<PopUpProductInfo| null>(null)
  const [popUpVariant, setPopUpVariant] = useState<PopUpVariant[]>([])
  const [popUpOption, setPopUpOption] = useState<PopUpOption[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  // Стейт для подъема из Cart
  const [phone, setPhone] = useState("")

  const [checkoutPrice, setCheckoutPrice] = useState(0)
  const [orderUUID, setOrderUUID] = useState("")


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

  useEffect(() => {
    if (cart.length == 0) {
      setScreen('catalog')
    }
  }, [cart])

  // --- Скролл, и всё, что с ним связано ---
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isManualScrollRef = useRef(false)
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToCategory = (categoryId: number) => {
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
    
    const ACTIVATION_LINE_RATIO = 0.35

    const handleScroll = () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current)
      scrollEndTimerRef.current = setTimeout(() => {
        isManualScrollRef.current = false
      }, 150)

      if (isManualScrollRef.current) return

      const line = container.scrollTop + container.clientHeight * ACTIVATION_LINE_RATIO

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

  return (
    <KioskFrame>

      <Toaster
        position="top-center"
        style={{ fontFamily: "MyFont, sans-serif" }}
      />

      <div className='flex justify-center'>
        <p className='font-extrabold text-6xl'>PERKLY</p>
      </div>

        {/* -------------- КАТАЛОГ --------------  */}
        <div className={`transition-all duration-300
          ${screen == 'catalog' ? "opacity-100" : "opacity-0 pointer-events-none max-h-0"}`}>

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
          ref={scrollContainerRef}
          className={`overflow-y-auto scrollbar-hide max-h-[980px] 
            ${cart.length > 0 ? "pb-[110px]" : "pb-[50px]"}`}
          style={{
                maskImage: 'linear-gradient(to bottom, transparent, black 64px, black calc(100% - 64px), transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 64px, black calc(100% - 64px), transparent)',
            }}>
              {categories.map(category => (
                  <div key={category.id}
                      data-category-id={category.id}
                      ref={(el) => { sectionRefs.current[category.id] = el }}
                  >
                      <p className="text-[40px] px-2 mt-6">{category.name}</p>
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


        {/* -------------- КОРЗИНА --------------  */}
        <div className={`transition-all duration-300
          ${screen == 'cart' ? "opacity-100" : "opacity-0 pointer-events-none max-h-0"}`}>

            <Cart cart={cart} 
            onBack={() => setScreen('catalog')} 
            onRemove={removeFromCart}
            onUpdatePhone={setPhone}
            onNext={handleCheckout}
            />

        </div>

        
        {/* -------------- ЧЕКАУТ --------------  */}
        <div className={`transition-all duration-300
          ${screen == 'checkout' ? "opacity-100" : "opacity-0 pointer-events-none max-h-0"}`}>

            <Checkout checkoutPrice={checkoutPrice} onBack={() => { setScreen("cart") }}/>

        </div>






    </KioskFrame>
  )

}

export default App