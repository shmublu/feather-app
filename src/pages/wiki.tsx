// src/pages/wiki.tsx

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Menu, X } from 'lucide-react';
import type { NextPage } from 'next';

import SidebarWiki from '../components/wiki/SidebarWiki';
import WikiEditor from '../components/wiki/WikiEditor';
import type { WikiTerms } from '../types';

const WikiPage: NextPage = () => {
  const [terms, setTerms] = useState<WikiTerms>({});
  const [selectedTermKey, setSelectedTermKey] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTerms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wiki/terms');
      if (!res.ok) throw new Error('Failed to fetch terms');
      const data: WikiTerms = await res.json();
      setTerms(data);
      if (Object.keys(data).length > 0) {
        setSelectedTermKey(Object.keys(data)[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleSaveTerms = async (updatedTerms: WikiTerms): Promise<boolean> => {
    try {
      const res = await fetch('/api/wiki/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTerms),
      });
      if (!res.ok) throw new Error('Failed to save terms');
      const result = await res.json();
      setTerms(result.terms);
      alert('Wiki terms saved!');
      return true;
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save wiki terms.');
      return false;
    }
  };

  const handleSelectTerm = (termKey: string) => {
    setSelectedTermKey(termKey);
    if (window.innerWidth < 768) setIsMobileMenuOpen(false);
  };

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

  if (isLoading && Object.keys(terms).length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading wiki...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a' }}>
      <Head>
        <title>Wiki - Feather</title>
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
            Feather Wiki
          </h1>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <SidebarWiki
          terms={terms}
          onSelectTerm={handleSelectTerm}
          selectedTermKey={selectedTermKey}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        {isMobileMenuOpen && (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.3)' }}
            className="md-hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        <WikiEditor
          terms={terms}
          selectedTermKey={selectedTermKey}
          onSave={handleSaveTerms}
          onSelectTerm={setSelectedTermKey}
          setTerms={setTerms}
        />
      </div>
    </div>
  );
};

export default WikiPage;