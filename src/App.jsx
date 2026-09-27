import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Studio from './components/Studio.jsx';
import Works from './components/Works.jsx';
import ProjectFocus from './components/ProjectFocus.jsx';
import Services from './components/Services.jsx';
import Team from './components/Team.jsx';
import Contact from './components/Contact.jsx';
import Preloader from './components/Preloader.jsx';

// The pop-up and the story are only needed once someone opens a project:
// load them then, to keep the first download small.
const ProjectViewer = lazy(() => import('./components/ProjectViewer.jsx'));
const ProjectStory = lazy(() => import('./components/ProjectStory.jsx'));
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

  const [story, setStory] = useState(null);
  const openStory = useCallback((id, ids, origin) => {
    if (getWork(id)) setStory({ id, ids, origin });
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
        <ProjectFocus onOpenStory={openStory} />
        <Team />
        <Contact />
      </div>
      {viewer && (
        <Suspense fallback={null}>
          <ProjectViewer openId={viewer.id} ids={viewer.ids} onChange={change} onClose={close} />
        </Suspense>
      )}
      {story && (
        <Suspense fallback={null}>
          <ProjectStory
            openId={story.id}
            ids={story.ids}
            origin={story.origin}
            onChange={(id) => setStory((s) => ({ ...s, id, origin: null }))}
            onClose={() => setStory(null)}
          />
        </Suspense>
      )}
    </>
  );
}
