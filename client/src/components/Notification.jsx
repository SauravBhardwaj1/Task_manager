import React, { useEffect } from 'react'
import '../styles/Notification.css';
import { AnimatePresence, motion } from 'framer-motion';

const Notification = ({ notification, setNotification}) => {

  useEffect(()=>{
    if(notification.message){
      const timer = setTimeout(()=>{
        setNotification({ message:'', type: ''})
      }, 3000)

      return ()=> clearTimeout(timer)
    }
  },[notification, setNotification])

  if(!notification.message) return null;

  return (
    <AnimatePresence>
      {notification.message && (
        <motion.div className={`notification ${notification.type}`} initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} onClick={() => setNotification({ message: '', type: '' })}>
          {notification.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Notification