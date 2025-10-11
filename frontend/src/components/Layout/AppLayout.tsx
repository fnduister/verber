import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const location = useLocation();

    // Determine if we should show the header
    // Show header on all pages except specific test routes or error pages
    const shouldShowHeader = !location.pathname.startsWith('/test');

    return (
        <div>
            {shouldShowHeader && <Header />}
            <main>{children}</main>
        </div>
    );
};

export default AppLayout;