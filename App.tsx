import React, { useState } from 'react';
import { useAuth } from './hooks/useAuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/ProfilePage';
import HomePage from './components/HomePage';
import ViewProfilePage from './components/ViewProfilePage';
import Navbar from './components/Navbar';
import GlobalChatPage from './components/GlobalChatPage';
import ChatPage from './components/ChatPage';
import ScripturePage from './components/ScripturePage';
import CalendarPage from './components/CalendarPage';
import { EyeIcon } from './components/icons/EyeIcon';
import { Route } from './types';

type View = 'login' | 'signup';

export default function App() {
  const { currentUser, users, theme } = useAuth();
  const [authView, setAuthView] = useState<View>('login');
  const [route, setRoute] = useState<Route>({ page: 'home' });

  const toggleAuthView = () => {
    setAuthView(authView === 'login' ? 'signup' : 'login');
  };

  const renderContent = () => {
    if (!currentUser) {
      return authView === 'login' ? (
        <LoginPage onToggleView={toggleAuthView} />
      ) : (
        <SignupPage onToggleView={toggleAuthView} />
      );
    }

    switch (route.page) {
      case 'home':
        return <HomePage setRoute={setRoute} />;
      case 'profile':
        return <ProfilePage setRoute={setRoute} />;
      case 'viewProfile':
        const userToView = users[route.username];
        if (userToView) {
            return <ViewProfilePage user={userToView} setRoute={setRoute} />;
        }
        return <HomePage setRoute={setRoute} />;
      case 'globalChat':
        return <GlobalChatPage setRoute={setRoute} />;
      case 'chat':
          const initialPartner = route.initialPartnerUsername ? users[route.initialPartnerUsername] : undefined;
          return <ChatPage initialPartner={initialPartner} setRoute={setRoute} />;
      case 'scripture':
        return <ScripturePage />;
      case 'calendar':
        return <CalendarPage />;
      default:
        return <HomePage setRoute={setRoute} />;
    }
  };

  return (
    <div className={`min-h-screen bg-background text-text-primary transition-colors duration-500 flex flex-col items-center p-4 ${theme}`}>
      <header className={`w-full p-4 flex items-center justify-center ${currentUser ? 'hidden' : ''}`}>
         <div className="flex items-center space-x-3 text-accent">
            <EyeIcon className="w-10 h-10"/>
            <h1 className="text-3xl font-bold tracking-wider">AETERIST</h1>
         </div>
      </header>
      
      {currentUser && <Navbar setRoute={setRoute} />}

      <main className="w-full max-w-4xl mx-auto mt-16">
        {renderContent()}
      </main>
    </div>
  );
}
