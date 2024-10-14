import React from 'react';

const Home = () => {
    

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Left side: Will be used for future content */}
            <div style={{ width: '20%', backgroundColor: '#f0f0f0', padding: '20px' }}>
                <h2>BOT goes here</h2>
            </div>

            {/* Right side: Display the Google Spreadsheet */}
            <div style={{ width: '80%', padding: '10px' }}>
                <h2>MAP goes here</h2>
            </div>
        </div>
    );
};

export default Home;
