import React, { useState } from 'react';
import { useAppearance } from '../../context/AppearanceContext';
import { Plus, Pin, Sparkles, Trash2, Edit3 } from 'lucide-react';

export const NotesView = () => {
  const { activeSwatch, triggerToast } = useAppearance();

  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Design Inspiration: Watercolor & Glass',
      content: 'Combine subtle golden dust, impasto brush textures, and frosted glass panels with blur 24px.',
      tag: 'Creative',
      date: 'Today',
      color: 'rgba(255, 245, 230, 0.7)'
    },
    {
      id: 2,
      title: 'Quarterly Productivity Principles',
      content: '1. Three priority outcomes per day.\n2. 25-minute uninterrupted Pomodoros.\n3. Daily gratitude and hydration.',
      tag: 'Mindset',
      date: 'Nov 15',
      color: 'rgba(235, 245, 255, 0.7)'
    },
    {
      id: 3,
      title: 'Palette Tone Harmonies',
      content: 'Cream, pastel yellow (#fff4cc), lavender (#ddd6fe), cyan (#67e8f9), and blush rose.',
      tag: 'Design',
      date: 'Nov 12',
      color: 'rgba(245, 235, 255, 0.7)'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const addNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;
    setNotes([
      {
        id: Date.now(),
        title: newTitle || 'Untitled Note',
        content: newContent,
        tag: 'Quick Note',
        date: 'Just now',
        color: 'rgba(255, 255, 255, 0.75)'
      },
      ...notes
    ]);
    setNewTitle('');
    setNewContent('');
    triggerToast('Note created');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
    triggerToast('Note deleted');
  };

  return (
    <div className="view-container">
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Notes</h1>
          <p className="view-subtitle">Quick ideas, watercolor memos, and thoughts</p>
        </div>
      </div>

      <div className="notes-creator-card glass-card">
        <form onSubmit={addNote} className="note-form">
          <input
            type="text"
            placeholder="Note title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="note-title-input"
          />
          <textarea
            placeholder="Write down your thoughts..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            className="note-textarea"
          />
          <div className="note-form-actions">
            <button
              type="submit"
              className="primary-glass-btn"
              style={{
                backgroundColor: activeSwatch.primary,
                boxShadow: `0 4px 12px ${activeSwatch.glow}`
              }}
            >
              <Plus size={15} />
              <span>Save Note</span>
            </button>
          </div>
        </form>
      </div>

      <div className="notes-grid">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-item-card glass-card"
            style={{ backgroundColor: note.color }}
          >
            <div className="note-card-top">
              <span className="note-tag-badge">{note.tag}</span>
              <button
                type="button"
                className="note-delete-icon"
                onClick={() => deleteNote(note.id)}
                title="Delete note"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <h3 className="note-card-title">{note.title}</h3>
            <p className="note-card-body">{note.content}</p>
            <div className="note-card-footer">
              <span>{note.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
