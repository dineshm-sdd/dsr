import { Navigate, Outlet } from "react-router-dom";
export  const PrivateRoute = ({children}) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children ? children : <Outlet/>;
}