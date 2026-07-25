import KioskFrame from './KioskFrame'
import CategoriesTabs from './components/CategoriesTabs'
import { Toaster } from 'sonner'

function App() {

  return (
    <KioskFrame>
      <Toaster
        position="bottom-center"
        style={{ fontFamily: "MyFont, sans-serif" }} />
      <div className='flex justify-center mt-6'>
        <p className='font-bold text-6xl'>PERKLY</p>
      </div>
      <CategoriesTabs />
    </KioskFrame>
  )

}

export default App
