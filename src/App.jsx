import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Studio from './components/Studio.jsx';
import Works from './components/Works.jsx';
import ProjectFocus from './components/ProjectFocus.jsx';
import Services from './components/Services.jsx';
import Team from './components/Team.jsx';
import Contact from './components/Contact.jsx';
import { useRef } from 'react';

export default function App() {
  const scrollerRef = useRef(null);
  return (
    <div
      ref={scrollerRef}
      className="thin-scroll relative h-screen snap-y snap-mandatory overflow-y-auto overflow-x-hidden bg-white text-ink"
    >
      <Header scrollerRef={scrollerRef} />
      <Hero />
      <Studio />
      <Works />
      <ProjectFocus />
      <Services />
      <Team />
      <Contact />
    </div>
  );
}
