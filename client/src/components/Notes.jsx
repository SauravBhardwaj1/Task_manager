

import React, { useEffect, useState } from 'react'
import taskService from '../services/taskService'
import '../styles/Notes.css'
import Notification from './Notification'
import io from 'socket.io-client'

const socket = io('wss://in.fusiongrid.dev:4000',{
  transports: ['websocket', 'polling'],
});

const Notes = ({taskId, currentUser, repliedNoteNotification, onRepliedNoteNotification}) => {
    const [notes, setNotes] = useState([])
    const [replyNote, setReplyNote] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [showCompletedNotes, setShowCompletedNote] = useState(false);
    const [completedNotes, setCompletedNotes] = useState([]);
    const [showNoteInput, setShowNoteInput] = useState(false)
    const [replyContent, setReplyContent] = useState('');
    const [expandedNoteId, setExpandedNoteId] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

  // console.log("notes",notes)
  //  console.log("notes",currentUser)

    useEffect(() => {
      if(taskId){
        socket.emit('join-task', taskId)
        fetchUncompletedNotes();
      }

      socket.on('new-reply', (data)=>{
        // console.log('Received new-reply event:', data);
        const {taskId: incomingTaskId, noteId, message} = data;

        // Notify user only for the current task and other user's replies
        if(incomingTaskId === taskId){
          onRepliedNoteNotification(data.noteId, true)
          // setNotes((prevNotes) =>
          //   prevNotes.map((note) =>
          //     note.id === noteId ? { ...note, hasNewReplies: true } : note
          //   )
          // );
        }
      })
      return ()=>{
        socket.off('new-reply');
      }
    }, [taskId]);

    // const fetchNotes = async () => {
    //   if (taskId) {
    //     try {
    //       const fetchedNotes = await taskService.getNotes(taskId);
    //       setNotes(fetchedNotes.notes);

    //     } catch (error) {
    //       console.log('Failed to fetch notes', error);
    //     }
    //   }
    // };

    const fetchRepliedNotes = async (noteId) => {
      if (noteId) {
        try {
          const fetchRepliedNotes = await taskService.repliedNotes(noteId);
          // console.log("Fetched notes", fetchNotes.replies)
          setReplyNote(fetchRepliedNotes.replies);
        } catch (error) {
          console.log('Failed to fetch notes', error);
        }
      }
    };

    const fetchCompletedNotes = async()=>{

        try {
          const fetchCompletedNotes = await taskService.getCompletedNotes(taskId);
          setCompletedNotes(fetchCompletedNotes);
        } catch (error) {
          console.log('Failed to fetch completed notes', error);
        }
    }

    const fetchUncompletedNotes = async()=>{
      try {
        const unCompletedNotes = await taskService.getNotes(taskId);
        // console.log("uncompleted notes", unCompletedNotes)
        // setNotes(unCompletedNotes.notes.filter((note) => !note.completed));
        setNotes((prevNotes) => {
      const existingNotes = prevNotes.reduce((acc, note) => {
        acc[note.id] = note.hasNewReplies;
        return acc;
      }, {});
      return unCompletedNotes.notes
        .filter((note) => !note.completed)
        .map((note) => ({
          ...note,
          hasNewReplies: existingNotes[note.id] || false,
        }));
    });
      } catch (error) {
        console.error('Failed to fetch uncomplete notes', error);
      }
    }

    const handleShowCompletedNotes = () => {
      setShowCompletedNote((prev) => !prev);
      if (!showCompletedNotes){
        fetchCompletedNotes();
      }
    };

    const handleAddNoteClick = (e) => {
        e.stopPropagation();
        setShowNoteInput((prevState) => !prevState);
      };

    const handleAddNotes = async(e)=>{
        e.stopPropagation()
        if(!newNote.trim()) return

        if (!taskId) {
          // console.log('taskId is undefined');
          return;
        }
        try {
            await taskService.createNote(taskId, newNote)
            const fetchedNotes = await taskService.getNotes(taskId);
            setNotes(fetchedNotes.notes);
            fetchUncompletedNotes();
            setNotification({message: 'Note added successfully', type: 'success'});
            setNewNote("")
            setShowNoteInput(false)
        } catch (error) {
            console.log('Failed to create note', error.message)
        }
    }

    const handleDeleteNote = async(noteId)=>{
        try {
          if (window.confirm("Are you sure you want to delete this note?")) {
            await taskService.deleteNote(noteId);
          }
            fetchUncompletedNotes()
            fetchRepliedNotes(noteId)
        } catch (error) {
            console.log('Failed to delete note', error.message)
        }
    }

    const handleDeleteReply = async(replyId)=>{
      try {
          const confirmed = window.confirm("Are you sure you want to delete this reply?");
          if (!confirmed) return;

          await taskService.deleteNoteReply(replyId);
          setReplyNote((prevReplies) =>
            prevReplies.filter((reply) => reply.id !== replyId)
          );

      } catch (error) {
        console.log('Failed to delete reply', error.message)
        alert("Failed to delete the reply. Please try again.");
      }
    }

    const handleReplyToNote = async(noteId)=>{
      if(!replyContent.trim()){
        console.log('Reply Content is empty')
        return;
      }

      try {
        await taskService.createNoteReply(noteId, replyContent.trim());

        // Emit the reply event to the server
        socket.emit('reply',{
          taskId,
          noteId,
          reply: replyContent.trim(),
          user: currentUser.username
        })

        setReplyContent("")
        fetchRepliedNotes(noteId)
        fetchUncompletedNotes()
      } catch (error) {
        console.log('Failed to reply to a note',error.message);
      }
    }

    const handleMarkNoteCompleted = async(noteId, completed)=>{
      try {
        await taskService.markNoteAsCompleted(noteId, completed);
        fetchUncompletedNotes();
        fetchCompletedNotes();
        setNotification({ message: 'Note updated successfully', type: 'success' });
      } catch (error) {
        console.log('Failed to toggle note completion',error.message);
      }
    }

    // const toggleExpandeNote = (noteId)=>{
    //   setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
    //   fetchRepliedNotes(noteId)
    // }

    const handleViewReplies = async(noteId) => {
      await fetchRepliedNotes(noteId)
      onRepliedNoteNotification(noteId, false); 
      // setNotes((prevNotes) =>
      //   prevNotes.map((note) =>
      //     note.id === noteId ? { ...note, hasNewReplies: false } : note
      //   )
      // );
      setExpandedNoteId(noteId === expandedNoteId ? null : noteId);
    };

// console.log("Notes loaded",notes)
// console.log("currentUser loaded",currentUser)
  return (
    <div className="task-notes" >
      <Notification notification={notification} setNotification={setNotification} />
      <button className="add-note-button" onClick={handleAddNoteClick}>
        {showNoteInput ? 'Cancel' : 'Add Note'}
      </button>
      {showNoteInput && (
        <div className="note-input">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add your note here"
            rows="3"
            onClick={(e) => e.stopPropagation()}
          />
          <button className='save-note-btn' onClick={handleAddNotes}>Save Note</button>
        </div>
      )}
       <button className="show-note-button" onClick={handleShowCompletedNotes}>
          {showCompletedNotes ? 'Show pending Notes' : 'Show Completed Notes'}
        </button>
      <div className="notes-list">
    {(showCompletedNotes ? completedNotes : notes).map((note) => (
      <div key={note.id} className="note-card" >
        <div className="note-header" onClick={() =>
        handleViewReplies(note.id)} >
          <span className="note-created-by">Added by: {note.created_by}</span>
          <span className="note-time">{new Date(note.created_at).toLocaleString()}</span>
          {repliedNoteNotification[note.id] && expandedNoteId !== note.id && (
            <span className="notification-bell">
              <i className="fas fa-bell"></i>
            </span>
          )}
      </div>
      <div className="note-content" onClick={() =>
        handleViewReplies(note.id)}>
        <div className="note-actions">
          <input
            type="checkbox"
            checked={note.completed}
            onChange={() => handleMarkNoteCompleted(note.id, !note.completed)}
          />
        </div>
        <span className="note-text">{note.note}</span>
        {note.created_by === currentUser?.username && (
                <button
                  className="delete-note-button"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  Delete note
                </button>
              )}
          <button className="reply-button" onClick={() =>
             handleViewReplies(note.id)}
          >
            {expandedNoteId === note.id ? "Close replies" : "View replies"}
          </button>

      </div>
      {expandedNoteId === note.id && (
        <div className="note-replies">
          {replyNote.map((reply) => (
            <div key={reply.id} className="reply">
              <div className='reply-header'>
                <span className="reply-meta">
                   {reply.created_by} at {new Date(reply.created_at).toLocaleString()}
                </span>
                {reply.created_by === currentUser?.username && (
                <button
                  className='delete-reply-button'
                  onClick={()=> handleDeleteReply(reply.id)}
                >Delete Reply</button>
              )}
              </div>
              <span className="reply-content">{reply.reply}</span>
            </div>
          ))}
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
          />
          <button className="reply-button" onClick={() => handleReplyToNote(note.id)}>Submit</button>
        </div>
      )}
    </div>
  ))}
</div>
      {/* <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className='note-card'>
             <div className='note-header'>
              <span className='note-created-by'>Added by: {note.created_by}</span>
              <span className="note-time">{new Date(note.created_at).toLocaleString()}</span>
              {note.created_by === currentUser.username && (
                <button
                  className="delete-note-button"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  Delete note
                </button>
              )}
              <div className="note-actions">
              <input
                type="checkbox"
                checked={note.completed}
                onChange={() => handleMarkNoteCompleted(note.id, !note.completed)}
              />
            </div>
            </div>
            <div className='note-content' onClick={()=> toggleExpandeNote(note.id)}>

              <span className="note-text">{note.note.split("/n").map((line, idx)=>(
                <div key={idx}>{line}</div>
              ))}</span>
               <span className="note-text">
                {note.note}
              </span>
              {expandedNoteId === note.id && (
              <div className="note-replies">
                {note.replies.map((reply) => (
                  <div key={reply.id} className="reply">
                    <span className="reply-content">{reply.note}</span>
                    <span className="reply-meta">
                      - {reply.created_by} at{' '}
                      {new Date(reply.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                />
                <button onClick={() => handleReplyToNote(note.id)}>Reply</button>
              </div>
            )}
            </div>

          </div>
        ))}
      </div> */}

    </div>

  )
}

