import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toastService } from '../../services/toastService';

interface ToastState {
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
}

export const GlobalToast: React.FC = () => {
    const [toast, setToast] = useState<ToastState>({
        open: false,
        message: '',
        type: 'info',
        duration: 6000
    });

    useEffect(() => {
        const unsubscribe = toastService.subscribe((event) => {
            setToast({
                open: true,
                message: event.message,
                type: event.type,
                duration: event.duration || 6000
            });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setToast(prev => ({ ...prev, open: false }));
    };

    return (
        <Snackbar
            open={toast.open}
            autoHideDuration={toast.duration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
            <Alert 
                onClose={handleClose} 
                severity={toast.type} 
                sx={{ width: '100%' }}
                variant="filled"
            >
                {toast.message}
            </Alert>
        </Snackbar>
    );
};
