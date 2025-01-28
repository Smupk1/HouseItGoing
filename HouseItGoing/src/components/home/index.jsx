import React from 'react'
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/authContext'

const Home = () => {
    const { userLoggedIn, currentUser } = useAuth();
    if (!userLoggedIn) {
        // Redirect to the login page if the user is not logged in
        return <Navigate to="/login" replace />;
      }
    return (
        
        <div class="bg-neutral-800 flex justify-center items-center h-screen">
        <div className=' text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
        </div>
    )
}

export default Home