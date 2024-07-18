import React, { useEffect, useState } from 'react'
import taskService from '../services/taskService'
import '../styles/Notes.css'

const Notes = ({taskId, currentUser}) => {
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState("")
    const [showNoteInput, setShowNoteInput] = useState(false)

  console.log("notes",notes)

    useEffect(() => {
      console.log("Fetching notes for taskId:", taskId);
      if(taskId){
        fetchNotes();
      }
      
    }, [taskId]);

    const fetchNotes = async () => {
      if (taskId) {
        try {
          const fetchedNotes = await taskService.getNotes(taskId);
          setNotes(fetchedNotes.notes);
        } catch (error) {
          console.log('Failed to fetch notes', error);
        }
      }
    };

    const handleAddNoteClick = (e) => {
        e.stopPropagation();
        setShowNoteInput(true);
      };

    const handleAddNotes = async(e)=>{
        e.stopPropagation()
        console.log("newNote", taskId);
        if(!newNote.trim()){
            console.log('Note Content is empty')
            return
        }
        if (!taskId) {
          console.log('taskId is undefined'); 
          return;
        }
        try {
            await taskService.createNote(taskId, newNote)         
            const fetchedNotes = await taskService.getNotes(taskId);
            setNotes(fetchedNotes.notes);
            setNewNote("")
            setShowNoteInput(false)
        } catch (error) {
            console.log('Failed to create note', error.message)
        }
    }

    // const handleDeleteNote = async(noteId)=>{
    //     try {
    //         await taskService.deleteNote(noteId)
    //         fetchNotes()
    //     } catch (error) {
    //         console.log('Failed to delete note', error.message)
    //     }
    // }

  return (
    <div className="task-notes">
      <button className="add-note-button" onClick={handleAddNoteClick}>Add Note</button>
      {showNoteInput && (
        <div className="note-input">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add your note here"
            rows="3"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={handleAddNotes}>Save Note</button>
        </div>
      )}
      <div className="notes-list">
        {notes.map((note, index) => (
          <div key={note.id} className="task-note">
            <span className="note-text">{index + 1}. {note.note}</span>
            <span className="note-time">{new Date(note.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notes