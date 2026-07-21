import { useState, useEffect } from "react";
import api from "../api/axios";
import useSocket from "../hooks/useSocket";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const socketRef = useSocket();

  useEffect(() => {
    api.get("/notifications").then(({ data }) => setNotifications(data));
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.on("new_notification", (notif) => setNotifications((prev) => [notif, ...prev]));
    return () => socket.off("new_notification");
  }, [socketRef]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-slate-100">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
          <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
            <span className="font-medium text-slate-800 text-sm">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n._id} className={`px-4 py-3 text-sm border-b border-slate-50 ${!n.isRead ? "bg-blue-50" : ""}`}>
                {n.message}
              </div>
            ))}
            {!notifications.length && <p className="p-4 text-sm text-slate-500">No notifications</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