export default Notes

// import React, { memo, useEffect, useRef, useState } from "react";
// import taskService from "../services/taskService";
// import "../styles/Notes.css";
// import Notification from "./Notification";
// import io from "socket.io-client";

// const socket = io("ws://localhost:4000", {
//   transports: ["websocket", "polling"],
// });

// const Notes = memo(({ taskId, currentUser }) => {
//   const [notes, setNotes] = useState([]);
//   const [replyNote, setReplyNote] = useState([]);
//   const [newNote, setNewNote] = useState("");
//   const [showCompletedNotes, setShowCompletedNote] = useState(false);
//   const [completedNotes, setCompletedNotes] = useState([]);
//   const [showNoteInput, setShowNoteInput] = useState(false);
//   const [replyContent, setReplyContent] = useState("");
//   const [expandedNoteId, setExpandedNoteId] = useState(null);
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const notesStateRef = useRef([]);

//   // console.log("notes",notes)
//   //  console.log("notes",currentUser)

//   useEffect(() => {
//     if (taskId) {
//       socket.emit("join-task", taskId);
//       fetchUncompletedNotes();
//     }

//     socket.on("new-reply", (data) => {
//       // console.log('Received new-reply event:', data);
//       const { taskId: incomingTaskId, noteId, message } = data;

