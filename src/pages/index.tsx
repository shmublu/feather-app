// src/pages/index.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { BookOpen } from 'lucide-react';
import type { NextPage } from 'next';

import EditorAreaFiction from '../components/fiction/EditorAreaFiction';
import SidebarTabs from '../components/common/SidebarTabs';
import WikiEditor from '../components/wiki/WikiEditor';
import Tooltip from '../components/common/Tooltip';
import type { FictionData, KnownTerms, WikiTerms, HoveredTermInfo } from '../types';

const HomePage: NextPage = () => {
  const [fictionData, setFictionData] = useState<FictionData>({ frontmatter: {}, markdownContent: '', wordCount: 0 });
  const [knownTerms, setKnownTerms] = useState<KnownTerms>({});
  const [hoveredTermInfo, setHoveredTermInfo] = useState<HoveredTermInfo | null>(null);
  const [wikiTerms, setWikiTerms] = useState<WikiTerms>([]);
  const [selectedTermKey, setSelectedTermKey] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState<boolean>(false);
  const [isWikiOpen, setIsWikiOpen] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'fiction' | 'wiki'>('fiction');
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
      const normalized = termsData.map(term => ({ ...term, title: term.title || term.text }));
      setWikiTerms(normalized);
      const formatted: KnownTerms = {};
      normalized.forEach(term => {
        formatted[term.text] = term.description;
      });
      setKnownTerms(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  const buildWiki = async () => {
    try {
      await fetch('/api/wiki/build', { method: 'POST' });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchFictionContent();
      await buildWiki();
      await fetchWikiTerms();
      setIsLoading(false);
      setActiveSidebarTab('fiction');
    };
    void load();
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
      const normalized = (result.terms as WikiTerms).map(t => ({ ...t, title: t.title || t.text }));
      setWikiTerms(normalized);
      const formatted: KnownTerms = {};
      normalized.forEach(term => {
        formatted[term.text] = term.description;
      });
      console.log('updatedTerms', updatedTerms);
      console.log('wikiTerms', result.terms);
      console.log('formatted', formatted);
      setKnownTerms(formatted);
      alert('Wiki terms saved!');
      return true;
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save wiki terms.');
      return false;
    }
  };

  const handleTermHover = useCallback((termKey: string, x: number, y: number, style: 'purple' | 'yellow' = 'purple', description: string = '') => {
    description = description || knownTerms[termKey] || 'No description available.';
    setHoveredTermInfo({ term: termKey, description, x, y, style });
    setIsTooltipVisible(true);
  }, [knownTerms]);

  const handleTermLeave = useCallback(() => {
    setIsTooltipVisible(false);
  }, []);

  const handleTermClick = useCallback((termKey: string) => {
    setSelectedTermKey(termKey);
    setIsWikiOpen(true);
    setActiveSidebarTab('wiki');
  }, []);

  const handleSelectTerm = (termKey: string | null) => {
    setSelectedTermKey(termKey);
    if (termKey !== null) {
      setIsWikiOpen(true);
      // setActiveSidebarTab('wiki');
    }
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#a78bfa' }}>
            Feather / {fictionData.frontmatter?.title || 'Untitled'}
          </h1>
        </div>
        <button
          onClick={() => {
            setIsWikiOpen(!isWikiOpen);
            setActiveSidebarTab('wiki');
          }}
          style={{ color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <BookOpen size={24} />
        </button>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <SidebarTabs
          isMobileMenuOpen={false}
          fictionTitle={fictionData.frontmatter?.title || 'Untitled Document'}
          fictionWordCount={fictionData.wordCount}
          wikiTerms={wikiTerms}
          selectedTermKey={selectedTermKey}
          onSelectTerm={handleSelectTerm}
          activeTab={activeSidebarTab}
          onTabChange={setActiveSidebarTab}
        />
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
