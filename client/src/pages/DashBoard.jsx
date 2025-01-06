import React, { useEffect, useState } from 'react';
import taskService from '../services/taskService';
import { motion } from 'framer-motion';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import '../styles/Dashboard.css';
import Sidebar from '../components/Sidebar';
import EditTaskForm from '../components/EditTaskForm';
import TaskHistory from '../components/TaskHistory';
import GuestDashboard from '../components/GuestDashboard';
import Notification from '../components/Notification';
import CompletedTasks from '../components/CompletedTask';
import InProgressTasks from '../components/InProgressTask';
import Modal from '../components/Modal';

const Dashboard = ({ user }) => {
  const [userTasks, setUserTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [completedTasks, setCompletedTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('myTasks');

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const deduplicateTasks = (tasks) => {
    const taskMap = new Map();
    tasks.forEach(task => taskMap.set(task.id, task));
    return Array.from(taskMap.values());
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      if (user) {
        const userTasks = await taskService.getUserTask();
        const assignedTasks = await taskService.getAssignedTask();

        setUserTasks(deduplicateTasks(userTasks)); // Remove potential duplicates
        setAssignedTasks(deduplicateTasks(assignedTasks));

        const allTasks = [...userTasks, ...assignedTasks];
        const uniqueTasks = deduplicateTasks(allTasks);

        setCompletedTasks(uniqueTasks.filter((task) => task.status === 'Completed'));
        setInProgressTasks(uniqueTasks.filter((task) => task.status === 'In Progress'));
      }
    } catch (error) {
      alert('Failed to fetch tasks');
      setNotification({ message: 'Failed to fetch tasks', type: 'error' });
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (task) => {
    // console.log('Edit clicked', task);
    if (!task) {
      setNotification({ message: 'Task not found', type: 'error' });
      return;
    }

    if (task.can_edit) {
      setEditTask(task);
    } else {
      setNotification({ message: 'You do not have permission to edit this task', type: 'error' });
    }
  };

  const handleDelete = async (taskId) => {
    try {
      if(window.confirm('Are you sure you want to delete this task')){
        await taskService.deleteTask(taskId);
        setNotification({ message: 'Task deleted successfully', type: 'success' });
      }
      
      setUserTasks(userTasks.filter((task) => task.id !== taskId));
      setAssignedTasks(assignedTasks.filter((task) => task.id !== taskId));
      
      fetchTasks();
    } catch (error) {
      console.log('Failed to delete task:', error);
      setNotification({ message: 'Failed to delete task', type: 'error' });
    }
  };

  
const cleanTaskPayload = (task) => {
  const {
    dueDate, due_date, assignedTo, assigned_to, ...otherFields
  } = task;

  return {
    ...otherFields,
    dueDate: dueDate || due_date || null,
    assignedTo: assignedTo || assigned_to || [],
  };
};

  const handleSaveEdit = async (updatedTask) => {
    const cleanedTask = await cleanTaskPayload(updatedTask)
    try {
      await taskService.updateTask(cleanedTask.id, cleanedTask);
      setUserTasks(userTasks.map((task) => (task.id === updatedTask.id ? cleanedTask : task)));
      setAssignedTasks(assignedTasks.map((task) => (task.id === updatedTask.id ? cleanedTask : task)));
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      setNotification({ message: 'Failed to update task', type: 'error' });
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskCreated = async (newTask) => {
    try {
      const createdTask = await taskService.createTask(newTask);
      setUserTasks((prevTasks) => [...prevTasks, createdTask]);
      setNotification({ message: 'Task created successfully', type: 'success' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to create task', error);
      setNotification({ message: 'Failed to create task', type: 'error' });
    }
  };

  const handleChangeStatus = async (taskId, status) => {
    try {
      await taskService.updateTaskStatus(taskId, status);
      

      if(status === "Completed"){
        setUserTasks(userTasks.filter((task) => task.id !== taskId));
        setAssignedTasks(assignedTasks.filter((task) => task.id !== taskId));
      }else{
        const updatedTask = { ...userTasks.find((task) => task.id === taskId), status };
        setUserTasks(userTasks.map((task) => (task.id === taskId ? updatedTask : task)));
        setAssignedTasks(assignedTasks.map((task) => (task.id === taskId ? updatedTask : task)));
      }
      
      setCompletedTasks(userTasks.filter((task) => task.status === 'Completed'));
      setInProgressTasks(userTasks.filter((task) => task.status === 'In Progress'));

      setNotification({ message: 'Task status updated successfully', type: 'success' });
      fetchTasks();
    } catch (error) {
      console.log('Failed to update the task status');
      setNotification({ message: 'Failed to update the task status', type: 'error' });
    }
  };

  const handleToggleTaskForm = () => {
    setIsTaskFormVisible(!isTaskFormVisible);
  };

  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'myTasks':
        return (
          <TaskList
            tasks={deduplicateTasks(userTasks)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDelete}
            currentUser={user}
            showAssignedTo
            onStatusChange={handleChangeStatus}
          />
        );
      case 'assignedTasks':
        return (
          <TaskList
            tasks={deduplicateTasks(assignedTasks)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDelete}
            currentUser={user}
            showAssignedBy
            onStatusChange={handleChangeStatus}
          />
        );
      case 'completedTasks':
        return (
          <CompletedTasks
            tasks={deduplicateTasks(completedTasks)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDelete}
            currentUser={user}
            showAssignedTo
            onStatusChange={handleChangeStatus}
          />
        );
      case 'inProgressTasks':
        return (
          <InProgressTasks
            tasks={deduplicateTasks(inProgressTasks)}
            onEditClick={handleEditClick}
            onDeleteClick={handleDelete}
            currentUser={user}
            showAssignedTo
            onStatusChange={handleChangeStatus}
          />
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="dashboard">
        <Sidebar user={null} />
        <GuestDashboard />
      </div>
    );
  }

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="dashboard">
      <Sidebar user={user} />
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
      >
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button className="toggle-task-form" onClick={handleToggleTaskForm}>
            {isTaskFormVisible ? 'Cancel' : 'Create New Task'}
          </button>
        </div>

        <div className='tabs-container'>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'myTasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('myTasks')}
            >
              My Tasks
            </button>
            <button
              className={`tab ${activeTab === 'assignedTasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignedTasks')}
            >
              Assigned Tasks
            </button>
            <button
              className={`tab ${activeTab === 'completedTasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('completedTasks')}
            >
              Completed Tasks
            </button>
            <button
              className={`tab ${activeTab === 'inProgressTasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('inProgressTasks')}
            >
              In Progress Tasks
            </button>
          </div>
        </div>
        <div className="tab-content">
          {renderTabContent()}
        </div>

       
    {/* Scrollable Content */}
    <div className="tab-content scrolling-content">
          {/* {renderTabContent()} */}
        </div>
        
          <Modal isOpen={isTaskFormVisible} onClose={handleToggleTaskForm}>
            <TaskForm onTaskCreated={handleTaskCreated} user={user} onClose={() => setIsTaskFormVisible(false)} />
          </Modal>
      
        

        {editTask && (
          <Modal isOpen={true} onClose={() => setEditTask(null)}>
            <EditTaskForm user={user} task={editTask} onSave={handleSaveEdit} onClose={() => setEditTask(null)} />
          </Modal>
        )}
        
          <Notification notification={notification} setNotification={setNotification} />
        
      </motion.div>
    </div>
  );
};

export default Dashboard;



















// import React, { useEffect, useState } from 'react'
// import taskService from '../services/taskService'
// import {motion} from 'framer-motion'
// import TaskForm from '../components/TaskForm'
// import TaskList from '../components/TaskList'
// import '../styles/Dashboard.css'
// import Sidebar from '../components/Sidebar'
// import EditTaskForm from '../components/EditTaskForm'
// import TaskHistory from '../components/TaskHistory'
// import GuestDashboard from '../components/GuestDashboard'
// import Notification from '../components/Notification'
// import CompletedTasks from '../components/CompletedTask'
// import InProgressTasks from '../components/InProgressTask'
// import Modal from '../components/Modal'


// const Dashboard = ({ user }) => {
//   const [userTasks, setUserTasks] = useState([])
//   const [assignedTasks, setAssignedTasks] = useState([])
//   const [editTask, setEditTask] = useState(null)
//   const [taskHistory, setTaskHistory] = useState([]);
//   const [loading, setLoading] = useState(true)
//   const [isTaskFormVisible, setIsTaskFormVisible] = useState(false);
//   const [notification, setNotification] = useState({ message: '', type: '' });
//   const [completedTasks, setCompletedTasks] = useState([]);
//   const [inProgressTasks, setInProgressTasks] = useState([]);
  

//   useEffect(()=>{
//     if(user){
//       fetchTasks()
//     } 
//   },[user])


//   const fetchTasks = async ()=>{
//     setLoading(true);
//     try {
//       if(user){
//         const userTasks = await taskService.getUserTask();
//         const assignedTasks = await taskService.getAssignedTask();
//         setUserTasks(userTasks);
//         console.log("assigned tasks", assignedTasks);
//         setAssignedTasks(assignedTasks);
//         setCompletedTasks(userTasks.filter(task => task.status === 'Completed'));
//         setInProgressTasks(userTasks.filter(task => task.status === 'In Progress'));
//       }
//     } catch (error) {
//       alert("failed to fetch tasks")
//       setNotification({ message: 'Failed to fetch tasks', type: 'error' });
//       console.error('Failed to fetch tasks:', error);
//     }finally {
//       setLoading(false);
//     }
//   };

  

//   const handleEditClick = async(task)=>{
//     console.log('Edit clicked', task)
//     if (!task) {
//       setNotification({ message: 'Task not found', type: 'error' });
//       return;
//     }
  
//     // const canEditTask = task.created_by === user.id || (task.assigned_to === user.id && task.can_edit);
//     if (task.can_edit) {
//       setEditTask(task);
//     } else {
//       setNotification({ message: 'You do not have permission to edit this task', type: 'error' });
//     }
//     // const history = await taskService.getTaskhistory(task.id)
//     // setTaskHistory(history)
//   }

  
//   const handleDelete = async (taskId)=>{
//     try {
//       await taskService.deleteTask(taskId)
//       setUserTasks(userTasks.filter(task => task.id !== taskId))
//       setAssignedTasks(assignedTasks.filter(task => task.id !== taskId));
//       setNotification({ message: 'Task deleted successfully', type: 'success' });
//       fetchTasks();
//     } catch (error) {
//       console.log('Failed to delete task:', error)
//       setNotification({ message: 'Failed to delete task', type: 'error' });
//     }
//   }

//   const handleSaveEdit = async(updatedTask)=>{
//     try {
//       await taskService.updateTask(updatedTask.id, {
//         title: updatedTask.title,
//         description: updatedTask.description,
//         priority: updatedTask.priority,
//         dueDate: updatedTask.dueDate,
//         assignedTo: updatedTask.assignedTo,
//         editPermissions: updatedTask.editPermissions
//       });
//       setUserTasks(userTasks.map(task => (task.id === updatedTask.id ? updatedTask : task)))
//       setAssignedTasks(assignedTasks.map(task =>(task.id === updatedTask.id ? updatedTask : task)))
//       // setNotification({ message: 'Task updated successfully', type: 'success' });
//       setEditTask(null);
//       fetchTasks();
//     } catch (error) {
//       setNotification({ message: 'Failed to update task', type: 'error' });
//       console.error('Failed to update task:', error);
//     }
    
//   }

//   const handleTaskCreated = async (newTask) => {
//     try {
//       const createdTask = await taskService.createTask(newTask);
//       setUserTasks(prevTasks => [...prevTasks, createdTask]);
//       setNotification({ message: 'Task created successfully', type: 'success' });
//       fetchTasks();
//     } catch (error) {
//       console.error('Failed to create task', error);
//       setNotification({ message: 'Failed to create task', type: 'error' });
//     }
//   };

//   const handleChangeStatus = async(taskId, status)=>{
//     try {
//       await taskService.updateTaskStatus(taskId, status)
//       const updatedTask = {...userTasks.find(task => task.id === taskId), status}

//       console.log("updatedTask: " + updatedTask)
//       setUserTasks(userTasks.map((task) => (task.id === taskId ? updatedTask : task)));
//       setAssignedTasks(assignedTasks.map((task) => (task.id === taskId ? updatedTask : task)));

//       setCompletedTasks(userTasks.filter(task => task.status === 'Completed'));
//       setInProgressTasks(userTasks.filter(task => task.status === 'In Progress'));
  

//       setNotification({ message: 'Task status updated successfully', type: 'success'})
//       fetchTasks();
//     } catch (error) {
//       console.log('Failed to update the task status')
//       setNotification({ message: 'Failed to update the task status', type: 'error' });
//     }
//   }

// const handleToggleTaskForm = ()=>{
//   setIsTaskFormVisible(!isTaskFormVisible)
// }

//   if (!user) {
//     return (
//       <div className="dashboard">
//         <Sidebar user={null} />
//         <GuestDashboard />
//       </div>
//     );
//   }

//   if (loading) {
//     return <div>Loading tasks...</div>;
//   }
//   return ( 
//     <div className='dashboard'>
//       <Sidebar user={user} />
//       <motion.div
//         className='dashboard-container'
//         initial={{ opacity: 0, y: -50}}
//         animate={{ opacity: 1, y: 0}}
//         exit={{ opacity: 0, y:50}}  
//       >

//         <div className="dashboard-header">
//           <h1>Dashboard</h1>
//           <button className="toggle-task-form" onClick={handleToggleTaskForm}>
//             {isTaskFormVisible ? "Cancel" : "Create New Task" }
//           </button>
//         </div>

//         {/* {isTaskFormVisible && <TaskForm onTaskCreated={handleTaskCreated} />} */}

//         <div className="task-section">
//           <div className="task-list-container">
//             <h2>My Tasks</h2>
//               {loading? (
//                 <p>Loading tasks...</p>
//               ):(
//               <TaskList  
//                 tasks={userTasks}
//                 onEditClick={handleEditClick}
//                 onDeleteClick={handleDelete}
//                 currentUser={user}
//                 showAssignedTo
//                 onStatusChange={handleChangeStatus}
                 
//               />
//               )}            
//           </div>

//           <div className="task-list-container">
//             <h2>Assigned Tasks</h2>
//               {loading ? (
//               <p>Loading tasks...</p>
//             ) : (
//               <TaskList
//                 tasks={assignedTasks}
//                 onEditClick={handleEditClick}
//                 onDelete={handleDelete}
//                 currentUser={user}
//                 showAssignedBy
//                 onChangeStatus={handleChangeStatus}
//               />
//             )}
//           </div>
//         </div>

//         <CompletedTasks
//           tasks={completedTasks}
//           onEditClick={handleEditClick}
//           onDeleteClick={handleDelete}
//           currentUser={user}
//           showAssignedTo
//           onStatusChange={handleChangeStatus}
//         />
//         <InProgressTasks
//           tasks={inProgressTasks}
//           onEditClick={handleEditClick}
//           onDeleteClick={handleDelete}
//           currentUser={user}
//           showAssignedTo
//           onStatusChange={handleChangeStatus}
//         />

//         <Notification notification={notification} setNotification={setNotification} />

//         <Modal isOpen={isTaskFormVisible} onClose={handleToggleTaskForm}>
//           <TaskForm onTaskCreated={handleTaskCreated} onClose={() => setIsTaskFormVisible(false)} />
//         </Modal>

//         {editTask && (
//           <Modal isOpen={true} onClose={() => setEditTask(null)}>
//             <EditTaskForm user={user} task={editTask} onSave={handleSaveEdit} onClose={()=>setEditTask(null)} />
//           </Modal>
//         )}

//         {taskHistory.length > 0 && (
//           <TaskHistory history={taskHistory} />
//         )}

//       </motion.div>
//     </div>
//   )
// }

// export default Dashboard