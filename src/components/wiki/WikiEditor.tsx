// src/components/wiki/WikiEditor.tsx

import React, { useState, useEffect } from 'react';
import styles from './WikiEditor.module.css';
import { PlusCircle, Save, Trash2, Edit2 } from 'lucide-react';
import type { WikiTerms } from '../../types';

interface WikiEditorProps {
  terms: WikiTerms;
  selectedTermKey: string | null;
  onSave: (updatedTerms: WikiTerms) => Promise<boolean>;
  onSelectTerm: React.Dispatch<React.SetStateAction<string | null>>;
  setTerms: React.Dispatch<React.SetStateAction<WikiTerms>>;
}

const WikiEditor: React.FC<WikiEditorProps> = ({ terms, selectedTermKey, onSave, onSelectTerm, setTerms }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentText, setCurrentText] = useState<string>('');
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentPreceding, setCurrentPreceding] = useState<string>('');
  const [currentAliases, setCurrentAliases] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);


  useEffect(() => {
    console.log('wikieditor terms', terms);
    console.log('wikieditor selectedTermKey', selectedTermKey);
    const hasTerm = terms.find(term => term.text === selectedTermKey);
    if (selectedTermKey && hasTerm && !isAddingNew) {
      setCurrentTitle(hasTerm.title || hasTerm.text);
      setCurrentText(hasTerm.text);
      setCurrentDescription(hasTerm.description || '');
      setCurrentAliases(hasTerm.aliases?.join(', ') || '');
      setCurrentCategory(hasTerm.category || '');
      setCurrentPreceding(hasTerm.preceding || '');
      setCurrentAliases(hasTerm.aliases?.join(', ') || '');
      setIsEditing(false);
    } else if (!selectedTermKey && !isAddingNew) {
      setCurrentTitle('');
      setCurrentText('');
      setCurrentDescription('');
      setCurrentAliases('');
      setCurrentCategory('');
      setCurrentPreceding('');
      setCurrentAliases('');
      setIsEditing(false);
    }
  }, [selectedTermKey, terms, isAddingNew]);

  const handleEdit = () => {
    setIsAddingNew(false);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    console.log('wikieditor handleSaveEdit', currentTitle, selectedTermKey);
    if (!currentTitle.trim() || !currentText.trim()) {
      alert("Term name cannot be empty.");
      return;
    }
    const updatedTerms = [...terms];

    const hasTerm = terms.find(term => term.text === currentText);
    if (selectedTermKey && selectedTermKey !== currentText && hasTerm) {
      alert(`A term named "${currentText}" already exists.`);
      return;
    }

    if (selectedTermKey && selectedTermKey !== currentText) {
      updatedTerms.splice(updatedTerms.findIndex(term => term.text === selectedTermKey), 1);
    }

    updatedTerms.push({
      text: currentText,
      title: currentTitle,
      description: currentDescription,
      category: currentCategory,
      preceding: currentPreceding,
      aliases: currentAliases.split(',').map(a => a.trim()).filter(Boolean),
    });

    const success = await onSave(updatedTerms);
    if (success) {
      setIsEditing(false);
      setIsAddingNew(false);
      if (selectedTermKey !== currentText) {
        onSelectTerm(currentText);
      }
    }
  };
  
  const handleAddNewStart = () => {
    setIsAddingNew(true);
    setIsEditing(true);
    onSelectTerm(null);
    setCurrentTitle('');
    setCurrentText('');
    setCurrentDescription('');
    setCurrentAliases('');
    setCurrentCategory('');
    setCurrentPreceding('');
  };

  const handleDelete = async () => {
    if (!selectedTermKey || !terms[selectedTermKey]) return;
    if (confirm(`Are you sure you want to delete "${selectedTermKey}"?`)) {
      const updatedTerms = [ ...terms ];
      updatedTerms.splice(updatedTerms.findIndex(term => term.text === selectedTermKey), 1);
      const success = await onSave(updatedTerms);
      if (success) {
        setTerms(updatedTerms);
        onSelectTerm(updatedTerms[0].text || null);
      }
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setIsAddingNew(false);
    const hasTerm = terms.find(term => term.text === selectedTermKey);
    if (selectedTermKey && hasTerm) {
      setCurrentTitle(hasTerm.title || hasTerm.text);
      setCurrentText(hasTerm.text);
      setCurrentDescription(hasTerm.description);
      setCurrentAliases(hasTerm.aliases?.join(', ') || '');
      setCurrentCategory(hasTerm.category);
      setCurrentPreceding(hasTerm.preceding);
    } else {
      setCurrentTitle('');
      setCurrentText('');
      setCurrentDescription('');
      setCurrentAliases('');
      setCurrentCategory('');
    }
  };

  if (!selectedTermKey && !isAddingNew) {
    return (
      <main className={`${styles.editorContainer} ${styles.emptyState}`}>
        <p>Select a term to view or edit, or add a new one.</p>
        <button className={`button-base ${styles.actionButton}`} onClick={handleAddNewStart}>
          <PlusCircle size={18} /> Add New Term
        </button>
      </main>
    );
  }

  return (
    <main className={styles.editorContainer}>
      <div className={styles.header}>
        {isEditing ? (
          <input
            type="text"
            value={currentTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentTitle(e.target.value)}
            placeholder="Title"
            className={`input-base ${styles.titleInput}`}
          />
        ) : (
          <h2 className={styles.termTitle}>{currentTitle || "New Term"}</h2>
        )}
        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button className={`button-base ${styles.actionButton} ${styles.saveButton}`} onClick={handleSaveEdit}>
                <Save size={18} /> Save
              </button>
              <button className={`button-base ${styles.actionButton} ${styles.cancelButton}`} onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
             selectedTermKey && (
              <>
                <button className={`button-base ${styles.actionButton}`} onClick={handleEdit}>
                  <Edit2 size={18} /> Edit
                </button>
                <button className={`button-base ${styles.actionButton} ${styles.deleteButton}`} onClick={handleDelete}>
                  <Trash2 size={18} /> Delete
                </button>
              </>
             )
          )}
           {!isEditing && (
             <button className={`button-base ${styles.actionButton} ${styles.addNewButtonFixed}`} onClick={handleAddNewStart}>
                <PlusCircle size={18} /> Add New
             </button>
           )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.fieldGroup}>
          <label htmlFor="term-text" className={styles.label}>Text in Story:</label>
          {isEditing ? (
            <input
              id="term-text"
              type="text"
              value={currentText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentText(e.target.value)}
              placeholder="e.g., his wife"
              className="input-base"
            />
          ) : (
            <p className={styles.fieldValue}>{currentText}</p>
          )}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="term-aliases" className={styles.label}>Other Highlights:</label>
          {isEditing ? (
            <input
              id="term-aliases"
              type="text"
              value={currentAliases}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentAliases(e.target.value)}
              placeholder="comma separated"
              className="input-base"
            />
          ) : (
            <p className={styles.fieldValue}>{currentAliases || '(none)'}</p>
          )}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="term-category" className={styles.label}>Category:</label>
          {isEditing ? (
            <input
              id="term-category"
              type="text"
              value={currentCategory}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentCategory(e.target.value)}
              placeholder="e.g., Character, Location"
              className="input-base"
            />
          ) : (
            <p className={styles.fieldValue}>{currentCategory || '(not set)'}</p>
          )}
        </div>
        <div className={styles.fieldGroup}>
          <label htmlFor="term-description" className={styles.label}>Description:</label>
          {isEditing ? (
            <textarea
              id="term-description"
              value={currentDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentDescription(e.target.value)}
              rows={10}
              placeholder="Detailed description..."
              className={`input-base ${styles.textarea}`}
            />
          ) : (
            <p className={`${styles.fieldValue} ${styles.descriptionText}`}>{currentDescription || '(no description)'}</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default WikiEditor;