import React from 'react';

function Header() {
    return (
        <header style={{
            padding: '1rem',
            backgroundColor: '#282c34',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <h1 style={{ margin: 0 }}>My Store</h1>
            <nav>
                <ul style={{
                    display: 'flex',
                    listStyle: 'none',
                    gap: '1rem',
                    margin: 0,
                    padding: 0
                }}>
                    <li>Home</li>
                    <li>Products</li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
