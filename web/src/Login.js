import React from "react";

import { useDispatch, useSelector } from "react-redux";

import { loginUser } from "./redux/usersSlice";

const Login = () => {
  const { user, status, test } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const onSubmit = () => {
    dispatch(loginUser());
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
        <input name="username" />
      </div>
      <div>
        <input name="password" />
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
