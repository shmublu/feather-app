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
  const [currentTerm, setCurrentTerm] = useState<string>('');
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  useEffect(() => {
    if (selectedTermKey && terms[selectedTermKey] && !isAddingNew) {
      setCurrentTerm(selectedTermKey);
      setCurrentDescription(terms[selectedTermKey].description || '');
      setCurrentCategory(terms[selectedTermKey].category || '');
      setIsEditing(false);
    } else if (!selectedTermKey && !isAddingNew) {
      setCurrentTerm('');
      setCurrentDescription('');
      setCurrentCategory('');
      setIsEditing(false);
    }
  }, [selectedTermKey, terms, isAddingNew]);

  const handleEdit = () => {
    setIsAddingNew(false);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!currentTerm.trim()) {
      alert("Term name cannot be empty.");
      return;
    }
    const updatedTerms = { ...terms };

    if (selectedTermKey && selectedTermKey !== currentTerm && terms[currentTerm]) {
      alert(`A term named "${currentTerm}" already exists.`);
      return;
    }

    if (selectedTermKey && selectedTermKey !== currentTerm) {
      delete updatedTerms[selectedTermKey];
    }
    
    updatedTerms[currentTerm] = {
      description: currentDescription,
      category: currentCategory,
    };

    const success = await onSave(updatedTerms);
    if (success) {
      setIsEditing(false);
      setIsAddingNew(false);
      if (selectedTermKey !== currentTerm) {
        onSelectTerm(currentTerm);
      }
    }
  };
  
  const handleAddNewStart = () => {
    setIsAddingNew(true);
    setIsEditing(true);
    onSelectTerm(null);
    setCurrentTerm('');
    setCurrentDescription('');
    setCurrentCategory('');
  };

  const handleDelete = async () => {
    if (!selectedTermKey || !terms[selectedTermKey]) return;
    if (confirm(`Are you sure you want to delete "${selectedTermKey}"?`)) {
      const updatedTerms = { ...terms };
      delete updatedTerms[selectedTermKey];
      const success = await onSave(updatedTerms);
      if (success) {
        setTerms(updatedTerms);
        onSelectTerm(Object.keys(updatedTerms)[0] || null);
      }
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setIsAddingNew(false);
    if (selectedTermKey && terms[selectedTermKey]) {
      setCurrentTerm(selectedTermKey);
      setCurrentDescription(terms[selectedTermKey].description);
      setCurrentCategory(terms[selectedTermKey].category);
    } else {
      setCurrentTerm('');
      setCurrentDescription('');
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
            value={currentTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentTerm(e.target.value)}
            placeholder="Term Name"
            className={`input-base ${styles.titleInput}`}
          />
        ) : (
          <h2 className={styles.termTitle}>{currentTerm || "New Term"}</h2>
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