//       // Notify user only for the current task and other user's replies
//       if (incomingTaskId === taskId) {
//         setNotification({ message, type: "info" });
//         setNotes((prevNotes) => {
//           const updatedNotes = prevNotes.map((note) =>
//             note.id === noteId ? { ...note, hasNewReplies: true } : note
//           );

//           notesStateRef.current = updatedNotes;

//           return updatedNotes;
//         });
//       }
//     });
//     return () => {
//       socket.off("new-reply");
//     };
//   }, [taskId]);

//   const fetchRepliedNotes = async (noteId) => {
//     if (noteId) {
//       try {
//         const fetchRepliedNotes = await taskService.repliedNotes(noteId);
//         // console.log("Fetched notes", fetchNotes.replies)
//         setReplyNote(fetchRepliedNotes.replies);
//       } catch (error) {
//         console.log("Failed to fetch notes", error);
//       }
//     }
//   };

//   const fetchCompletedNotes = async () => {
//     try {
//       const fetchCompletedNotes = await taskService.getCompletedNotes(taskId);
//       setCompletedNotes(fetchCompletedNotes);
//     } catch (error) {
//       console.log("Failed to fetch completed notes", error);
//     }
//   };

//   const fetchUncompletedNotes = async () => {
//     try {
//       const unCompletedNotes = await taskService.getNotes(taskId);
//       // console.log("uncompleted notes", unCompletedNotes)
//       // setNotes(unCompletedNotes.notes.filter((note) => !note.completed));
//       setNotes((prevNotes) => {
//         const previousRepliesState = notesStateRef.current.reduce(
//           (acc, note) => {
//             acc[note.id] = note.hasNewReplies;
//             return acc;
//           },
//           {}
//         );

