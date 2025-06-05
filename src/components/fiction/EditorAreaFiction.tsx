// src/components/fiction/EditorAreaFiction.tsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { marked } from 'marked';
import { Edit3, PlusCircle, X } from 'lucide-react';
import styles from './EditorAreaFiction.module.css';
import type { Frontmatter, KnownTerms } from '../../types';

// EditorAreaFiction Component Props
interface EditorAreaFictionProps {
  initialContent: string;
  initialFrontmatter: Frontmatter;
  knownTerms: KnownTerms;
  onTermHover: (termKey: string, x: number, y: number) => void;
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
  // Start in editing mode so users can modify the text immediately
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [editableContent, setEditableContent] = useState<string>(initialContent);
  const [editableFrontmatter, setEditableFrontmatter] = useState<Frontmatter>(initialFrontmatter || {});
  const [title, setTitle] = useState<string>(initialFrontmatter?.title || 'Prologue');
  const [tags, setTags] = useState<string[]>(initialFrontmatter?.tags || []);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditableContent(initialContent);
    setEditableFrontmatter(initialFrontmatter || {});
    setTitle(initialFrontmatter?.title || 'Prologue');
    setTags(initialFrontmatter?.tags || []);
  }, [initialContent, initialFrontmatter]);

  const wordCount = useMemo(() => {
    const text = editableContent.replace(/<[^>]+>/g, '');
    return text.split(/\s+/).filter(Boolean).length;
  }, [editableContent]);

  const processedContent = useMemo(() => {
    const terms = Object.keys(knownTerms);
    if (terms.length === 0) return editableContent;
    // remove existing highlights before reapplying
    const clean = editableContent.replace(/<span data-term=".*?">(.*?)<\/span>/gi, '$1');
    const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
    return clean.replace(regex, match => `<span data-term="${match}">${match}</span>`);
  }, [editableContent, knownTerms]);

  const markdownComponents = useMemo(() => ({
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { 'data-term'?: string }) => {
      const term = props['data-term'];
      if (term) {
        const handleEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
          onTermHover(term, e.clientX, e.clientY);
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
  }), [onTermHover, onTermLeave, onTermClick]);

  const handleSave = () => {
    const updatedFrontmatter: Frontmatter = { ...editableFrontmatter, title, tags };
    const htmlContent = editorRef.current?.innerHTML || editableContent;
    setEditableContent(htmlContent);
    onSave(htmlContent, updatedFrontmatter);
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
              <div
                ref={editorRef}
                className={styles.contentViewerText}
                contentEditable
                suppressContentEditableWarning
                onInput={() => setEditableContent(editorRef.current?.innerHTML || '')}
                dangerouslySetInnerHTML={{ __html: marked(processedContent) }}
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
