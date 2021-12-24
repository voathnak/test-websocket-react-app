import React, { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { loginUser } from "./redux/usersSlice";

const Login = () => {
  const { user, status, test } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    dispatch(loginUser({ username, password }));
  };

  const onUsernameChange = (e) => {
    console.info({ username: e.target.value });
    setUsername(e.target.value);
  };

  const onPasswordChange = (e) => {
    console.info({ password: e.target.value });
    setPassword(e.target.value);
  };

  const handleKeypress = (e) => {
    console.info(e.keyCode);
    if (e.keyCode === 13) {
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
