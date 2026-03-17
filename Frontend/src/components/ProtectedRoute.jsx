import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import PageError from './PageError';
import EventService from '../services/EventServices';
import Loader from './Loader';

const ProtectedRoute = ({ children, requiredRole, requireOwnership }) => {
    const { isLoggedIn, user } = useSelector((state) => state);
    const [hasOwnership, setHasOwnership] = useState(null);
    const [loading, setLoading] = useState(requireOwnership ? true : false);

    useEffect(() => {
        const checkOwnership = async () => {
            if (requireOwnership && isLoggedIn && user?.token) {
                try {
                    const res = await EventService.getMyEvents(user.token);
                    setHasOwnership(res.data.length > 0);
                } catch (err) {
                    setHasOwnership(false);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (requireOwnership) {
            checkOwnership();
        }
    }, [isLoggedIn, user, requireOwnership]);

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <PageError 
            code="403" 
            title="Access Restricted" 
            message="Your credentials do not encompass the authorization required for this sector." 
        />;
    }

    if (requireOwnership) {
        if (loading) return <Loader message="Verifying authorization sequence..." />;
        if (!hasOwnership) {
            return <PageError 
                code="403" 
                title="Authorization Denied" 
                message="This interface is reserved for active event organizers with published experiences." 
            />;
        }
    }

    return children;
};

export default ProtectedRoute;