//         const updatedNotes = unCompletedNotes.notes.map((note) => ({
//           ...note,
//           hasNewReplies:
//             previousRepliesState[note.id] ||
//             (note.assignedUsers?.includes(currentUser.id) &&
//               note.createdBy !== currentUser.id &&
//               note.hasNewReplies),
//         }));

//         notesStateRef.current = updatedNotes;
//         return updatedNotes;
//       });
//     } catch (error) {
//       console.error("Failed to fetch uncomplete notes", error);
//     }
//   };

//   const handleShowCompletedNotes = () => {
//     setShowCompletedNote((prev) => !prev);
//     if (!showCompletedNotes) {
//       fetchCompletedNotes();
//     }
//   };

//   const handleAddNoteClick = (e) => {
//     e.stopPropagation();
//     setShowNoteInput((prevState) => !prevState);
//   };

//   const handleAddNotes = async (e) => {
//     e.stopPropagation();
//     if (!newNote.trim()) return;

//     if (!taskId) {
//       console.log("taskId is undefined");
//       return;
//     }
//     try {
//       await taskService.createNote(taskId, newNote);
//       const fetchedNotes = await taskService.getNotes(taskId);
//       setNotes(fetchedNotes.notes);
//       fetchUncompletedNotes();
//       setNotification({ message: "Note added successfully", type: "success" });
//       setNewNote("");
//       setShowNoteInput(false);
//     } catch (error) {
//       console.log("Failed to create note", error.message);
//     }
//   };

//   const handleDeleteNote = async (noteId) => {
//     try {
//       if (window.confirm("Are you sure you want to delete this note?")) {
//         await taskService.deleteNote(noteId);
//       }
//       fetchUncompletedNotes();
//       fetchRepliedNotes(noteId);
//     } catch (error) {
//       console.log("Failed to delete note", error.message);
//     }
//   };

//   const handleDeleteReply = async (replyId) => {
//     try {
//       const confirmed = window.confirm(
//         "Are you sure you want to delete this reply?"
//       );
//       if (!confirmed) return;

//       await taskService.deleteNoteReply(replyId);
//       setReplyNote((prevReplies) =>
//         prevReplies.filter((reply) => reply.id !== replyId)
//       );
//     } catch (error) {
//       console.log("Failed to delete reply", error.message);
//       alert("Failed to delete the reply. Please try again.");
//     }
//   };

//   const handleReplyToNote = async (noteId) => {
//     if (!replyContent.trim()) {
//       console.log("Reply Content is empty");
//       return;
//     }

//     try {
//       await taskService.createNoteReply(noteId, replyContent.trim());

//       // Emit the reply event to the server
//       socket.emit("reply", {
//         taskId,
//         noteId,
//         reply: replyContent.trim(),
//         user: currentUser.username,
//       });

//       setReplyContent("");
//       fetchRepliedNotes(noteId);
//       fetchUncompletedNotes();
//     } catch (error) {
//       console.log("Failed to reply to a note", error.message);
//     }
//   };

//   const handleMarkNoteCompleted = async (noteId, completed) => {
//     try {
//       await taskService.markNoteAsCompleted(noteId, completed);
//       fetchUncompletedNotes();
//       fetchCompletedNotes();
//       setNotification({
//         message: "Note updated successfully",
//         type: "success",
//       });
//     } catch (error) {
//       console.log("Failed to toggle note completion", error.message);
//     }
//   };

