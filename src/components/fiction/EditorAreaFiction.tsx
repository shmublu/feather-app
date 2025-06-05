// src/components/fiction/EditorAreaFiction.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit3, PlusCircle, X } from 'lucide-react';
import styles from './EditorAreaFiction.module.css';
import type { Frontmatter, KnownTerms } from '../../types';

// TermHighlight Component Props
interface TermHighlightProps {
  children: React.ReactNode;
  termKey: string;
  onMouseEnter: (termKey: string, x: number, y: number) => void;
  onMouseLeave: () => void;
}

const TermHighlight: React.FC<TermHighlightProps> = ({ children, termKey, onMouseEnter, onMouseLeave }) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    onMouseEnter(termKey, e.clientX, e.clientY);
  };
  return (
    <span
      className={styles.termHighlight}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </span>
  );
};

// EditorAreaFiction Component Props
interface EditorAreaFictionProps {
  initialContent: string;
  initialFrontmatter: Frontmatter;
  knownTerms: KnownTerms;
  onTermHover: (termKey: string, x: number, y: number) => void;
  onTermLeave: () => void;
  onSave: (newMarkdownContent: string, newFrontmatter: Frontmatter) => Promise<void>;
}

const EditorAreaFiction: React.FC<EditorAreaFictionProps> = ({
  initialContent,
  initialFrontmatter,
  knownTerms,
  onTermHover,
  onTermLeave,
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

  const renderers = useMemo(() => ({
    text: ({ children }: { children: string }) => {
      const tokens = children.split(/(\s+)/);
      return (
        <>
          {tokens.map((token, idx) => {
            const clean = token.replace(/[^\w]/g, '');
            if (knownTerms[clean]) {
              return (
                <TermHighlight
                  key={idx}
                  termKey={clean}
                  onMouseEnter={onTermHover}
                  onMouseLeave={onTermLeave}
                >
                  {token}
                </TermHighlight>
              );
            }
            return <React.Fragment key={idx}>{token}</React.Fragment>;
          })}
        </>
      );
    },
  }), [knownTerms, onTermHover, onTermLeave]);

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
                 <ReactMarkdown components={renderers}>{editableContent}</ReactMarkdown>
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