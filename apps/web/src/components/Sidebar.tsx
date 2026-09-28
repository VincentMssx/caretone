import Link from 'next/link';
import Image from 'next/image';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-on-secondary-fixed text-on-secondary flex flex-col gap-lg p-lg shadow-sm z-50">
      <div className="flex flex-col gap-xs mb-xl">
        <h1 className="font-headline-md text-headline-md font-bold text-on-primary-fixed">CareVoice IDEL</h1>
        <div className="flex items-center gap-sm mt-md">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container relative">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpaAo7-QFodOZJSrbOvPYrDV19reU9u8nnPMm6mSJpdJlmlb1F8yPTTfAHk-604LN0DS5W3y2wGx8JGYCJr329rVwBaUmYoTJI6OqzkKXZjgIyQNWboBmHS8Z3THw9gXV8d-xl9r1tBjQNt1XdwJ-rzNWC8veNRy37tCu8fE8ckbdDAXWB2fNXoxSN_eeSF5rD_eQ9aj_rFaClPvaW9R-akhowDA9j6bGphxs-KyA0TrOgXKDFKtaQDFs5ep58kfzFUEvs95KDPqA"
              alt="Julie R."
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-label-lg text-label-lg text-on-primary-fixed">Julie R.</span>
            <span className="font-label-sm text-label-sm text-on-secondary-fixed-variant">Infirmière</span>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-sm flex-1">
        <Link href="/dashboard" className="flex items-center gap-md text-on-secondary-fixed-variant px-md py-sm hover:bg-on-secondary-fixed-variant transition-colors rounded-lg group">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-lg text-label-lg">Accueil</span>
        </Link>
        <Link href="/patients" className="flex items-center gap-md text-on-secondary-fixed-variant px-md py-sm hover:bg-on-secondary-fixed-variant transition-colors rounded-lg group">
          <span className="material-symbols-outlined">group</span>
          <span className="font-label-lg text-label-lg">Patients</span>
        </Link>
        {/* Exemple d'état actif */}
        <Link href="/record" className="flex items-center gap-md bg-primary-container text-on-primary-container rounded-lg px-md py-sm scale-98 active:scale-95 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
          <span className="font-label-lg text-label-lg">Voice Transmission</span>
        </Link>
      </nav>
      
      <div className="mt-auto p-md bg-on-secondary-fixed-variant/20 rounded-xl">
        <p className="font-label-sm text-label-sm text-on-secondary-fixed-variant opacity-80">Session active: 08:42</p>
      </div>
    </aside>
  );
}