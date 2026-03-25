import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import TicketService from '../services/TicketServices';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import TicketCard from './TicketCard';
import Loader from './Loader';

const MyTickets = () => {
    const user = useSelector((state) => state.user);
    const tickets = useSelector((state) => state.data);
    const isLoading = useSelector((state) => state.isLoading);
    const [message, setMessage] = useState({ text: '', type: '' });
    const dispatch = useDispatch();

    useEffect(() => {
        if (user?.token) {
            fetchTickets();
        }
    }, [user]);

    const fetchTickets = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
            const res = await TicketService.getUserTickets(user.token);
            dispatch({ type: "FETCH_SUCCESS", payload: res.data });
        } catch (err) {
            setMessage({ text: 'Failed to load tickets.', type: 'error' });
            dispatch({ type: "FETCH_FAILURE" });
        }
    };

    const handleCancel = async (ticketid) => {
        if (!window.confirm('Are you sure you want to cancel this ticket?')) return;

        try {
            await TicketService.cancelTicket(ticketid, user.token);
            dispatch({ type: "DELETE_KAYIT_SUCCESS" });
            setMessage({ text: 'Ticket cancelled successfully.', type: 'success' });
            fetchTickets();
        } catch (err) {
            setMessage({ text: 'Failed to cancel ticket.', type: 'error' });
            console.error(err);
            dispatch({ type: "DELETE_KAYIT_FAILURE" });
        }
    };

    if (isLoading) return <Loader message="Loading your tickets..." />;

    return (
        <div className="space-y-12">
            <h1 className="text-3xl md:text-4xl font-black">My Tickets</h1>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tickets.map((ticket, index) => (
                    <TicketCard key={ticket._id} ticket={ticket} index={index} onCancel={handleCancel} />
                ))}
            </div>

            {tickets.length === 0 && (
                <div className="text-center py-20 card glass border-dashed" style={{ borderWidth: '2px' }}>
                    <p className="text-slate-400 text-xl font-medium">You haven't booked any tickets yet.</p>
                </div>
            )}
        </div>
    );
};

export default MyTickets;
