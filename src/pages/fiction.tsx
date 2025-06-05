// src/pages/fiction.tsx

import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Menu, X } from 'lucide-react';
import type { NextPage } from 'next';

import SidebarFiction from '../components/fiction/SidebarFiction';
import EditorAreaFiction from '../components/fiction/EditorAreaFiction';
import Tooltip from '../components/common/Tooltip';
import type { FictionData, KnownTerms, WikiTerms, HoveredTermInfo } from '../types';

const FictionPage: NextPage = () => {
  const [fictionData, setFictionData] = useState<FictionData>({ frontmatter: {}, markdownContent: "", wordCount: 0 });
  const [knownTerms, setKnownTerms] = useState<KnownTerms>({});
  const [hoveredTermInfo, setHoveredTermInfo] = useState<HoveredTermInfo | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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

  const fetchKnownTerms = async () => {
    try {
      const res = await fetch('/api/wiki/terms');
      if (!res.ok) throw new Error('Failed to fetch wiki terms');
      const termsData: WikiTerms = await res.json();
      const formattedTerms: KnownTerms = {};
      for (const term in termsData) {
        formattedTerms[term] = termsData[term].description;
      }
      setKnownTerms(formattedTerms);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchFictionContent(), fetchKnownTerms()]).finally(() => setIsLoading(false));
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

  const handleTermHover = useCallback((termKey: string, x: number, y: number) => {
    const description = knownTerms[termKey] || "No description available.";
    setHoveredTermInfo({ term: termKey, description, x, y });
    setIsTooltipVisible(true);
  }, [knownTerms]);

  const handleTermLeave = useCallback(() => {
    setIsTooltipVisible(false);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading editor...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a' }}>
      <Head>
        <title>Fiction Editor - Feather</title>
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
            Feather / {fictionData.frontmatter?.title || "Untitled"}
          </h1>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <SidebarFiction
          isMobileMenuOpen={isMobileMenuOpen}
          title={fictionData.frontmatter?.title || "Untitled Document"}
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
          onSave={handleSaveContent}
        />
      </div>
      <Tooltip termInfo={hoveredTermInfo} isVisible={isTooltipVisible} />
    </div>
  );
};

export default FictionPage;