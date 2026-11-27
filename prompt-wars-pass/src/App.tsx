import { useCallback, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PassCreator from './components/PassCreator';
import ResultSection from './components/ResultSection';
import EventInfo from './components/EventInfo';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { notify } from './lib/notify';
import type { PhotoState } from './types';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function App() {
  const [name, setName] = useState('');
  const [organisation, setorganisation] = useState('');
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const [generated, setGenerated] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);

  const resultKey = useRef(0);

  const handlePhotoReady = useCallback((p: PhotoState) => {
    setPhoto((prev) => {
      if (prev && prev.url !== p.url) URL.revokeObjectURL(prev.url);
      return p;
    });
    notify('Photo added to your pass!');
  }, []);

  const handlePhotoClear = useCallback(() => {
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, []);

  const handleGenerate = useCallback(() => {
    resultKey.current += 1;
    setGenerated(true);
    notify('Your Prompt Wars pass is ready!');
    window.setTimeout(() => scrollTo('your-pass'), 120);
  }, []);

  const handleRegenerate = useCallback(() => {
    // The pass is always rendered live — force a fresh full-resolution render.
    resultKey.current += 1;
    notify('Pass regenerated with the latest details.');
  }, []);

  const handleEditDetails = useCallback(() => {
    scrollTo('creator');
    notify('Edit your details below — the pass updates live.');
  }, []);

  const handleChangePhoto = useCallback(() => {
    scrollTo('creator');
    setOpenSignal((n) => n + 1);
  }, []);

  const handleCreateAnother = useCallback(() => {
    handlePhotoClear();
    setName('');
    setorganisation('');
    setGenerated(false);
    notify('Fresh start! Create another pass below.');
    window.setTimeout(() => scrollTo('creator'), 120);
  }, [handlePhotoClear]);

  return (
    <div className="min-h-screen bg-[#04050c]">
      <Navbar />
      <main>
        <Hero />
        <PassCreator
          name={name}
          organisation={organisation}
          photo={photo}
          openSignal={openSignal}
          onNameChange={setName}
          onorganisationChange={setorganisation}
          onPhotoReady={handlePhotoReady}
          onPhotoClear={handlePhotoClear}
          onGenerate={handleGenerate}
        />
        {generated && (
          <ResultSection
            key={resultKey.current}
            name={name}
            organisation={organisation}
            photo={photo}
            onEditDetails={handleEditDetails}
            onChangePhoto={handleChangePhoto}
            onRegenerate={handleRegenerate}
            onCreateAnother={handleCreateAnother}
          />
        )}
        <EventInfo />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}
