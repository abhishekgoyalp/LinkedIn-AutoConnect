import React, { useEffect, useState } from 'react';
import './Popup.css';

const Popup = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [inviteCount, setInviteCount] = useState(0);
    const maxInvitations = 100; // Example max limit for the loader (you can adjust)

    useEffect(() => {
        // Load saved state from chrome storage
        chrome.storage.sync.get(['isConnecting', 'inviteCount'], (result) => {
            setIsConnecting(result.isConnecting || false);
            setInviteCount(result.inviteCount || 0);
        });

        // Listen for messages from the content script
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === "updateInviteCount") {
                // Update the invite count when a new value is received from the content script
                setInviteCount(message.inviteCount);
            }
        });
    }, []);

    const handleStart = () => {
        setIsConnecting(true);
        chrome.storage.sync.set({ isConnecting: true });
        chrome.runtime.sendMessage({ action: 'start' });
    };

    const handleStop = () => {
        setIsConnecting(false);
        chrome.storage.sync.set({ isConnecting: false });
        chrome.runtime.sendMessage({ action: 'stop' });
    };

    // Calculate progress percentage for the loader
    const progressPercentage = Math.min((inviteCount / maxInvitations) * 100, 100);


    return (
        <div className="popup-container">
            <div className="header">
                <h1>LinkedIn AutoConnect</h1>
            </div>
            <div className="counter">
                <h2>Invitations Sent</h2>
                <div className="circle">
                    <svg className="progress-ring" width="80" height="80" viewBox="0 0 100 100">
                        <circle
                            className="progress-ring__circle"
                            stroke="white"
                            strokeWidth="4"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="progress-ring__circle--fill"
                            stroke="lightgreen"
                            strokeWidth="4"
                            fill="transparent"
                            r="45"
                            cx="50"
                            cy="50"
                            style={{
                                strokeDasharray: 2 * Math.PI * 45,
                                strokeDashoffset: ((100 - progressPercentage) / 100) * 2 * Math.PI * 45,
                            }}
                        />
                    </svg>
                    <span className="count">{inviteCount}</span>
                </div>
            </div>
            <div className="button-container">
                {isConnecting ? (
                    <button className="control-button stop-button" onClick={handleStop}>
                        STOP CONNECTING
                    </button>
                ) : (
                    <button className="control-button start-button" onClick={handleStart}>
                        START CONNECTING
                    </button>
                )}
            </div>
        </div>
    );
};

export default Popup;
