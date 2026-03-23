import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');
                const state = params.get('state');

                if (!code) {
                    navigate('/login');
                    return;
                }

                // Exchange code for token
                const response = await fetch('/api/auth/callback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, state }),
                });

                if (response.ok) {
                    navigate('/dashboard');
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                navigate('/login');
            }
        };

        handleCallback();
    }, [navigate]);

    return <div>Processing authentication...</div>;
}