//   // const toggleExpandeNote = (noteId)=>{
//   //   setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
//   //   fetchRepliedNotes(noteId)
//   // }

//   const handleViewReplies = async (noteId) => {
//     await fetchRepliedNotes(noteId);
//     setExpandedNoteId(noteId);

//     // Mark replies as viewed but keep the bell state unaffected
//     setNotes((prevNotes) => {
//       const updatedNotes = prevNotes.map((note) =>
//         note.id === noteId ? { ...note, hasNewReplies: false } : note
//       );

//       // Update notesStateRef when marking replies as viewed
//       notesStateRef.current = updatedNotes;
//       return updatedNotes;
//     });
    
//   };

//   // console.log("Notes loaded",notes)
//   // console.log("currentUser loaded",currentUser)
//   return (
//     <div className="task-notes">
//       <Notification
//         notification={notification}
//         setNotification={setNotification}
//       />
//       <button className="add-note-button" onClick={handleAddNoteClick}>
//         {showNoteInput ? "Cancel" : "Add Note"}
//       </button>
//       {showNoteInput && (
//         <div className="note-input">
//           <textarea
//             value={newNote}
//             onChange={(e) => setNewNote(e.target.value)}
//             placeholder="Add your note here"
//             rows="3"
//             onClick={(e) => e.stopPropagation()}
//           />
//           <button className="save-note-btn" onClick={handleAddNotes}>
//             Save Note
//           </button>
//         </div>
//       )}
//       <button className="show-note-button" onClick={handleShowCompletedNotes}>
//         {showCompletedNotes ? "Show pending Notes" : "Show Completed Notes"}
//       </button>
//       <div className="notes-list">
//         {(showCompletedNotes ? completedNotes : notes).map((note) => (
//           <div key={note.id} className="note-card">
//             <div className="note-header">
//               <span className="note-created-by">
//                 Added by: {note.created_by}
//               </span>
//               <span className="note-time">
//                 {new Date(note.created_at).toLocaleString()}
//               </span>
//               {note.hasNewReplies && expandedNoteId !== note.id && (
//                 <span className="notification-bell">
//                   <i className="fas fa-bell"></i>
//                 </span>
//               )}
//             </div>
//             <div className="note-content">
//               <div className="note-actions">
//                 <input
//                   type="checkbox"
//                   checked={note.completed}
//                   onChange={() =>
//                     handleMarkNoteCompleted(note.id, !note.completed)
//                   }
//                 />
//               </div>
//               <span className="note-text">{note.note}</span>
//               {note.created_by === currentUser?.username && (
//                 <button
//                   className="delete-note-button"
//                   onClick={() => handleDeleteNote(note.id)}
//                 >
//                   Delete note
//                 </button>
//               )}
//               <button
//                 className="reply-button"
//                 onClick={() =>
//                   expandedNoteId === note.id
//                     ? setExpandedNoteId(null)
//                     : handleViewReplies(note.id)
//                 }
//               >
//                 {expandedNoteId === note.id ? "Close replies" : "View replies"}
//               </button>
//             </div>
//             {expandedNoteId === note.id && (
//               <div className="note-replies">
//                 {replyNote.map((reply) => (
//                   <div key={reply.id} className="reply">
//                     <div className="reply-header">
//                       <span className="reply-meta">
//                         - {reply.created_by} at{" "}
//                         {new Date(reply.created_at).toLocaleString()}
//                       </span>
//                       {reply.created_by === currentUser?.username && (
//                         <button
//                           className="delete-reply-button"
//                           onClick={() => handleDeleteReply(reply.id)}
//                         >
//                           Delete Reply
//                         </button>
//                       )}
//                     </div>
//                     <span className="reply-content">{reply.reply}</span>
//                   </div>
//                 ))}
//                 <textarea
//                   value={replyContent}
//                   onChange={(e) => setReplyContent(e.target.value)}
//                   placeholder="Write a reply..."
//                 />
//                 <button
//                   className="reply-button"
//                   onClick={() => handleReplyToNote(note.id)}
//                 >
//                   Submit
//                 </button>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// });

// export default Notes;