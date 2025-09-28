import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const useAuth = () => {
    const [username, setUsername] = useState(null);
    const [role, setRole] = useState(null);
    const [branch, setBranch] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');
        const storedBranch = localStorage.getItem('branch');

        if(!storedUsername || !storedRole) {
            navigate('/login');
        }else {
            setUsername(storedUsername);
            setRole(storedRole);
            setBranch(storedBranch);
        }
    }, [navigate]);

    return {username, role, branch};
}

export default useAuth;