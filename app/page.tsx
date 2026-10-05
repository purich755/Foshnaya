import { Suspense } from 'react';
import HydrateLater from '@/components/ui/HydrateLater';
import Header from '@/components/layout/Header';
import MobileBar from '@/components/layout/MobileBar';
import Footer from '@/components/layout/Footer';
import SmoothScroll from '@/components/layout/SmoothScroll';
import ScrollProgress from '@/components/layout/ScrollProgress';
import Cursor from '@/components/layout/Cursor';
import Hero from '@/components/sections/Hero';
import Ticker from '@/components/sections/Ticker';
import SmallSpace from '@/components/sections/SmallSpace';
import SizePicker from '@/components/sections/SizePicker';
import BuildBowl from '@/components/sections/BuildBowl';
import CounterMenu from '@/components/sections/CounterMenu';
import JvcGallery from '@/components/sections/JvcGallery';
import Hostess from '@/components/sections/Hostess';
import Receipts from '@/components/sections/Receipts';
import HonestFaq from '@/components/sections/HonestFaq';
import Route from '@/components/sections/Route';
import Finale from '@/components/sections/Finale';

export default function Page() {
  return (
    <>
      <a href="#main" className="skip">
        К содержимому
      </a>
      <SmoothScroll />
      <ScrollProgress />
      <Cursor />
      <Header />
      {/* секции ниже первого экрана гидратируются после load + idle (HydrateLater внутри Suspense) */}
      <main id="main">
        <Hero />
        <Suspense>
          <HydrateLater name="Ticker">
            <Ticker />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="SmallSpace">
            <SmallSpace />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="SizePicker">
            <SizePicker />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="BuildBowl">
            <BuildBowl />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="CounterMenu">
            <CounterMenu />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="JvcGallery">
            <JvcGallery />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="Hostess">
            <Hostess />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="Receipts">
            <Receipts />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="HonestFaq">
            <HonestFaq />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="Route">
            <Route />
          </HydrateLater>
        </Suspense>
        <Suspense>
          <HydrateLater name="Finale">
            <Finale />
          </HydrateLater>
        </Suspense>
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
