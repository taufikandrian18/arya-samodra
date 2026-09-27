import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Studio from './components/Studio.jsx';
import Works from './components/Works.jsx';
import ProjectFocus from './components/ProjectFocus.jsx';
import Services from './components/Services.jsx';
import Team from './components/Team.jsx';
import Contact from './components/Contact.jsx';
import ProjectViewer from './components/ProjectViewer.jsx';
import Preloader from './components/Preloader.jsx';
import { getWork, workIds } from './data.js';
import { readWorkParam, writeWorkParam } from './lib/workParam.js';

export default function App() {
  const scrollerRef = useRef(null);
  const [viewer, setViewer] = useState(() => {
    const id = typeof window !== 'undefined' ? readWorkParam(window.location.search) : null;
    return id && getWork(id) ? { id, ids: workIds } : null;
  });

  // Drop an unknown ?work= on load; keep the hash.
  useEffect(() => {
    const id = readWorkParam(window.location.search);
    if (id && !getWork(id)) writeWorkParam(null);
  }, []);

  const openWork = useCallback((id, ids = workIds) => {
    if (!getWork(id)) return;
    setViewer({ id, ids });
    writeWorkParam(id);
  }, []);

  const change = useCallback((id) => {
    setViewer((v) => (v ? { ...v, id } : v));
    writeWorkParam(id);
  }, []);

  const close = useCallback(() => {
    setViewer(null);
    writeWorkParam(null);
  }, []);

  return (
    <>
      <Preloader />
      <div
        ref={scrollerRef}
        className="thin-scroll relative h-svh overflow-y-auto overflow-x-hidden bg-paper text-navy md:snap-y md:snap-mandatory"
      >
        <Header scrollerRef={scrollerRef} />
        <Hero />
        <Studio />
        <Works onOpenWork={openWork} />
        <Services />
        <ProjectFocus onOpenWork={openWork} />
        <Team />
        <Contact />
      </div>
      <ProjectViewer openId={viewer?.id ?? null} ids={viewer?.ids ?? workIds} onChange={change} onClose={close} />
    </>
  );
}
