import { Toaster } from 'react-hot-toast';
import React from 'react';
import './App.css';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import { CodeProvider, useCode } from './context/CodeContext';

function App() {
    return (
        <CodeProvider>
            <AppContent />
        </CodeProvider>
    );
}

function AppContent() {
    const { isDarkTheme } = useCode();

    return (
        <div className={`min-h-screen ${isDarkTheme ? 'bg-[#1e1e1e]' : 'bg-[#ffffff]'} text-gray-300`}>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #404040',
                    },
                }}
            />

            <div className="">
                <div className={`layout-container ${isDarkTheme ? 'dark' : 'light'}`}>
                    <div className={`main-content ${isDarkTheme ? 'dark' : 'light'}`}>
                        <Header />
                        <CodeEditor />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
