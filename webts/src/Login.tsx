import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { RootState } from './redux';
import { loginUser } from './redux/usersSlice';

const Login = () => {
  const { user, status, test } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = () => {
    dispatch(loginUser({ username, password }));
  };

  const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.info({ username: e.currentTarget.value });
    setUsername(e.currentTarget.value);
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.info({ password: e.currentTarget.value });
    setPassword(e.currentTarget.value);
  };

  const handleKeypress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.info(e.key);
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div>
      <div>
        <p>user: {user.token}</p>
      </div>
      <div>
        <p>status: {status}</p>
      </div>
      <div>
        <p>test: {test}</p>
      </div>
      <div>
        <input
          name="username"
          onChange={onUsernameChange}
          onKeyDown={handleKeypress}
        />
      </div>
      <div>
        <input
          name="password"
          onChange={onPasswordChange}
          onKeyDown={handleKeypress}
        />
      </div>
      <div>
        <button type="button" onClick={onSubmit}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
