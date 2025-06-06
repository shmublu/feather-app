// src/components/fiction/EditorAreaFiction.tsx

import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Edit3, PlusCircle, X } from 'lucide-react';
import styles from './EditorAreaFiction.module.css';
import type { Frontmatter, KnownTerms } from '../../types';
import errors from '../../data/errors.json';

interface Error {
  preceding: string;
  text: string;
  description: string;
  category: string;
}

// EditorAreaFiction Component Props
interface EditorAreaFictionProps {
  initialContent: string;
  initialFrontmatter: Frontmatter;
  knownTerms: KnownTerms;
  onTermHover: (termKey: string, x: number, y: number, color: string, description: string) => void;
  onTermLeave: () => void;
  onTermClick?: (termKey: string) => void;
  onSave: (newMarkdownContent: string, newFrontmatter: Frontmatter) => Promise<void>;
}

const EditorAreaFiction: React.FC<EditorAreaFictionProps> = ({
  initialContent,
  initialFrontmatter,
  knownTerms,
  onTermHover,
  onTermLeave,
  onTermClick,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableContent, setEditableContent] = useState<string>(initialContent);
  const [editableFrontmatter, setEditableFrontmatter] = useState<Frontmatter>(initialFrontmatter || {});
  const [title, setTitle] = useState<string>(initialFrontmatter?.title || 'Prologue');
  const [tags, setTags] = useState<string[]>(initialFrontmatter?.tags || []);

  useEffect(() => {
    setEditableContent(initialContent);
    setEditableFrontmatter(initialFrontmatter || {});
    setTitle(initialFrontmatter?.title || 'Prologue');
    setTags(initialFrontmatter?.tags || []);
  }, [initialContent, initialFrontmatter]);

  const wordCount = useMemo(() => editableContent.split(/\s+/).filter(Boolean).length, [editableContent]);

  const processedContent = useMemo(() => {
    const content = editableContent;
    console.log('Processing content:', content); // Debug log

    // First collect all matches (both terms and errors)
    type Match = {
      start: number;
      end: number;
      text: string;
      type: 'term' | 'error';
      data: string | { description: string; category: string };
    };
    const matches: Match[] = [];

    // Process terms
    const terms = Object.keys(knownTerms);
    console.log('knownTerms', knownTerms);
    console.log('terms', terms);
    if (terms.length > 0) {
      const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          type: 'term',
          data: match[0]
        });
      }
    }

    // Process errors
    errors.forEach((error: Error) => {
      const escapedText = error.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Try to match with preceding context first
      const fullPattern = `${error.preceding}\\s*${escapedText}`;
      const fullRegex = new RegExp(fullPattern, 'gi');
      let match;
      
      while ((match = fullRegex.exec(content)) !== null) {
        const errorStart = match.index + match[0].length - error.text.length;
        matches.push({
          start: errorStart,
          end: errorStart + error.text.length,
          text: error.text,
          type: 'error',
          data: {
            description: error.description,
            category: error.category
          }
        });
      }
      
      // If no match with context, try just the error text
      if (!fullRegex.test(content)) {
        const simpleRegex = new RegExp(`\\b${escapedText}\\b`, 'gi');
        while ((match = simpleRegex.exec(content)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0],
            type: 'error',
            data: {
              description: error.description,
              category: error.category
            }
          });
        }
      }
    });

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Filter out overlapping matches (keep earlier ones)
    const filteredMatches = matches.reduce((acc: Match[], curr) => {
      const lastMatch = acc[acc.length - 1];
      if (!lastMatch || curr.start >= lastMatch.end) {
        acc.push(curr);
      }
      return acc;
    }, []);

    // Apply highlights from end to start to avoid position shifts
    let result = content;
    for (let i = filteredMatches.length - 1; i >= 0; i--) {
      const match = filteredMatches[i];
      const before = result.slice(0, match.start);
      const after = result.slice(match.end);
      if (match.type === 'term') {
        result = `${before}<span data-term="${match.data}">${match.text}</span>${after}`;
      } else {
        result = `${before}<span data-error="${encodeURIComponent(JSON.stringify(match.data))}">${match.text}</span>${after}`;
      }
    }

    return result;
  }, [editableContent, knownTerms]);

  const markdownComponents = useMemo(() => ({
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { 'data-term'?: string; 'data-error'?: string }) => {
      const term = props['data-term'];
      const error = props['data-error'];

      if (error) {
        const errorData = JSON.parse(decodeURIComponent(error));
        const handleErrorHover = (e: React.MouseEvent<HTMLSpanElement>) => {
          onTermHover(errorData.description, e.clientX, e.clientY, 'yellow', errorData.description);
        };
        return (
          <span
            {...props}
            className={styles.errorHighlight}
            onMouseEnter={handleErrorHover}
            onMouseLeave={onTermLeave}
          >
            {children}
          </span>
        );
      }

      if (term) {
        const handleEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
          onTermHover(term, e.clientX, e.clientY, 'purple', knownTerms[term]);
        };
        const handleClick = () => onTermClick?.(term);
        return (
          <span
            {...props}
            className={styles.termHighlight}
            onMouseEnter={handleEnter}
            onMouseLeave={onTermLeave}
            onClick={handleClick}
          >
            {children}
          </span>
        );
      }
      return <span {...props}>{children}</span>;
    },
  }), [onTermHover, onTermLeave, onTermClick, knownTerms]);

  const handleSave = () => {
    const updatedFrontmatter: Frontmatter = { ...editableFrontmatter, title, tags };
    onSave(editableContent, updatedFrontmatter);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    }
    setIsEditing(!isEditing);
  };
  
  const addTag = () => {
    const newTag = prompt("Enter new tag:");
    if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <main className={styles.editorArea}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitleSection}>
            {isEditing ? (
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} 
                    className={`${styles.titleInput} input-base`}
                />
            ) : (
                <h2 className={styles.chapterTitle}>{title}</h2>
            )}
            <div className={styles.toolbarInfo}>
                <span className={styles.wordCount}>1 chapter - {wordCount} Words</span>
                <Edit3 size={18} className={styles.editIcon} onClick={handleEditToggle} />
            </div>
        </div>
      </div>
      
      <div className={styles.contentSection}>
        <div className={styles.sceneCard}>
            <div className={styles.sceneHeader}>
                <h3 className={styles.sceneTitle}>Scene 1 - {wordCount} Words</h3>
                <div className={styles.tagsContainer}>
                    {tags.map(tag => (
                        <span key={tag} className={styles.tag} onClick={() => isEditing && removeTag(tag)}>
                            {tag} {isEditing && <X size={12}/>}
                        </span>
                    ))}
                    {isEditing && (
                        <button onClick={addTag} className={styles.addLabelButton}>+ Label</button>
                    )}
                </div>
            </div>

            {isEditing ? (
              <textarea
                className={styles.editTextarea}
                value={editableContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditableContent(e.target.value)}
                rows={20}
              />
            ) : (
              <div className={styles.contentViewerText}>
                 <ReactMarkdown rehypePlugins={[rehypeRaw]} components={markdownComponents}>{processedContent}</ReactMarkdown>
              </div>
            )}
             {isEditing && (
                <button onClick={handleSave} className={`button-base ${styles.saveButton}`}>Save Changes</button>
            )}

            <div className={styles.sceneFooter}>
                <button className={styles.newSceneButton} onClick={() => alert("New Scene (Not Implemented)")}>
                    <PlusCircle size={16} style={{marginRight: '0.25rem'}} /> New Scene
                </button>
            </div>
        </div>
      </div>
    </main>
  );
};

export default EditorAreaFiction;
