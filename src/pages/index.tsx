// src/pages/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Menu, X, BookOpen } from 'lucide-react';
import type { NextPage } from 'next';

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
  const [wikiTerms, setWikiTerms] = useState<WikiTerms>({});
  const [selectedTermKey, setSelectedTermKey] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isWikiOpen, setIsWikiOpen] = useState<boolean>(false);
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

  const fetchWikiTerms = async () => {
    try {
      const res = await fetch('/api/wiki/terms');
      if (!res.ok) throw new Error('Failed to fetch wiki terms');
      const termsData: WikiTerms = await res.json();
      setWikiTerms(termsData);
      const formatted: KnownTerms = {};
      for (const term in termsData) {
        formatted[term] = termsData[term].description;
      }
      setKnownTerms(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchFictionContent(), fetchWikiTerms()]).finally(() => setIsLoading(false));
  }, []);

  const handleSaveContent = async (newMarkdownContent: string, newFrontmatter: typeof fictionData.frontmatter) => {
    try {
      const res = await fetch('/api/fiction/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdownContent: newMarkdownContent, frontmatter: newFrontmatter }),
      });
      if (!res.ok) throw new Error('Failed to save content');
      const updatedData: FictionData = await res.json();
      setFictionData(updatedData);
      alert('Content saved!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save content.');
    }
  };

  const handleSaveTerms = async (updatedTerms: WikiTerms): Promise<boolean> => {
    try {
      const res = await fetch('/api/wiki/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTerms),
      });
      if (!res.ok) throw new Error('Failed to save terms');
      const result = await res.json();
      setWikiTerms(result.terms);
      const formatted: KnownTerms = {};
      for (const term in result.terms) {
        formatted[term] = result.terms[term].description;
      }
      setKnownTerms(formatted);
      alert('Wiki terms saved!');
      return true;
    } catch (error) {
      console.error('Save error:', error);
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

  const handleTermClick = useCallback((termKey: string) => {
    setSelectedTermKey(termKey);
    setIsWikiOpen(true);
  }, []);

  const handleSelectTerm = (termKey: string) => {
    setSelectedTermKey(termKey);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading editor...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a' }}>
      <Head>
        <title>Feather Editor</title>
      </Head>
      <header style={{
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #334155',
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={toggleMobileMenu} style={{ marginRight: '0.5rem', color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer' }} className="md-hidden">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#a78bfa' }}>
            Feather / {fictionData.frontmatter?.title || 'Untitled'}
          </h1>
        </div>
        <button onClick={() => setIsWikiOpen(!isWikiOpen)} style={{ color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer' }}>
          <BookOpen size={24} />
        </button>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <SidebarFiction
          isMobileMenuOpen={isMobileMenuOpen}
          title={fictionData.frontmatter?.title || 'Untitled Document'}
          currentWordCount={fictionData.wordCount}
        />
        {isMobileMenuOpen && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.3)' }}
            className="md-hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        <EditorAreaFiction
          initialContent={fictionData.markdownContent}
          initialFrontmatter={fictionData.frontmatter}
          knownTerms={knownTerms}
          onTermHover={handleTermHover}
          onTermLeave={handleTermLeave}
          onTermClick={handleTermClick}
          onSave={handleSaveContent}
        />
        {isWikiOpen && (
          <div style={{ display: 'flex', width: '28rem', borderLeft: '1px solid #334155' }}>
            <SidebarWiki
              terms={wikiTerms}
              onSelectTerm={handleSelectTerm}
              selectedTermKey={selectedTermKey}
              isMobileMenuOpen={true}
            />
            <WikiEditor
              terms={wikiTerms}
              selectedTermKey={selectedTermKey}
              onSave={handleSaveTerms}
              onSelectTerm={setSelectedTermKey}
              setTerms={setWikiTerms}
            />
          </div>
        )}
      </div>
      <Tooltip termInfo={hoveredTermInfo} isVisible={isTooltipVisible} />
    </div>
  );
};

export default HomePage;
