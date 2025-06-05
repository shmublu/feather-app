import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Menu, X } from 'lucide-react';
import SidebarFiction from '../components/fiction/SidebarFiction';
import EditorAreaFiction from '../components/fiction/EditorAreaFiction';
import SidebarWiki from '../components/wiki/SidebarWiki';
import WikiEditor from '../components/wiki/WikiEditor';
import Tooltip from '../components/common/Tooltip';
import type { FictionData, KnownTerms, WikiTerms, HoveredTermInfo } from '../types';

const HomePage: NextPage = () => {
  const [fictionData, setFictionData] = useState<FictionData>({ frontmatter: {}, markdownContent: '', wordCount: 0 });
  const [knownTerms, setKnownTerms] = useState<KnownTerms>({});
  const [hoveredTermInfo, setHoveredTermInfo] = useState<HoveredTermInfo | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [terms, setTerms] = useState<WikiTerms>({});
  const [selectedTermKey, setSelectedTermKey] = useState<string | null>(null);
  const [isWikiVisible, setIsWikiVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchFictionContent = async () => {
    try {
      const res = await fetch('/api/fiction/content');
      if (!res.ok) throw new Error('Failed to fetch fiction content');
      const data: FictionData = await res.json();
      setFictionData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTerms = async () => {
    try {
      const res = await fetch('/api/wiki/terms');
      if (!res.ok) throw new Error('Failed to fetch wiki terms');
      const data: WikiTerms = await res.json();
      setTerms(data);
      const formatted: KnownTerms = {};
      for (const t in data) {
        formatted[t] = data[t].description;
      }
      setKnownTerms(formatted);
      if (Object.keys(data).length > 0) setSelectedTermKey(Object.keys(data)[0]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchFictionContent(), fetchTerms()]).finally(() => setIsLoading(false));
  }, []);

  const handleSaveContent = async (markdown: string, fm: typeof fictionData.frontmatter) => {
    try {
      const res = await fetch('/api/fiction/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdownContent: markdown, frontmatter: fm }),
      });
      if (!res.ok) throw new Error('Failed to save content');
      const updated: FictionData = await res.json();
      setFictionData(updated);
      alert('Content saved!');
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save content.');
    }
  };

  const handleSaveTerms = async (updated: WikiTerms): Promise<boolean> => {
    try {
      const res = await fetch('/api/wiki/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to save terms');
      const result = await res.json();
      setTerms(result.terms);
      const formatted: KnownTerms = {};
      for (const t in result.terms) {
        formatted[t] = result.terms[t].description;
      }
      setKnownTerms(formatted);
      alert('Wiki terms saved!');
      return true;
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save wiki terms.');
      return false;
    }
  };

  const handleTermHover = useCallback((termKey: string, x: number, y: number) => {
    const description = knownTerms[termKey] || 'No description available.';
    setHoveredTermInfo({ term: termKey, description, x, y });
    setIsTooltipVisible(true);
  }, [knownTerms]);

  const handleTermLeave = useCallback(() => {
    setIsTooltipVisible(false);
  }, []);

  const handleSelectTerm = (key: string) => {
    setSelectedTermKey(key);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (isLoading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading...</div>;
  }

  return (
    <div className="d-flex flex-column vh-100 bg-dark text-light">
      <Head>
        <title>Feather</title>
      </Head>
      <header className="navbar navbar-dark bg-secondary sticky-top">
        <div className="d-flex align-items-center">
          <button onClick={toggleMobileMenu} className="btn btn-outline-light d-md-none me-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="h5 mb-0">Feather / {fictionData.frontmatter?.title || 'Untitled'}</h1>
        </div>
        <button onClick={() => setIsWikiVisible(!isWikiVisible)} className="btn btn-outline-light d-md-none">
          {isWikiVisible ? 'Hide Wiki' : 'Show Wiki'}
        </button>
      </header>
      <div className="d-flex flex-grow-1 overflow-hidden position-relative">
        <SidebarFiction
          isMobileMenuOpen={isMobileMenuOpen}
          title={fictionData.frontmatter?.title || 'Untitled Document'}
          currentWordCount={fictionData.wordCount}
        />
        {isMobileMenuOpen && (
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.3)' }} onClick={() => setIsMobileMenuOpen(false)} />
        )}
        <EditorAreaFiction
          initialContent={fictionData.markdownContent}
          initialFrontmatter={fictionData.frontmatter}
          knownTerms={knownTerms}
          onTermHover={handleTermHover}
          onTermLeave={handleTermLeave}
          onSave={handleSaveContent}
        />
        <div className={`d-flex flex-column bg-secondary border-start overflow-auto ${isWikiVisible ? '' : 'd-none d-md-flex'}`} style={{ width: '20rem' }}>
          <SidebarWiki
            terms={terms}
            onSelectTerm={handleSelectTerm}
            selectedTermKey={selectedTermKey}
            isMobileMenuOpen={false}
          />
          <WikiEditor
            terms={terms}
            selectedTermKey={selectedTermKey}
            onSave={handleSaveTerms}
            onSelectTerm={setSelectedTermKey}
            setTerms={setTerms}
          />
        </div>
      </div>
      <Tooltip termInfo={hoveredTermInfo} isVisible={isTooltipVisible} />
    </div>
  );
};

export default HomePage;
