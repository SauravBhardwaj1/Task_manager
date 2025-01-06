import React from 'react'
import { Navigate, Outlet} from 'react-router-dom'

const ProtectedRoute = ({ user, children, ...rest}) => {
    return user ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute