import { useState } from 'react';
import { Bell, AlertTriangle, Clock, ChevronRight, X } from 'lucide-react';
import { formatCurrencyCompact } from '@/types';
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { getDueNotificationsFromData } from '@/utils/notifications';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { transactions, installmentPlans, clearedNotifications, clearNotification, clearAllNotifications } = useApp();
  
  const allNotifications = getDueNotificationsFromData(transactions, installmentPlans);
  const notifications = allNotifications.filter(n => !clearedNotifications.has(n.id));
  const overdueCount = notifications.filter(n => n.type === 'overdue').length;

  const getTimeLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (date < new Date()) return formatDistanceToNow(date, { addSuffix: true });
    return format(date, 'MMM d');
  };

  const handleNotificationClick = (transactionId: string) => {
    setIsOpen(false);
    navigate(`/transaction/${transactionId}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all",
          isOpen 
            ? "bg-primary/10 text-primary" 
            : "bg-card text-foreground hover:bg-muted"
        )}
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs font-bold",
            overdueCount > 0 
              ? "bg-destructive text-destructive-foreground animate-pulse" 
              : "bg-primary text-primary-foreground"
          )}>
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 lg:bg-transparent bg-foreground/20"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-card rounded-2xl shadow-elevated border border-border overflow-hidden animate-scale-in origin-top-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllNotifications();
                    }}
                    className="text-xs text-primary hover:underline px-2 py-1"
                  >
                    Clear all
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden p-1 rounded-lg hover:bg-muted"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <Bell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No pending notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="group relative flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <button
                        onClick={() => handleNotificationClick(notification.transactionId)}
                        className="flex-1 flex items-start gap-3 text-left min-w-0"
                      >
                        <div className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                          notification.type === 'overdue' 
                            ? "bg-destructive/10" 
                            : "bg-warning/10"
                        )}>
                          {notification.type === 'overdue' ? (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          ) : (
                            <Clock className="w-5 h-5 text-warning" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-foreground truncate">
                              {notification.title}
                            </p>
                            <span className={cn(
                              "text-xs font-semibold whitespace-nowrap",
                              notification.type === 'overdue' 
                                ? "text-destructive" 
                                : "text-warning"
                            )}>
                              {getTimeLabel(notification.dueDate)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {notification.description}
                          </p>
                          <p className="text-sm font-semibold text-foreground mt-1">
                            {formatCurrencyCompact(notification.amount)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted transition-opacity"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border bg-muted/30">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/records');
                  }}
                  className="w-full py-2 text-sm font-medium text-primary hover:underline"
                >
                  View all records
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
