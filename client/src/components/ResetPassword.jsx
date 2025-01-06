// import React, { useState } from 'react'
// import axios from 'axios';

// // const api_url = 'http://localhost:4000/api/users'

// const ResetPassword = () => {

//     const [newPassword, setNewpassword] = useState('')
//     const [message, setMessage] = useState('')

//     const handleSubmit = async(e)=>{
//        e.preventDefault();
//        try {
//         const token = localStorage.getItem('token')

//         const config = {
//             headers: { Authorization: `Bearer ${token}` }
//         }

//         await axios.post(`${api_url}/reset-password`,{newPassword}, config)
//         setMessage('Password updated successfully')
//        } catch (error) {
//         setMessage('Error updating password')
//        }
//     }

//   return (
//     <div>
//         <h2>Reset Password</h2>
//         <form onSubmit={handleSubmit}>
//             <label>
//                 NewPassword:
//                 <input 
//                     type="password"
//                     placeholder='enter new password'
//                     value={newPassword}
//                     onChange={(e)=> setNewpassword(e.target.value)} 
//                 />

//             </label>
//             <button type='submit'>Reset password</button>
//         </form>
//         {message && <p>{message}</p>}
//     </div>
//   )
// }

// export default ResetPassword