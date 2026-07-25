import { useEffect, useState, type ReactNode } from 'react';

const WIDTH = 820
const HEIGHT = 1180

export default function KioskFrame({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fit = () => {
      setScale(Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT))
    };
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black overflow-hidden">
      <div
        style={{ width: WIDTH, height: HEIGHT, transform: `scale(${scale})` }}
        className="bg-white shrink-0 overflow-hidden"
      >
        <div className="p-8 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}